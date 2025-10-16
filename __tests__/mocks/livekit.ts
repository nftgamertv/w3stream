import { RoomServiceClient, AccessToken } from 'livekit-server-sdk';

// Mock LiveKit SDK
jest.mock('livekit-server-sdk', () => ({
  RoomServiceClient: jest.fn().mockImplementation(() => ({
    updateParticipant: jest.fn(),
    listParticipants: jest.fn(),
  })),
  AccessToken: jest.fn().mockImplementation(() => ({
    addGrant: jest.fn().mockReturnThis(),
    toJWT: jest.fn().mockReturnValue('mocked-token'),
  })),
}));

export const mockRoomServiceClient = RoomServiceClient as jest.MockedClass<typeof RoomServiceClient>;
export const mockAccessToken = AccessToken as jest.MockedClass<typeof AccessToken>;