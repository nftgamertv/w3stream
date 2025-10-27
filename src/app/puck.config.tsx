import type { Config } from "@measured/puck";
import { DisconnectButton, LiveKitRoom } from "@livekit/components-react";
import SVGEditor from "./components/SvgEditor";

type Props = {
  HeadingBlock: { title: string };
  DisconnectButton: { title: string };
  SVGEditor: {
    svgUrl: string;
    width?: number;
    height?: number;
    collaborative?: boolean;
    className?: string;
  };
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
    SVGEditor: {
      fields: {
        svgUrl: {
          type: "text",
          label: "SVG URL",
        },
        width: {
          type: "number",
          label: "Canvas Width",
        },
        height: {
          type: "number",
          label: "Canvas Height",
        },
        collaborative: {
          type: "radio",
          label: "Enable Collaboration",
          options: [
            { label: "Enabled", value: true },
            { label: "Disabled", value: false },
          ],
        },
        className: {
          type: "text",
          label: "CSS Classes",
        },
      },
      defaultProps: {
        svgUrl: "",
        width: 800,
        height: 800,
        collaborative: false,
        className: "",
      },
      render: ({ svgUrl, width, height, collaborative, className }) => (
        <div style={{ width: width || 800, height: height || 800 }}>
          <SVGEditor
            svgurl={svgUrl}
            className={className}
            collaborative={collaborative}
          />
        </div>
      ),
    },
  },
};

export default config;
