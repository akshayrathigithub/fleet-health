import type { ReactNode } from 'react';

const ICONS = {
  critical: (
    <>
      <path d="M5.5 1.5h5l4 4v5l-4 4h-5l-4-4v-5z" />
      <path d="M8 4.75v3.75" />
      <path d="M8 11h.01" />
    </>
  ),
  warning: (
    <>
      <path d="M8 2l6.5 11.5h-13z" />
      <path d="M8 6.5v3" />
      <path d="M8 11.6h.01" />
    </>
  ),
  check: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5.2 8.2l2 2 3.6-4" />
    </>
  ),
  offline: (
    <>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M5 8h6" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.25" />
      <path d="M10.2 10.2L14 14" />
    </>
  ),
  pulse: <path d="M1.5 8.5h3l2-5 3 9 2-4h3" />,
  flag: (
    <>
      <path d="M3.5 14.5v-12" />
      <path d="M3.5 3H12l-2 2.75L12 8.5H3.5" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M13 8H3.5" />
      <path d="M7.5 4l-4 4 4 4" />
    </>
  ),
  close: (
    <>
      <path d="M4 4l8 8" />
      <path d="M12 4l-8 8" />
    </>
  ),
  chevron: <path d="M4 6.25L8 10.25L12 6.25" />,
  tick: <path d="M3.5 8.25l3 3 6-6.5" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/**
 * Decorative stroke icon. Always hidden from assistive tech: the meaning must
 * be carried by adjacent text (visible or visually hidden).
 */
export function Icon({ name, size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      style={{ flex: 'none' }}
    >
      {ICONS[name]}
    </svg>
  );
}
