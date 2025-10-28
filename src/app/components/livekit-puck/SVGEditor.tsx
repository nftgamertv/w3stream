'use client';
import React, { useMemo } from 'react';
import SVGEditor from '@/components/SvgEditor';
import type { ComponentConfig } from '@measured/puck';
import { useParticipants, useRoomContext, ParticipantTile as LKParticipantTile } from '@livekit/components-react';
import { Track, type LocalParticipant, type RemoteParticipant } from 'livekit-client';
import type { TrackReference } from '@livekit/components-react';
import { cn } from '@/lib/utils';

export interface SVGEditorProps {
  svgUrl: string;
  width?: number;
  height?: number;
  collaborative?: boolean;
  className?: string;
}

function isOnStage(participant: LocalParticipant | RemoteParticipant): boolean {
  const metadata = participant.metadata ? JSON.parse(participant.metadata) : {};
  return metadata.onStage === true;
}

function getPreferredTrackRef(participant: LocalParticipant | RemoteParticipant): TrackReference | undefined {
  const screenPublication = participant.getTrackPublication(Track.Source.ScreenShare);
  if (screenPublication?.isSubscribed && screenPublication?.track) {
    return { participant, source: Track.Source.ScreenShare, publication: screenPublication };
  }
  const cameraPublication = participant.getTrackPublication(Track.Source.Camera);
  if (cameraPublication?.isSubscribed && cameraPublication?.track) {
    return { participant, source: Track.Source.Camera, publication: cameraPublication };
  }
  return undefined;
}

export const SVGEditorComponent: React.FC<SVGEditorProps> = ({
  svgUrl,
  width = 960,
  height = 720,
  collaborative = false,
  className = '',
}) => {
  let room;
  try {
    room = useRoomContext();
  } catch (error) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 p-8 text-sm text-white/60">
        Connect to a LiveKit room to use the collaborative SVG editor.
      </div>
    );
  }

  const participants = useParticipants();
  const stageParticipants = useMemo(
    () => participants.filter((participant) => participant.identity !== room.localParticipant.identity && isOnStage(participant)),
    [participants, room.localParticipant.identity],
  );

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-6">
      <div className="flex h-full w-full max-w-7xl flex-col gap-6 lg:flex-row">
        <div className="hidden w-64 flex-shrink-0 flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl lg:flex">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-white/60">Stage Preview</h3>
          {stageParticipants.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-xs text-white/60">
              No one on stage
            </div>
          ) : (
            stageParticipants.map((participant) => {
              const trackRef = getPreferredTrackRef(participant);
              return (
                <div key={participant.identity} className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black/60">
                  {trackRef ? (
                    <LKParticipantTile className="h-full w-full" trackRef={trackRef} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-white/60">No media</div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div
            className={cn(
              'relative flex w-full max-w-4xl flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl',
              className,
            )}
          >
            <div
              className="relative w-full max-w-full overflow-hidden rounded-2xl bg-black/30"
              style={{
                width: Math.min(width, 1280),
                maxWidth: '100%',
                minHeight: Math.min(height, 900),
              }}
            >
              <div className="relative mx-auto flex w-full max-w-full items-center justify-center overflow-hidden">
                <SVGEditor svgurl={svgUrl} className="h-full w-full" collaborative={collaborative} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SVGEditorConfig: ComponentConfig<SVGEditorProps> = {
  label: 'SVG Editor',
  fields: {
    svgUrl: {
      type: 'text',
      label: 'SVG URL',
    },
    width: {
      type: 'number',
      label: 'Canvas Width',
    },
    height: {
      type: 'number',
      label: 'Canvas Height',
    },
    collaborative: {
      type: 'radio',
      label: 'Enable Collaboration',
      options: [
        { label: 'Enabled', value: true },
        { label: 'Disabled', value: false },
      ],
    },
    className: {
      type: 'text',
      label: 'CSS Classes',
    },
  },
  defaultProps: {
    svgUrl: 'https://vgwzhgureposlvnxoiaj.supabase.co/storage/v1/object/public/svgs/generated/w3s.svg',
    width: 960,
    height: 720,
    collaborative: false,
    className: '',
  },
  render: (props) => <SVGEditorComponent {...props} />,
};
