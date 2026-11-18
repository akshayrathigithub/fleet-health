import { METRIC_KEYS, METRICS, STATUS_BY_SEVERITY, STATUS_META } from '@/constants';
import type { DeviceMetrics, HealthStatus, MetricKey, MetricLevel } from './types';

export { METRIC_KEYS, METRICS, STATUS_BY_SEVERITY, STATUS_META };

export function getMetricLevel(key: MetricKey, value: number): MetricLevel {
  const { badWhen, warning, critical } = METRICS[key];

  if (badWhen === 'high') {
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'ok';
  }

  if (value < critical) return 'critical';
  if (value < warning) return 'warning';
  return 'ok';
}

/** A device is as unhealthy as its worst metric; no metrics means it is offline. */
export function getDeviceStatus(metrics: DeviceMetrics | null): HealthStatus {
  if (metrics === null) return 'offline';

  const levels = METRIC_KEYS.map((key) => getMetricLevel(key, metrics[key]));
  if (levels.includes('critical')) return 'critical';
  if (levels.includes('warning')) return 'warning';
  return 'healthy';
}

/** Plain-language explanation of a metric's level, e.g. "Above 90% critical threshold". */
export function describeMetricLevel(key: MetricKey, level: MetricLevel): string {
  if (level === 'ok') return 'Within normal range';

  const definition = METRICS[key];
  const direction = definition.badWhen === 'high' ? 'Above' : 'Below';
  return `${direction} ${definition[level]}% ${level} threshold`;
}
