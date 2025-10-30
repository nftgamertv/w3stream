'use client';
import React, { useState, useEffect } from 'react';
import type { ComponentConfig } from '@measured/puck';
import { useParticipants, useTracks, useRoomContext, ParticipantTile as LKParticipantTile } from "@livekit/components-react";
import { Track, type LocalParticipant, type RemoteParticipant } from "livekit-client";
import type { TrackReference } from "@livekit/components-react";
import { BackroomPanel as BackroomPanelComponent } from '@/components/BackroomPanel';

export interface VideoConferenceLayoutProps {
  defaultLayout?: "grid" | "sidebar" | "spotlight";
}

type LayoutType = "grid" | "sidebar" | "spotlight";

function isOnStage(p: LocalParticipant | RemoteParticipant): boolean {
  const md = p.metadata ? JSON.parse(p.metadata) : {};
  return md.onStage === true;
}

function hasScreenShare(p: LocalParticipant | RemoteParticipant) {
  const pub = p.getTrackPublication(Track.Source.ScreenShare);
  return !!pub && pub.isEnabled && pub.isSubscribed;
}

function hasCamera(p: LocalParticipant | RemoteParticipant) {
  const pub = p.getTrackPublication(Track.Source.Camera);
  return !!pub && pub.isEnabled && pub.isSubscribed;
}

function getPreferredTrackRef(p: LocalParticipant | RemoteParticipant): TrackReference {
  const scr = p.getTrackPublication(Track.Source.ScreenShare);
  if (scr?.isSubscribed && scr?.track) return { participant: p, source: Track.Source.ScreenShare, publication: scr };
  const cam = p.getTrackPublication(Track.Source.Camera);
  return { participant: p, source: Track.Source.Camera, publication: cam };
}

const VideoConferenceLayoutInner: React.FC<VideoConferenceLayoutProps> = ({
  defaultLayout = "grid"
}) => {
  const [layout, setLayout] = useState<LayoutType>(defaultLayout);
  const participants = useParticipants();
  const tracks = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false }
  ], { onlySubscribed: false });

  const stagePeople = participants.filter(isOnStage);
  const hasScreenShareActive = tracks.some((t) => t.source === Track.Source.ScreenShare);

  useEffect(() => {
    if (hasScreenShareActive && layout === "grid") {
      setLayout("sidebar");
    }
  }, [hasScreenShareActive, layout]);

  useEffect(() => {
    const handleLayoutChange = (e: CustomEvent) => {
      setLayout(e.detail);
    };
    window.addEventListener('layout-changed', handleLayoutChange as EventListener);
    return () => window.removeEventListener('layout-changed', handleLayoutChange as EventListener);
  }, []);

  // Grid Layout
  if (layout === "grid") {
    return (
      <div className="flex items-center justify-center relative min-h-[700px] p-4">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
            {stagePeople.map((p) => (
              <div key={p.identity} className="aspect-video max-h-[480px] overflow-hidden rounded-lg bg-black/20">
                <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(p)} />
              </div>
            ))}
          </div>
          <BackroomPanelComponent />
        </div>
      </div>
    );
  }

  // Sidebar Layout
  if (layout === "sidebar") {
    const screenSharer = stagePeople.find(hasScreenShare);
    const cameraPeople = stagePeople.filter(hasCamera);

    if (screenSharer) {
      return (
        <div className="flex h-full gap-4 p-4">
          <div className="w-64 flex flex-col gap-3 overflow-y-auto">
            {cameraPeople.filter((p) => p.identity !== screenSharer.identity).map((p) => (
              <div key={p.identity} className="aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
                <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(p)} />
              </div>
            ))}
          </div>
          <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden">
            <div className="w-full h-full">
              <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(screenSharer)} />
            </div>
          </div>
          <BackroomPanelComponent />
        </div>
      );
    }

    const main = cameraPeople[0];
    const sidebar = cameraPeople.slice(1);

    return (
      <div className="flex h-full gap-4 p-4">
        {sidebar.length > 0 && (
          <div className="w-64 flex flex-col gap-3 overflow-y-auto">
            {sidebar.map((p) => (
              <div key={p.identity} className="aspect-video flex-shrink-0 overflow-hidden rounded-lg bg-black/20">
                <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(p)} />
              </div>
            ))}
          </div>
        )}
        <div className="flex-1 flex items-center justify-center">
          {main && (
            <div className="w-full h-full max-w-5xl max-h-[800px] overflow-hidden rounded-lg bg-black/20">
              <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(main)} />
            </div>
          )}
        </div>
        <BackroomPanelComponent />
      </div>
    );
  }

  // Spotlight Layout
  if (layout === "spotlight") {
    const screenSharer = stagePeople.find(hasScreenShare);
    const cameraPeople = stagePeople.filter(hasCamera);
    const main = screenSharer ?? cameraPeople[0];
    const carousel = screenSharer ? cameraPeople : cameraPeople.slice(1);

    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <div className="flex-1 flex items-center justify-center rounded-lg overflow-hidden">
          {main && (
            <div className="w-full h-full">
              <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(main)} />
            </div>
          )}
        </div>
        {carousel.length > 0 && (
          <div className="h-32 flex gap-4 overflow-x-auto pb-2">
            {carousel.map((p) => (
              <div key={p.identity} className="w-48 overflow-hidden rounded-lg bg-black/20">
                <LKParticipantTile className="h-full w-full" trackRef={getPreferredTrackRef(p)} />
              </div>
            ))}
          </div>
        )}
        <BackroomPanelComponent />
      </div>
    );
  }

  return null;
};

export const VideoConferenceLayout: React.FC<VideoConferenceLayoutProps> = (props) => {
  // Use useMaybeRoomContext to check if room is available without throwing
  let room;
  try {
    room = useRoomContext();
  } catch (error) {
    // No room context available - show placeholder
    return (
      <div className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center">
        <p className="text-sm text-gray-500">Video Conference Layout</p>
        <p className="text-xs text-gray-400">Waiting for room connection...</p>
      </div>
    );
  }

  // Only render inner component if room is available
  return <VideoConferenceLayoutInner {...props} />;
};

export const VideoConferenceLayoutConfig: ComponentConfig<VideoConferenceLayoutProps> = {
  label: 'Video Conference Layout',
  fields: {
    defaultLayout: {
      type: 'select',
      label: 'Default Layout',
      options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Sidebar', value: 'sidebar' },
        { label: 'Spotlight', value: 'spotlight' },
      ],
    },
  },
  defaultProps: {
    defaultLayout: 'grid',
  },
  render: (props) => <VideoConferenceLayout {...props} />,
};
