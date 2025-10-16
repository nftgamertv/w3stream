import { RoomServiceClient } from 'livekit-server-sdk';
const NEXT_PUBLIC_LIVEKIT_URL=`wss://twngo-e2fpi6u8.livekit.cloud`
const LIVEKIT_API_KEY=`APIT9RQMs8e5rt2`
const LIVEKIT_API_SECRET=`77hsmpLOLGeF6z7tca7Jo3fZs0Xu1mMLS5xEZt4rFaN`
const roomService = new RoomServiceClient(
  NEXT_PUBLIC_LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET
);

const rooms = await roomService.listRooms();
console.log(rooms);