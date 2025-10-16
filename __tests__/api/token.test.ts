import { NextRequest } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { handler } from '@/app/api/token/route';
import { mockRoomServiceClient, mockAccessToken } from '../mocks/livekit';

describe('Token Generation API', () => {
  let mockRequest: Partial<NextRequest>;
  let mockRoomService: jest.MockedObject<RoomServiceClient>;

  beforeEach(() => {
    mockRoomService = mockRoomServiceClient.mock.instances[0];
    mockRequest = {
      nextUrl: {
        searchParams: new URLSearchParams({
          roomName: 'test-room',
          participantName: 'user123'
        })
      } as URL
    };
  });

  it('should assign host when room is empty', async () => {
    mockRoomService.listParticipants.mockResolvedValue([]);

    const response = await handler(mockRequest as NextRequest);
    const responseBody = await response.json();

    expect(responseBody.isHost).toBe(true);
    expect(responseBody.onStage).toBe(false);
  });

  it('should not assign host when room already has a host', async () => {
    mockRoomService.listParticipants.mockResolvedValue([
      { identity: 'existing-host', metadata: { isHost: true } }
    ]);

    const response = await handler(mockRequest as NextRequest);
    const responseBody = await response.json();

    expect(responseBody.isHost).toBe(false);
    expect(responseBody.onStage).toBe(false);
  });
});