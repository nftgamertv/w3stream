"use client";
 
import { Render } from "@measured/puck";
import config from "@/puck.config";
interface ClientProps {

  data: any;
 
}

export const Client: React.FC<ClientProps> = ({ data }) => {
  console.log(data)
  return <Render config={config} data={data} />;
}
 