"use client";

import { Render } from "@measured/puck";
import config from "@/config/puck.config";
import LivekitRoomWrapper from "@/providers/LivekitRoomWrapper";

interface ClientProps {
  data: any;
}

export const Client: React.FC<ClientProps> = ({ data }) => {
  console.log('Client component received data:', data);

  if (!data) {
    console.error('Client component: No data provided');
    return <div className="p-8">No data to render</div>;
  }

  return <LivekitRoomWrapper roomId={data.roomId}><Render config={config} data={data} />;</LivekitRoomWrapper>
};
 