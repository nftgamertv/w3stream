import { mockRoomServiceClient, mockAccessToken } from '../mocks/livekit';

describe('Room Flow Integration', () => {
  it('handles participant joining and moving to stage', async () => {
    // Simulate room is empty, first participant becomes host
    const tokenResponse1 = await fetch('/api/token?roomName=test-room&participantName=host');
    const hostToken = await tokenResponse1.json();
    expect(hostToken.isHost).toBe(true);
    expect(hostToken.onStage).toBe(false);

    // Simulate second participant joining
    const tokenResponse2 = await fetch('/api/token?roomName=test-room&participantName=participant');
    const participantToken = await tokenResponse2.json();
    expect(participantToken.isHost).toBe(false);
    expect(participantToken.onStage).toBe(false);

    // Host moves participant to stage
    const updateResponse = await fetch('/api/participant/update-metadata', {
      method: 'POST',
      body: JSON.stringify({
        roomName: 'test-room',
        participantIdentity: 'participant',
        metadata: { onStage: true }
      })
    });

    expect(updateResponse.status).toBe(200);
  });
});