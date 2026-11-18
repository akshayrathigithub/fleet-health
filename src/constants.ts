import type { IconName } from '@/components/icon';
import type { SeverityTone, Tone } from '@/components/tone';
import type { AlertSeverity, HealthStatus, MetricKey, MetricLevel } from '@/devices/models/types';

/* ---------- Application routes ---------- */

export const ROUTES = {
  devices: '/devices',
  /** Relative React Router pattern under the layout route. */
  devicesPattern: 'devices/:deviceId?',
  device: (deviceId: string) => `/devices/${encodeURIComponent(deviceId)}`,
} as const;

/** Keep in sync with `$bp-detail` in styles/_mixins.scss. */
export const DETAIL_BESIDE_LIST_QUERY = '(min-width: 1200px)';

/* ---------- Device API ---------- */

const segment = encodeURIComponent;

export const API_PATHS = {
  devices: '/api/devices',
  device: (deviceId: string) => `/api/devices/${segment(deviceId)}`,
  acknowledgeAlert: (deviceId: string, alertId: string) =>
    `/api/devices/${segment(deviceId)}/alerts/${segment(alertId)}/acknowledge`,
  replacementFlag: (deviceId: string) => `/api/devices/${segment(deviceId)}/replacement-flag`,
} as const;

/** MSW path patterns (parameter placeholders, not encoded client URLs). */
export const API_PATTERNS = {
  devices: '/api/devices',
  device: '/api/devices/:deviceId',
  acknowledgeAlert: '/api/devices/:deviceId/alerts/:alertId/acknowledge',
  replacementFlag: '/api/devices/:deviceId/replacement-flag',
} as const;

/* ---------- Query ---------- */

export const QUERY_STALE_TIME_MS = 30_000;
export const QUERY_MAX_RETRIES = 1;

export const deviceKeys = {
  all: ['devices'] as const,
  list: () => [...deviceKeys.all, 'list'] as const,
  detail: (deviceId: string) => [...deviceKeys.all, 'detail', deviceId] as const,
};

/* ---------- Durations ---------- */

export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export const TOAST_AUTO_DISMISS_MS = 6000;
export const SELECT_TYPEAHEAD_MS = 500;
export const SELECT_VIEWPORT_MARGIN_PX = 8;
export const MOCK_SLOW_DELAY_MS = 3000;

/* ---------- Health ---------- */

interface MetricDefinition {
  label: string;
  /** Compact label for table headers and cards. */
  shortLabel: string;
  /** Whether high or low readings are the unhealthy direction. */
  badWhen: 'high' | 'low';
  /** Reading at which the metric becomes a warning. */
  warning: number;
  /** Reading at which the metric becomes critical. */
  critical: number;
}

/** Display order for metrics everywhere in the UI. */
export const METRIC_KEYS = [
  'cpu',
  'memory',
  'disk',
  'batteryHealth',
] as const satisfies readonly MetricKey[];

/**
 * Single source of truth for what each metric is called and when it becomes a
 * problem. Usage metrics are bad when high; battery health is bad when low.
 */
export const METRICS: Record<MetricKey, MetricDefinition> = {
  cpu: { label: 'CPU', shortLabel: 'CPU', badWhen: 'high', warning: 75, critical: 90 },
  memory: { label: 'Memory', shortLabel: 'Memory', badWhen: 'high', warning: 75, critical: 90 },
  disk: { label: 'Disk', shortLabel: 'Disk', badWhen: 'high', warning: 75, critical: 90 },
  batteryHealth: {
    label: 'Battery health',
    shortLabel: 'Battery',
    badWhen: 'low',
    warning: 70,
    critical: 60,
  },
};

/** Most urgent first. Offline ranks above healthy: a silent device needs a look. */
export const STATUS_BY_SEVERITY: readonly HealthStatus[] = [
  'critical',
  'warning',
  'offline',
  'healthy',
];

export const STATUS_META: Record<HealthStatus, { label: string; note: string }> = {
  critical: { label: 'Critical', note: 'Act today' },
  warning: { label: 'Warning', note: 'Act this week' },
  healthy: { label: 'Healthy', note: 'No action needed' },
  offline: { label: 'Offline', note: 'No check-in for 5+ days' },
};

export const ALERT_SEVERITY_RANK: Record<AlertSeverity, number> = {
  critical: 0,
  warning: 1,
};

/* ---------- Filters ---------- */

export const SORT_OPTIONS = [
  { value: 'severity', label: 'Severity' },
  { value: 'lastCheckIn', label: 'Last check-in (oldest)' },
  { value: 'name', label: 'Device name' },
  { value: 'disk', label: 'Disk usage (highest)' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['value'];

export const ALL = 'all';
export type StatusFilter = HealthStatus | typeof ALL;

export interface DeviceFilters {
  /** Free text matched against device name, owner and model. */
  query: string;
  status: StatusFilter;
  /** A team name, or ALL. */
  team: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: DeviceFilters = {
  query: '',
  status: ALL,
  team: ALL,
  sort: 'severity',
};

export const FILTER_PARAMS = {
  query: 'q',
  status: 'status',
  team: 'team',
  sort: 'sort',
} as const;

/* ---------- UI appearance ---------- */

/** Maps domain values to shared UI tones and icons, in one place. */
export const STATUS_APPEARANCE: Record<HealthStatus, { tone: Tone; icon: IconName }> = {
  critical: { tone: 'critical', icon: 'critical' },
  warning: { tone: 'warning', icon: 'warning' },
  healthy: { tone: 'success', icon: 'check' },
  offline: { tone: 'neutral', icon: 'offline' },
};

export const LEVEL_TONE: Record<MetricLevel, SeverityTone> = {
  ok: 'neutral',
  warning: 'warning',
  critical: 'critical',
};

export const ALERT_ICON: Record<AlertSeverity, IconName> = {
  critical: 'critical',
  warning: 'warning',
};

/* ---------- Component rendering ---------- */

/** Reading order for the summary cards: problems first, then the reassuring number. */
export const SUMMARY_CARD_ORDER: readonly HealthStatus[] = [
  'critical',
  'warning',
  'healthy',
  'offline',
];

/** Columns dropped first when the table is short on width. */
export const OPTIONAL_METRICS: ReadonlySet<MetricKey> = new Set(['batteryHealth']);

export const OPEN_DETAIL_STATE = { focusDetail: true } as const;

export const DEVICE_LIST_SKELETON_ROWS = 8;

export const EMPTY_STATUS_COUNTS: Record<HealthStatus, number> = {
  critical: 0,
  warning: 0,
  healthy: 0,
  offline: 0,
};
