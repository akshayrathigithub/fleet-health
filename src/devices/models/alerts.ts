import { ALERT_SEVERITY_RANK } from '@/constants';
import type { DeviceAlert, DeviceDetail } from './types';

/**
 * Critical first, then newest first. Acknowledging does not move an alert, so
 * the list stays put (and keeps keyboard focus) when the admin acts on it.
 */
export function sortAlerts(alerts: readonly DeviceAlert[]): DeviceAlert[] {
  return [...alerts].sort(
    (a, b) =>
      ALERT_SEVERITY_RANK[a.severity] - ALERT_SEVERITY_RANK[b.severity] ||
      b.raisedAt.localeCompare(a.raisedAt),
  );
}

export function countActiveAlerts(alerts: readonly DeviceAlert[]): number {
  return alerts.filter((alert) => alert.acknowledgedAt === null).length;
}

/**
 * Returns a copy of the device with one alert acknowledged. Used both for the
 * optimistic UI update and by the mock API, so they cannot disagree.
 */
export function withAlertAcknowledged(
  device: DeviceDetail,
  alertId: string,
  acknowledgedAt: string,
): DeviceDetail {
  return {
    ...device,
    alerts: device.alerts.map((alert) =>
      alert.id === alertId && alert.acknowledgedAt === null ? { ...alert, acknowledgedAt } : alert,
    ),
  };
}
