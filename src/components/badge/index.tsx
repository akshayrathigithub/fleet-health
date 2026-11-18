import type { ReactNode } from 'react';

import { cx } from '@/utils/cx';

import { Icon, type IconName } from '../icon';
import type { Tone } from '../tone';
import styles from './index.module.scss';

interface BadgeProps {
  tone?: Tone;
  icon?: IconName;
  children: ReactNode;
}

/** Small pill for a status or tag. Meaning comes from the text, never colour alone. */
export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[tone])}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
