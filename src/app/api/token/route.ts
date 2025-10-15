import { AccessToken, RoomServiceClient } from "livekit-server-sdk"
import { type NextRequest, NextResponse } from "next/server"

const roomHosts = new Map<string, string>()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const roomName = body.room
    const participantName = body.name

    if (!roomName) {
      return NextResponse.json({ error: "Missing room parameter" }, { status: 400 })
    }

    if (!participantName) {
      return NextResponse.json({ error: "Missing name parameter" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      const missing = []
      if (!apiKey) missing.push("LIVEKIT_API_KEY")
      if (!apiSecret) missing.push("LIVEKIT_API_SECRET")
      if (!wsUrl) missing.push("NEXT_PUBLIC_LIVEKIT_URL")

      console.error("[v0] Missing environment variables:", missing.join(", "))
      return NextResponse.json(
        {
          error: "Server misconfigured. Missing Livekit credentials.",
          missing,
        },
        { status: 500 },
      )
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()
    console.log("[v0] Token generated successfully for room:", roomName)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[v0] Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const roomName = req.nextUrl.searchParams.get("roomName")
    const participantName = req.nextUrl.searchParams.get("participantName")
    const checkHost = req.nextUrl.searchParams.get("checkHost")
    const isHostParam = req.nextUrl.searchParams.get("isHost")
    const onStageParam = req.nextUrl.searchParams.get("onStage")

    if (checkHost === "true") {
      if (!roomName) {
        return NextResponse.json({ error: "Missing roomName parameter" }, { status: 400 })
      }

      const apiKey = process.env.LIVEKIT_API_KEY
      const apiSecret = process.env.LIVEKIT_API_SECRET
      const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

      if (!apiKey || !apiSecret || !wsUrl) {
        return NextResponse.json({ error: "Server misconfigured" }, { status: 500 })
      }

      // Check if room exists and has any participants with isHost metadata
      let isHost = false

      try {
        const roomService = new RoomServiceClient(wsUrl, apiKey, apiSecret)
        const participants = await roomService.listParticipants(roomName)

        // Check if any existing participant is already a host
        const hasExistingHost = participants.some((p) => {
          try {
            const metadata = p.metadata ? JSON.parse(p.metadata) : {}
            return metadata.isHost === true
          } catch {
            return false
          }
        })

        // If no existing host, this participant becomes the host
        isHost = !hasExistingHost

        console.log("[v0] Host check - Room:", roomName, "Existing participants:", participants.length, "Has host:", hasExistingHost, "Is host:", isHost)
      } catch (error) {
        // Room doesn't exist yet, so this is the first participant and thus the host
        console.log("[v0] Room doesn't exist yet, making participant host:", participantName)
        isHost = true
      }

      return NextResponse.json({ isHost })
    }

    if (!roomName) {
      return NextResponse.json({ error: "Missing roomName parameter" }, { status: 400 })
    }

    if (!participantName) {
      return NextResponse.json({ error: "Missing participantName parameter" }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      const missing = []
      if (!apiKey) missing.push("LIVEKIT_API_KEY")
      if (!apiSecret) missing.push("LIVEKIT_API_SECRET")
      if (!wsUrl) missing.push("NEXT_PUBLIC_LIVEKIT_URL")

      console.error("[v0] Missing environment variables:", missing.join(", "))
      return NextResponse.json(
        {
          error: "Server misconfigured. Missing Livekit credentials.",
          missing,
        },
        { status: 500 },
      )
    }

    const isHost = isHostParam === "true"
    const onStage = onStageParam === "true"
    const metadata = JSON.stringify({ isHost, onStage })

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: participantName,
      metadata,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()
    console.log("[v0] Token generated successfully for room:", roomName, "isHost:", isHost, "onStage:", onStage)

    return NextResponse.json({ token })
  } catch (error) {
    console.error("[v0] Error generating token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
