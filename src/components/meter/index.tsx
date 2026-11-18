import { cx } from '@/utils/cx';

import type { SeverityTone } from '../tone';
import styles from './index.module.scss';

interface MeterProps {
  /** 0–100 */
  value: number;
  tone?: SeverityTone;
}

/**
 * Thin bar that visualises a percentage. Decorative: always render the number
 * as text next to it.
 */
export function Meter({ value, tone = 'neutral' }: MeterProps) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <span className={cx(styles.meter, styles[tone])} aria-hidden="true">
      <span className={styles.fill} style={{ width: `${width}%` }} />
    </span>
  );
}
