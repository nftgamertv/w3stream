"use client";

import { Render } from "@measured/puck";
import config from "@/config/puck.config";
import LivekitRoomWrapper from "@/providers/LivekitRoomWrapper";
import { usePathname } from "next/navigation";

interface ClientProps {
  data: any;
}

export const Client: React.FC<ClientProps> = ({ data }) => {
  console.log('Client component received data:', data);

  // Extract roomId from URL path
  // pathname will be like "/room/TsMWoxue" or just "/TsMWoxue"
  const pathname = usePathname();
  const pathParts = pathname?.split('/').filter(Boolean) || [];
  // If path is /room/roomId, get the last part. Otherwise get the first part.
  const roomId = pathParts.length > 1 ? pathParts[pathParts.length - 1] : (pathParts[0] || 'default-room');

  console.log('Client component pathname:', pathname);
  console.log('Client component using roomId:', roomId);

  if (!data) {
    console.error('Client component: No data provided');
    return <div className="p-8">No data to render</div>;
  }

  return <LivekitRoomWrapper roomId={roomId}><Render config={config} data={data} />;</LivekitRoomWrapper>
};
 