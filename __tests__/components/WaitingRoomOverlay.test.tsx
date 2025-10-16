import React from 'react';
import { render, screen } from '@testing-library/react';
import WaitingRoomOverlay from '@/app/components/waiting-room-overlay';

describe('WaitingRoomOverlay', () => {
  it('shows overlay when onStage is false', () => {
    render(<WaitingRoomOverlay
      onStage={false}
      participantName="User1"
    />);

    const overlay = screen.getByTestId('waiting-room-overlay');
    expect(overlay).toBeInTheDocument();
  });

  it('hides overlay when onStage is true', () => {
    const { container } = render(<WaitingRoomOverlay
      onStage={true}
      participantName="User1"
    />);

    expect(container).toBeEmptyDOMElement();
  });
});