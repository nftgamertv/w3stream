"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import config from "@/config/puck.config";
import savePage from "@/actions/savePage";
import { useState } from "react";

export function Client({ path, data }: { path: string; data: Partial<Data> }) {
  const [isPublishing, setIsPublishing] = useState(false);

  return (
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
  );
}
