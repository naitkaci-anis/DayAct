// Lightweight inline SVG icons (no external dependency).
// 1.5px stroke, currentColor — matches the DayAct line aesthetic.

import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "strokeWidth"> & {
  size?: number;
  strokeWidth?: number;
};

function base({ size = 18, strokeWidth = 1.6, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function LogoMark({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" {...props}>
      <defs>
        <linearGradient
          id="dayact-logo"
          x1="4"
          y1="5"
          x2="27"
          y2="27"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" />
          <stop offset="0.55" stopColor="#6366f1" />
          <stop offset="1" stopColor="#c026ff" />
        </linearGradient>
      </defs>
      {/* ring */}
      <circle cx="16" cy="16" r="12.5" stroke="url(#dayact-logo)" strokeWidth="2.1" fill="none" />
      {/* sun rays */}
      <g stroke="url(#dayact-logo)" strokeWidth="1.3" strokeLinecap="round">
        <path d="M12.8 8.2v1.5" />
        <path d="M8.3 13.2h1.5" />
        <path d="M9.6 10l1 1" />
        <path d="M16 10l-1 1" />
      </g>
      {/* sun */}
      <circle cx="12.8" cy="13.4" r="2.5" fill="url(#dayact-logo)" />
      {/* hills / river */}
      <path
        d="M7 19.5c2.2-2 4-0.2 6-0.2s3.8-2 6 0"
        stroke="url(#dayact-logo)"
        strokeWidth="1.3"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
      {/* checkmark */}
      <path
        d="M12 17.6l3 3L23.2 12"
        stroke="url(#dayact-logo)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export const TodayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
    <circle cx="12" cy="15" r="2" />
  </svg>
);

export const TasksIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2" />
  </svg>
);

export const InsightsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
  </svg>
);

export const WellbeingIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-4.35-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 6c-2.5 4.65-9.5 9-9.5 9Z" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-2.82 1.17V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 14H4.5a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 10 4.6h.09A1.65 1.65 0 0 0 12 3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1.82 1.51h.09a2 2 0 0 1 0 4Z" />
  </svg>
);

export const SparkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const FlameIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 22a7 7 0 0 0 7-7c0-3-2-5-3-7-1.5 1.5-2 2.5-3 2.5C12 8 13 4 9 2c.5 4-2 5.5-3.5 8A7 7 0 0 0 12 22Z" />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const BoltIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base({ ...p, strokeWidth: 2.4 })}>
    <path d="M5 12l5 5L20 6" />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const TargetIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </svg>
);

export const AlertIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 9v4M12 17h.01" />
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);
