import type { ReactNode } from 'react';

/** Text for screen readers only, e.g. the meaning behind a colour or icon. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="visually-hidden">{children}</span>;
}
