import type { ReactNode } from 'react';

import { cx } from '@/utils/cx';

import { Icon, type IconName } from '../icon';
import type { Tone } from '../tone';
import styles from './index.module.scss';

interface StateMessageProps {
  icon: IconName;
  tone?: Extract<Tone, 'neutral' | 'success' | 'critical'>;
  title: string;
  description?: ReactNode;
  /** Usually a Button or Link that gets the user out of this state. */
  action?: ReactNode;
  /** Use "alert" for errors so screen readers announce them immediately. */
  role?: 'alert' | 'status';
  className?: string;
}

/** Centred icon + message + action, used for empty, error and placeholder states. */
export function StateMessage({
  icon,
  tone = 'neutral',
  title,
  description,
  action,
  role,
  className,
}: StateMessageProps) {
  return (
    <div className={cx(styles.root, className)} role={role}>
      <span className={cx(styles.icon, styles[tone])}>
        <Icon name={icon} size={20} />
      </span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}
