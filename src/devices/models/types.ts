/** Overall health of a device, derived from its metrics (see health.ts). */
export type HealthStatus = 'critical' | 'warning' | 'healthy' | 'offline';

export type MetricKey = 'cpu' | 'memory' | 'disk' | 'batteryHealth';

/** How far a single metric is from its healthy range. */
export type MetricLevel = 'ok' | 'warning' | 'critical';

/** Current readings, each a percentage from 0 to 100. */
export type DeviceMetrics = Record<MetricKey, number>;

/** One reading per day, oldest first; the last entry is the current value. */
export type MetricHistory = Record<MetricKey, number[]>;

export type AlertSeverity = 'warning' | 'critical';

export interface DeviceAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  /** ISO 8601 timestamp */
  raisedAt: string;
  /** ISO 8601 timestamp, or null while the alert still needs attention. */
  acknowledgedAt: string | null;
}

/** What `GET /api/devices` returns for each device: enough for the list. */
export interface DeviceSummary {
  /** Asset tag, e.g. "MBP-0142". Unique and shown to the admin as the device name. */
  id: string;
  model: string;
  owner: string;
  team: string;
  /** ISO 8601 timestamp */
  lastCheckInAt: string;
  /** null when the device has stopped reporting (it is offline). */
  metrics: DeviceMetrics | null;
  /** ISO 8601 timestamp, or null if the device has not been flagged. */
  replacementFlaggedAt: string | null;
}

/** What `GET /api/devices/:id` returns: the summary plus detail-only fields. */
export interface DeviceDetail extends DeviceSummary {
  os: string;
  serial: string;
  /** ISO 8601 date */
  enrolledAt: string;
  /** null when the device is offline. */
  history: MetricHistory | null;
  alerts: DeviceAlert[];
}
