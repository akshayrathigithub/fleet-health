import { useId } from 'react';

import { Sparkline } from '@/components';
import { LEVEL_TONE } from '@/constants';
import { cx } from '@/utils/cx';

import { describeMetricLevel, getMetricLevel, METRIC_KEYS, METRICS } from '../../models/health';
import type { DeviceMetrics, MetricHistory } from '../../models/types';
import styles from './deviceDetail/index.module.scss';

interface MetricTrendsProps {
  metrics: DeviceMetrics;
  history: MetricHistory;
}

/** Current value and 7-day trend for each metric, against its warning threshold. */
export function MetricTrends({ metrics, history }: MetricTrendsProps) {
  const headingId = useId();

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <h3 id={headingId}>Last 7 days</h3>
        <p className={styles.sectionNote}>Dashed line = warning threshold</p>
      </div>

      <ul role="list" className={styles.charts}>
        {METRIC_KEYS.map((key) => {
          const { label, warning } = METRICS[key];
          const value = metrics[key];
          const level = getMetricLevel(key, value);
          const values = history[key];
          const start = values[0] ?? value;

          return (
            <li key={key} className={cx(styles.chart, level !== 'ok' && styles[level])}>
              <p className={styles.chartLabel}>{label}</p>
              <p className={styles.chartValue}>{value}%</p>
              <Sparkline
                values={values}
                threshold={warning}
                tone={LEVEL_TONE[level]}
                label={`${label} over the last 7 days: from ${start}% to ${value}%. Warning threshold ${warning}%.`}
              />
              <p className={styles.chartNote}>{describeMetricLevel(key, level)}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
