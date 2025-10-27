// /app/api/token/route.ts
import { NextResponse } from "next/server"
import {
  createParticipantToken,
  getRoomHostIdentity,
  setRoomHostIfEmpty,
  ensureRoomHostMetadata,
} from "@/lib/livekit-server"

/**
 * Host gating rules:
 * - We NEVER auto-assign host to the first caller.
 * - Host is assigned only when the request includes either:
 *     A) creator=1   (simple flag you add only on the creator’s flow)
 *     B) hostSecret=<env value> (optional stronger check)
 * - If no host has been assigned yet and caller doesn't claim host, they join as guest backstage.
 *
 * Endpoints:
 *  GET /api/token?roomName=R&participantName=N&checkHost=true
 *      -> { isHost: boolean }
 *
 *  GET /api/token?roomName=R&participantName=N[&creator=1|&hostSecret=...]
 *      -> { token }
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const roomName = searchParams.get("roomName") ?? ""
    const participantName = searchParams.get("participantName") ?? ""
    const participantId = searchParams.get("participantId") ?? "" // Unique ID from client
    const checkHost = searchParams.get("checkHost") === "true"
    const creatorFlag = searchParams.get("creator") === "1"
    const hostSecretParam = searchParams.get("hostSecret") || ""
    const hostSecretEnv = process.env.ROOM_HOST_SECRET || "" // optional, set if you want a secret

    const missing: string[] = []
    if (!roomName) missing.push("roomName")
    if (!participantName) missing.push("participantName")
    if (!participantId) missing.push("participantId")

    const envMissing =
      !process.env.LIVEKIT_API_KEY ||
      !process.env.LIVEKIT_API_SECRET ||
      (!process.env.LIVEKIT_HOST && !process.env.NEXT_PUBLIC_LIVEKIT_URL)

    if (missing.length > 0 || envMissing) {
      return NextResponse.json(
        {
          error: "Bad request / missing configuration",
          missing: [
            ...missing,
            ...(envMissing ? ["LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_HOST or NEXT_PUBLIC_LIVEKIT_URL"] : []),
          ],
        },
        { status: 400 },
      )
    }

    // Use participantId as the unique identity to prevent duplicate identity conflicts
    // participantName is used only for display purposes
    const identity = participantId

    // Current persisted host, if any
    const persistedHost = await getRoomHostIdentity(roomName)

    if (checkHost) {
      // Only true if the room already has a host and it's THIS identity.
      const isHost = !!persistedHost && persistedHost === identity
      return NextResponse.json({ isHost })
    }

    // Determine if this caller is allowed to (claim or already is) host.
    const callerHasSecret = hostSecretEnv && hostSecretParam && hostSecretParam === hostSecretEnv
    const callerClaimsHost = creatorFlag || callerHasSecret

    let isHost = false
    let hostIdentity = persistedHost || null

    if (!persistedHost) {
      // No host yet. Only assign host if caller explicitly claims it.
      if (callerClaimsHost) {
        try {
          hostIdentity = await setRoomHostIfEmpty(roomName, identity)
          isHost = hostIdentity === identity
        } catch (error: any) {
          // Room doesn't exist yet - that's OK, it will be created on first join
          console.log(`[token] Room ${roomName} doesn't exist yet, will be created on join`)
          hostIdentity = identity
          isHost = true
        }
      } else {
        // No host assigned yet AND caller is not creator → they are guest backstage.
        isHost = false
      }
    } else {
      // Host already assigned; only that identity is host.
      isHost = persistedHost === identity
    }

    // onStage rule: host → true, everyone else → false
    const onStage = isHost

    const token = await createParticipantToken({
      roomName,
      identity,
      name: participantName,
      metadata: { isHost, onStage },
      canPublish: true,
      canSubscribe: true,
    })

    // If we just set a host, persist it in room metadata (best-effort).
    if (hostIdentity) {
      try {
        await ensureRoomHostMetadata(roomName, hostIdentity)
      } catch (error: any) {
        // Room doesn't exist yet - that's OK, metadata will be set after room is created
        console.log(`[token] Could not set room metadata yet: ${error.message}`)
      }
    }

    return NextResponse.json({ token })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Internal Server Error" }, { status: 500 })
  }
}
