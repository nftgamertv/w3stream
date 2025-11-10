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
import { SVGEditorConfig } from '@/components/livekit-puck/SVGEditor';
import { RoomHeaderConfig } from '@/components/livekit-puck/RoomHeader';
import { VideoConferenceLayoutConfig } from '@/components/livekit-puck/VideoConferenceLayout';
import { RoomShellConfig } from '@/components/livekit-puck/RoomShell';
import { BackroomPanelConfig } from '@/components/livekit-puck/BackroomPanel';
import { ChatDrawerConfig } from '@/components/livekit-puck/ChatDrawer';
import { StageSubscriptionManagerConfig } from '@/components/livekit-puck/StageSubscriptionManager';
import { SelfStageToggleConfig } from '@/components/livekit-puck/SelfStageToggle';
import { FeatureListConfig } from './components/feature-list';

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
    SVGEditor: SVGEditorConfig,
    RoomHeader: RoomHeaderConfig,
    VideoConferenceLayout: VideoConferenceLayoutConfig,
    RoomShell: RoomShellConfig,
    BackroomPanel: BackroomPanelConfig,
    ChatDrawer: ChatDrawerConfig,
    StageSubscriptionManager: StageSubscriptionManagerConfig,
    SelfStageToggle: SelfStageToggleConfig,
    FeatureList: FeatureListConfig,
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
      components: ['RoomShell', 'GridLayout', 'VideoConferenceLayout', 'FeatureList'],
      title: 'Layouts',
      defaultExpanded: true,
    },
    communication: {
      components: ['Chat', 'ChatDrawer'],
      title: 'Communication',
      defaultExpanded: true,
    },
    room: {
      components: ['RoomHeader', 'BackroomPanel', 'StageSubscriptionManager', 'SelfStageToggle'],
      title: 'Room Management',
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
    editor: {
      components: ['SVGEditor'],
      title: 'Editor',
      defaultExpanded: true,
    },
  },
};

export default livekitPuckConfig;