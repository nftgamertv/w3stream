// /lib/livekit-server.ts
import "server-only";
import {
  AccessToken,
  RoomServiceClient,
  type Room,
} from "livekit-server-sdk";

/** Safe env read — no top-level throws */
function getEnv() {
  const API_KEY = process.env.LIVEKIT_API_KEY || "";
  const API_SECRET = process.env.LIVEKIT_API_SECRET || "";
  let HOST = process.env.LIVEKIT_HOST || "";

  // If LIVEKIT_HOST not provided, derive from NEXT_PUBLIC_LIVEKIT_URL
  // wss://foo.livekit.cloud -> https://foo.livekit.cloud
  if (!HOST && process.env.NEXT_PUBLIC_LIVEKIT_URL) {
    HOST = process.env.NEXT_PUBLIC_LIVEKIT_URL
      .replace(/^wss:\/\//i, "https://")
      .replace(/^ws:\/\//i, "http://");
  }

  return { API_KEY, API_SECRET, HOST };
}

/** Lazily create a RoomServiceClient; fail with explicit errors at call-time */
function getRoomService(): RoomServiceClient {
  const { API_KEY, API_SECRET, HOST } = getEnv();
  if (!API_KEY || !API_SECRET || !HOST) {
    // Don’t throw at import time; throw when a route actually calls us
    throw new Error(
      `Missing LiveKit env. Required: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_HOST (or derive from NEXT_PUBLIC_LIVEKIT_URL).`
    );
  }
  return new RoomServiceClient(HOST, API_KEY, API_SECRET);
}

/** Try both listRooms({ names }) and legacy listRooms({ roomName }) */
async function fetchRoomByName(roomName: string): Promise<Room | null> {
  const roomService = getRoomService();
  try {
    const rooms = await roomService.listRooms({ names: [roomName] } as any);
    return rooms?.[0] ?? null;
  } catch {
    try {
      const rooms = (await roomService.listRooms({ roomName } as any)) as Room[];
      return rooms?.[0] ?? null;
    } catch {
      return null;
    }
  }
}

export async function createParticipantToken(opts: {
  roomName: string;
  identity: string;
  name?: string;
  metadata?: Record<string, unknown>;
  canPublish?: boolean;
  canSubscribe?: boolean;
}) {
  const { API_KEY, API_SECRET } = getEnv();
  if (!API_KEY || !API_SECRET) {
    throw new Error("LIVEKIT_API_KEY / LIVEKIT_API_SECRET not set");
  }

  const at = new AccessToken(API_KEY, API_SECRET, {
    identity: opts.identity,
    name: opts.name,
    metadata: opts.metadata ? JSON.stringify(opts.metadata) : undefined,
  });

  at.addGrant({
    roomJoin: true,
    room: opts.roomName,
    canPublish: opts.canPublish ?? true,
    canSubscribe: opts.canSubscribe ?? true,
    canPublishData: true,
  });

  return await at.toJwt();
}

export async function getRoomHostIdentity(roomName: string): Promise<string | null> {
  const room = await fetchRoomByName(roomName);
  if (!room?.metadata) return null;
  try {
    const meta = JSON.parse(room.metadata);
    return typeof meta.hostIdentity === "string" ? meta.hostIdentity : null;
  } catch {
    return null;
  }
}

export async function setRoomHostIfEmpty(roomName: string, identity: string) {
  const roomService = getRoomService();
  const room = await fetchRoomByName(roomName);
  if (!room) {
    // Room will be created on first join; we’ll ensure metadata later
    return identity;
  }
  let meta: Record<string, unknown> = {};
  try {
    meta = room.metadata ? JSON.parse(room.metadata) : {};
  } catch {
    meta = {};
  }
  if (!meta.hostIdentity) {
    meta.hostIdentity = identity;
    await roomService.updateRoomMetadata(roomName, JSON.stringify(meta));
    return identity;
  }
  return meta.hostIdentity as string;
}

export async function ensureRoomHostMetadata(roomName: string, hostIdentity: string) {
  const roomService = getRoomService();
  const room = await fetchRoomByName(roomName);
  if (!room) return; // created on first join
  let meta: Record<string, unknown> = {};
  try {
    meta = room.metadata ? JSON.parse(room.metadata) : {};
  } catch {
    meta = {};
  }
  if (!meta.hostIdentity) {
    meta.hostIdentity = hostIdentity;
    await roomService.updateRoomMetadata(roomName, JSON.stringify(meta));
  }
}

export async function replaceParticipantMetadata(
  roomName: string,
  participantIdentity: string,
  metadata: Record<string, unknown>
) {
  const roomService = getRoomService();

  // Retry logic for when room is being created
  const maxRetries = 5;
  const retryDelay = 500; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await roomService.updateParticipant(roomName, participantIdentity, {
        metadata: JSON.stringify(metadata),
      });
      return metadata;
    } catch (error: any) {
      const isRoomNotFound = error?.message?.includes("requested room does not exist");

      if (isRoomNotFound && attempt < maxRetries - 1) {
        // Room hasn't been created yet, wait and retry
        console.log(`[livekit-server] Room ${roomName} not found, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      // Either not a room-not-found error, or we've exhausted retries
      throw error;
    }
  }

  throw new Error(`Failed to update participant metadata after ${maxRetries} retries`);
}

export async function updateParticipantOnStage(
  roomName: string,
  participantIdentity: string,
  onStage: boolean
) {
  const roomService = getRoomService();

  // Retry logic for when room is being created
  const maxRetries = 5;
  const retryDelay = 500; // ms

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const p = await roomService.getParticipant(roomName, participantIdentity).catch(() => null);
      let current: Record<string, unknown> = {};
      if (p?.metadata) {
        try {
          current = JSON.parse(p.metadata);
        } catch {
          current = {};
        }
      }
      const next = { ...current, onStage };
      await roomService.updateParticipant(roomName, participantIdentity, {
        metadata: JSON.stringify(next),
      });
      return next;
    } catch (error: any) {
      const isRoomNotFound = error?.message?.includes("requested room does not exist");

      if (isRoomNotFound && attempt < maxRetries - 1) {
        // Room hasn't been created yet, wait and retry
        console.log(`[livekit-server] Room ${roomName} not found, retrying (${attempt + 1}/${maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      // Either not a room-not-found error, or we've exhausted retries
      throw error;
    }
  }

  throw new Error(`Failed to update participant onStage after ${maxRetries} retries`);
}
