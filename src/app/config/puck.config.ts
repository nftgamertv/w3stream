import { Config } from '@measured/puck';
import { VideoTrackConfig } from '@/components/livekit-puck/VideoTrack';
import { AudioTrackConfig } from '@/components/livekit-puck/AudioTrack';
import { ControlBarConfig } from '@/components/livekit-puck/ControlBar';
import { DisconnectButtonConfig } from '@/components/livekit-puck/DisconnectButton';
import { TrackToggleConfig } from '@/components/livekit-puck/TrackToggle';
import { ParticipantTileConfig } from '@/components/livekit-puck/ParticipantTile';
import { GridLayoutConfig } from '@/components/livekit-puck/GridLayout';
import { ChatConfig } from '@/components/livekit-puck/Chat';
import { RoomAudioRendererConfig } from '@/components/livekit-puck/RoomAudioRenderer';
import { ConnectionQualityIndicatorConfig } from '@/components/livekit-puck/ConnectionQualityIndicator';
import { ParticipantNameConfig } from '@/components/livekit-puck/ParticipantName';
import { RoomNameConfig } from '@/components/livekit-puck/RoomName';

export const livekitPuckConfig: Config = {
  components: {
    VideoTrack: VideoTrackConfig,
    AudioTrack: AudioTrackConfig,
    ControlBar: ControlBarConfig,
    DisconnectButton: DisconnectButtonConfig,
    TrackToggle: TrackToggleConfig,
    ParticipantTile: ParticipantTileConfig,
    GridLayout: GridLayoutConfig,
    Chat: ChatConfig,
    RoomAudioRenderer: RoomAudioRendererConfig,
    ConnectionQualityIndicator: ConnectionQualityIndicatorConfig,
    ParticipantName: ParticipantNameConfig,
    RoomName: RoomNameConfig,
  },
  categories: {
    media: {
      components: ['VideoTrack', 'AudioTrack', 'RoomAudioRenderer'],
      title: 'Media',
      defaultExpanded: true,
    },
    participants: {
      components: ['ParticipantTile', 'ParticipantName'],
      title: 'Participants',
      defaultExpanded: true,
    },
    controls: {
      components: ['ControlBar', 'DisconnectButton', 'TrackToggle'],
      title: 'Controls',
      defaultExpanded: true,
    },
    layouts: {
      components: ['GridLayout'],
      title: 'Layouts',
      defaultExpanded: true,
    },
    communication: {
      components: ['Chat'],
      title: 'Communication',
      defaultExpanded: true,
    },
    status: {
      components: ['ConnectionQualityIndicator'],
      title: 'Status',
      defaultExpanded: false,
    },
    info: {
      components: ['RoomName'],
      title: 'Info',
      defaultExpanded: false,
    },
  },
};

export default livekitPuckConfig;
