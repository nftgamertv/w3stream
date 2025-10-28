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
  const pathname = usePathname();
  const roomId = pathname?.replace(/^\//, '') || 'default-room';

  console.log('Client component using roomId from path:', roomId);

  if (!data) {
    console.error('Client component: No data provided');
    return <div className="p-8">No data to render</div>;
  }

  return <LivekitRoomWrapper roomId={roomId}><Render config={config} data={data} />;</LivekitRoomWrapper>
};
 