"use client";

import type { Data } from "@measured/puck";
import { Puck } from "@measured/puck";
import config from "@/puck.config";
import savePage from "@/actions/savePage";
import updateMutable from "@/actions/updateMutable";
import { getCookie } from "cookies-next";
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
          console.log("Publishing to IPFS and Solana...", { path, data });

          // Step 1: Save to IPFS
          const ipfsHash = await savePage({ params: { path, data } });
          console.log("IPFS Hash:", ipfsHash);

          // Step 2: Get wallet address from cookies if available
          const walletAddress = getCookie("wallet_address") as string | undefined;

          // Step 3: Update database and Solana NFT metadata
          await updateMutable({
            params: {
              path,
              ipfsHash,
              walletAddress
            }
          });

          console.log("Published successfully!");
          alert("Published successfully to IPFS and Solana!");
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
