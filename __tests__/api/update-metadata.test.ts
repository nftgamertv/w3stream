import { NextRequest } from 'next/server';
import { RoomServiceClient } from 'livekit-server-sdk';
import { handler } from '@/app/api/participant/update-metadata/route';
import { mockRoomServiceClient } from '../mocks/livekit';

describe('Update Metadata API Endpoint', () => {
  let mockRequest: Partial<NextRequest>;
  let mockRoomService: jest.MockedObject<RoomServiceClient>;

  beforeEach(() => {
    mockRoomService = mockRoomServiceClient.mock.instances[0];
    mockRequest = {
      json: jest.fn().mockResolvedValue({
        roomName: 'test-room',
        participantIdentity: 'user123',
        metadata: { onStage: true }
      })
    };
  });

  it('should successfully update participant metadata', async () => {
    mockRoomService.updateParticipant.mockResolvedValue({});

    const response = await handler(mockRequest as NextRequest);

    expect(response.status).toBe(200);
    expect(mockRoomService.updateParticipant).toHaveBeenCalledWith(
      'test-room',
      'user123',
      { onStage: true }
    );
  });

  it('should return 400 for missing parameters', async () => {
    mockRequest.json = jest.fn().mockResolvedValue({});

    const response = await handler(mockRequest as NextRequest);

    expect(response.status).toBe(400);
  });

  it('should handle LiveKit service errors gracefully', async () => {
    mockRoomService.updateParticipant.mockRejectedValue(new Error('LiveKit Error'));

    const response = await handler(mockRequest as NextRequest);

    expect(response.status).toBe(500);
  });
});