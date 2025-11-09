"use client";

import { Render } from "@measured/puck";
import config from "@/config/puck.config";

interface ClientProps {
  data: any;
}

export const Client: React.FC<ClientProps> = ({ data }) => {
  console.log('Client component received data:', data);

  if (!data) {
    console.error('Client component: No data provided');
    return <div className="p-8">No data to render</div>;
  }

  // Remove LivekitRoomWrapper from here - it should be at a higher level
  // to prevent duplicate connections
  return <Render config={config} data={data} />;
};
 