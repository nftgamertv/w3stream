import { Data } from '@measured/puck';

/**
 * Default Puck configuration matching the RoomContent layout from MeetingRoom
 * This replicates the structure from RoomContent (lines 320-344 in MeetingRoom.tsx)
 */
export const defaultRoomData: Data = {
  root: {
    props: {
      title: 'Video Conference Room'
    }
  },
  content: [
    // Header section
    {
      type: 'RoomHeader',
      props: {
        id: 'RoomHeader-1',
        roomId: 'default-room',
        showLayoutControls: true,
        showCopyLink: true,
      }
    },
    // Main video conference layout
    {
      type: 'VideoConferenceLayout',
      props: {
        id: 'VideoConferenceLayout-1',
        defaultLayout: 'grid',
      }
    },
    // Control bar section (footer)
    {
      type: 'ControlBar',
      props: {
        id: 'ControlBar-1'
      }
    },
    // Background components (invisible but essential)
    {
      type: 'StageSubscriptionManager',
      props: {
        id: 'StageSubscriptionManager-1',
        enabled: true,
      }
    },
    {
      type: 'RoomAudioRenderer',
      props: {
        id: 'RoomAudioRenderer-1',
        volume: 1,
      }
    },
    // Chat drawer (floating)
    {
      type: 'ChatDrawer',
      props: {
        id: 'ChatDrawer-1',
        participantName: 'Guest',
        enabled: true,
      }
    },
    // Backroom panel (for hosts only, shown conditionally)
    {
      type: 'BackroomPanel',
      props: {
        id: 'BackroomPanel-1',
        enabled: true,
      }
    },
  ],
  zones: {}
};

export default defaultRoomData;
