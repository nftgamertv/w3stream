import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BackroomPanel from '@/app/components/backroom-panel';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('BackroomPanel', () => {
  const mockParticipants = [
    { identity: 'user1', metadata: { onStage: false } },
    { identity: 'user2', metadata: { onStage: true } }
  ];

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('filters participants correctly', () => {
    render(<BackroomPanel
      participants={mockParticipants}
      isHost={true}
      roomName="test-room"
    />);

    const backstageUsers = screen.getAllByTestId('backstage-user');
    const stageUsers = screen.getAllByTestId('stage-user');

    expect(backstageUsers).toHaveLength(1);
    expect(stageUsers).toHaveLength(1);
  });

  it('calls update metadata API when adding to stage', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

    render(<BackroomPanel
      participants={mockParticipants}
      isHost={true}
      roomName="test-room"
    />);

    const addButton = screen.getByTestId('add-to-stage-user1');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/participant/update-metadata', {
        method: 'POST',
        body: JSON.stringify({
          roomName: 'test-room',
          participantIdentity: 'user1',
          metadata: { onStage: true }
        })
      });
    });
  });

  it('hides panel when not host', () => {
    const { container } = render(<BackroomPanel
      participants={mockParticipants}
      isHost={false}
      roomName="test-room"
    />);

    expect(container).toBeEmptyDOMElement();
  });
});