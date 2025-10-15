// /app/api/participant/update-metadata/route.ts
import { NextResponse } from "next/server";
import { replaceParticipantMetadata } from "@/lib/livekit-server";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      roomName?: string;
      participantIdentity?: string;
      metadata?: Record<string, unknown>;
    } | null;

    if (!body?.roomName || !body?.participantIdentity || !body?.metadata) {
      return NextResponse.json(
        { error: "Missing body fields. Required: roomName, participantIdentity, metadata" },
        { status: 400 }
      );
    }

    const updated = await replaceParticipantMetadata(
      body.roomName,
      body.participantIdentity,
      body.metadata
    );

    return NextResponse.json({ ok: true, updated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to update participant metadata" },
      { status: 500 }
    );
  }
}
