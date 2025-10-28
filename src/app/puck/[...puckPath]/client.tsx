"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import config from "@/config/puck.config";
import savePage from "@/actions/savePage";
import { useEffect, useState } from "react";
import LivekitRoomWrapper from "@/providers/LivekitRoomWrapper";
import {useRoomContext} from "@livekit/components-react"
export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [ roomId, setRoomId ] = useState<string>("default-room");

  useEffect(() => { 
    const fetchRoomId = async () => {
      await room.getSid().then(sid => {
        setRoomId(sid);
      });
    }
    fetchRoomId();
  }, [])
  const room = useRoomContext();
  return (
    <LivekitRoomWrapper roomId={roomId || "default-room"}>
    <Puck
      config={config}
      data={data}
      onPublish={async (data) => {
        if (isPublishing) {
          alert("Publishing already in progress...");
          return;
        }

        setIsPublishing(true);
        try {
          console.log("Publishing page...", { path, data });

          // Save page data (upsert handles both create and update)
          await savePage({ params: { path, data } });

          console.log("Published successfully!");
          alert("Published successfully!");
        } catch (error) {
          console.error("Publish error:", error);
          alert(`Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
          setIsPublishing(false);
        }
      }}
    />
    </LivekitRoomWrapper>
  );
}
