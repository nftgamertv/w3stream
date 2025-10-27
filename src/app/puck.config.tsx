import type { Config } from "@measured/puck";
import { DisconnectButton, LiveKitRoom } from "@livekit/components-react";
type Props = {
  HeadingBlock: { title: string };
  DisconnectButton: { title: string };
};

export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Heading",
      },
      render: ({ title }) => (
        <div style={{ padding: 64 }}>
          <h1>{title}</h1>
        </div>
      ),
    },
    DisconnectButton: {
      fields: {
        title: { type: "text" },
      },
      defaultProps: {
        title: "Leave Room",
      },
      render: ({ title }) => (
        <LiveKitRoom serverUrl="" token="">
          <DisconnectButton>{title}</DisconnectButton>
        </LiveKitRoom>
      ),
    },
  },
};

export default config;
