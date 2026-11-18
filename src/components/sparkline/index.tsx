import { cx } from '@/utils/cx';

import type { SeverityTone } from '../tone';
import styles from './index.module.scss';

const WIDTH = 120;
const HEIGHT = 36;
const PADDING = 3;

interface SparklineProps {
  values: readonly number[];
  /** Draws a dashed reference line at this value. */
  threshold?: number;
  tone?: SeverityTone;
  /** Text alternative describing what the chart shows. */
  label: string;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * Minimal trend line. The vertical axis is auto-scaled to the data (and the
 * threshold, if given), so it shows direction rather than absolute level.
 */
export function Sparkline({ values, threshold, tone = 'neutral', label }: SparklineProps) {
  if (values.length < 2) return null;

  const domain = threshold === undefined ? values : [...values, threshold];
  const min = Math.min(...domain);
  const max = Math.max(...domain);
  const span = max - min || 1;

  const x = (index: number) => (index / (values.length - 1)) * WIDTH;
  const y = (value: number) => HEIGHT - PADDING - ((value - min) / span) * (HEIGHT - PADDING * 2);

  const points = values.map((value, index) => `${round(x(index))},${round(y(value))}`).join(' ');

  return (
    <svg
      className={cx(styles.sparkline, styles[tone])}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      {threshold !== undefined && (
        <line
          className={styles.threshold}
          x1={0}
          x2={WIDTH}
          y1={round(y(threshold))}
          y2={round(y(threshold))}
        />
      )}
      <polyline className={styles.line} points={points} />
    </svg>
  );
}
