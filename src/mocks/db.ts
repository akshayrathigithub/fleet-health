import { HOUR_MS, MINUTE_MS } from '@/constants';
import { withAlertAcknowledged } from '@/devices/models/alerts';
import type {
  AlertSeverity,
  DeviceDetail,
  DeviceMetrics,
  DeviceSummary,
  MetricHistory,
} from '@/devices/models/types';

import seedJson from './data/devices.json';

/**
 * In-memory stand-in for the backend's database. It is seeded from
 * data/devices.json and lives for the lifetime of the page: changes made
 * through the API persist until reload.
 *
 * The seed stores times relative to "now" (minutes or hours ago) so the data
 * never goes stale. They become ISO timestamps here, which is what a real
 * API would send.
 */
interface SeedAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  raisedHoursAgo: number;
  acknowledgedHoursAgo: number | null;
}

interface SeedDevice {
  id: string;
  model: string;
  owner: string;
  team: string;
  os: string;
  serial: string;
  enrolledAt: string;
  minutesSinceCheckIn: number;
  metrics: DeviceMetrics | null;
  history: MetricHistory | null;
  alerts: SeedAlert[];
}

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

function fromSeed(seed: SeedDevice): DeviceDetail {
  const { minutesSinceCheckIn, alerts, ...device } = seed;

  return {
    ...device,
    lastCheckInAt: ago(minutesSinceCheckIn * MINUTE_MS),
    replacementFlaggedAt: null,
    alerts: alerts.map(({ raisedHoursAgo, acknowledgedHoursAgo, ...alert }) => ({
      ...alert,
      raisedAt: ago(raisedHoursAgo * HOUR_MS),
      acknowledgedAt: acknowledgedHoursAgo === null ? null : ago(acknowledgedHoursAgo * HOUR_MS),
    })),
  };
}

function toSummary(device: DeviceDetail): DeviceSummary {
  const { id, model, owner, team, lastCheckInAt, metrics, replacementFlaggedAt } = device;
  return { id, model, owner, team, lastCheckInAt, metrics, replacementFlaggedAt };
}

// JSON imports widen string unions to `string`; the seed file is trusted to match.
const seed = seedJson as SeedDevice[];

// Lives in memory only: changes last until the page is reloaded.
const devices = new Map<string, DeviceDetail>(seed.map((item) => [item.id, fromSeed(item)]));

export const db = {
  listDevices: (): DeviceSummary[] => [...devices.values()].map(toSummary),

  getDevice: (deviceId: string): DeviceDetail | undefined => devices.get(deviceId),

  acknowledgeAlert(deviceId: string, alertId: string): DeviceDetail | undefined {
    const device = devices.get(deviceId);
    if (!device || !device.alerts.some((alert) => alert.id === alertId)) return undefined;

    const updated = withAlertAcknowledged(device, alertId, new Date().toISOString());
    devices.set(deviceId, updated);
    return updated;
  },

  flagForReplacement(deviceId: string): DeviceDetail | undefined {
    const device = devices.get(deviceId);
    if (!device) return undefined;

    // Idempotent: flagging twice keeps the original timestamp.
    const updated: DeviceDetail = {
      ...device,
      replacementFlaggedAt: device.replacementFlaggedAt ?? new Date().toISOString(),
    };
    devices.set(deviceId, updated);
    return updated;
  },
};
