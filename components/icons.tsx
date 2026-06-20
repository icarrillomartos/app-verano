import type { CSSProperties } from "react";

type IconProps = {
  size?: number;
  sw?: number; // stroke-width
  color?: string;
  style?: CSSProperties;
};

function Svg({
  size = 24,
  sw = 2,
  color,
  children,
  style,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color ?? "currentColor"}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  );
}

export const Sliders = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </Svg>
);

export const Check = (p: IconProps) => (
  <Svg sw={2.4} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </Svg>
);

export const CheckGratis = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 13l4 4L19 7" />
  </Svg>
);

export const Bolt = ({ size = 12, style }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFD24A" style={style}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const Clock = (p: IconProps) => (
  <Svg sw={2.2} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

export const Calendar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="3.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Svg>
);

export const Coin = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 9.4a3.6 3.6 0 1 0 0 5.2M8.2 11h4.4M8.2 13h3.6" />
  </Svg>
);

export const Pin = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s7-5.7 7-11a7 7 0 1 0-14 0c0 5.3 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Svg>
);

export const Plus = (p: IconProps) => (
  <Svg sw={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const X = (p: IconProps) => (
  <Svg sw={2.2} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const ExternalLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </Svg>
);

export const Chat = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L4 20l1-4.6A8.4 8.4 0 1 1 21 11.5Z" />
  </Svg>
);

export const Home = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 11 12 4l8 7M6 9.5V20h12V9.5" />
  </Svg>
);

export const Tray = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13h5l1.5 2.5h5L21 13M5 13V6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5V13v5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18v-5Z" />
  </Svg>
);

export const Pencil = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" />
  </Svg>
);

export const Undo = (p: IconProps) => (
  <Svg sw={2.2} {...p}>
    <path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12h-1" />
  </Svg>
);

export const LinkChain = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 15l6-6M11 6l1-1a3.5 3.5 0 0 1 5 5l-1 1M13 18l-1 1a3.5 3.5 0 0 1-5-5l1-1" />
  </Svg>
);

// Status bar (señal / wifi / batería) — copia exacta del prototipo.
export const StatusIcons = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text)" }}>
    <svg width="18" height="11" viewBox="0 0 18 11">
      <rect x="0" y="7" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="5" y="5" width="3" height="6" rx="1" fill="currentColor" />
      <rect x="10" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" />
      <rect x="15" y="0" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
    <svg width="16" height="12" viewBox="0 0 16 12">
      <path
        d="M1 4.2a10 10 0 0 1 14 0M3.6 6.9a6 6 0 0 1 8.8 0"
        stroke="currentColor"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="8" cy="9.6" r="1.2" fill="currentColor" />
    </svg>
    <svg width="26" height="12" viewBox="0 0 26 12">
      <rect x="0.5" y="0.5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      <rect x="2" y="2" width="16" height="8" rx="1.6" fill="currentColor" />
      <rect x="24" y="4" width="1.8" height="4" rx="1" fill="currentColor" />
    </svg>
  </div>
);
