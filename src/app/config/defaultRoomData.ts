import { Data } from '@measured/puck';

/**
 * Default Puck configuration matching the RoomContent layout from MeetingRoom
 * This replicates the structure from RoomContent (lines 320-344 in MeetingRoom.tsx)
 */
const defaultRoomDataRaw = {
  root: {
    props: {
      title: 'Video Conference Room'
    }
  },
  content: [
    {
      type: 'RoomShell',
      props: {
        id: 'RoomShell-1',
        background: 'nebula',
        withPadding: false,
        showCursors: true, // Enable cursors for collaborative rooms by default
      },
      slots: {
        topBar: [
          {
            type: 'RoomHeader',
            props: {
              id: 'RoomHeader-1',
              roomId: 'default-room',
              showLayoutControls: true,
              showCopyLink: true,
            },
          },
        ],
        stage: [
          {
            type: 'VideoConferenceLayout',
            props: {
              id: 'VideoConferenceLayout-1',
              defaultLayout: 'grid',
            },
          },
        ],
        footer: [
          {
            type: 'SelfStageToggle',
            props: {
              id: 'SelfStageToggle-1',
            },
          },
          {
            type: 'ControlBar',
            props: {
              id: 'ControlBar-1',
            },
          },
        ],
        overlays: [
          {
            type: 'ChatDrawer',
            props: {
              id: 'ChatDrawer-1',
              participantName: 'Guest',
              enabled: true,
            },
          },
        ],
      },
    },
    {
      type: 'StageSubscriptionManager',
      props: {
        id: 'StageSubscriptionManager-1',
        enabled: true,
      },
    },
    {
      type: 'RoomAudioRenderer',
      props: {
        id: 'RoomAudioRenderer-1',
        volume: 1,
      },
    },
  ],
  zones: {}
};

export const defaultRoomData = defaultRoomDataRaw as unknown as Data;

export default defaultRoomData;
