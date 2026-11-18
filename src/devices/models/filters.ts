import {
  ALL,
  DEFAULT_FILTERS,
  EMPTY_STATUS_COUNTS,
  FILTER_PARAMS,
  SORT_OPTIONS,
  STATUS_BY_SEVERITY,
  type DeviceFilters,
  type SortKey,
  type StatusFilter,
} from '@/constants';
import { getDeviceStatus } from './health';
import type { DeviceSummary, HealthStatus } from './types';

export { ALL, DEFAULT_FILTERS, SORT_OPTIONS, type DeviceFilters, type SortKey, type StatusFilter };

/* ---------- URL <-> filters ---------- */

const STATUS_FILTERS: readonly string[] = [ALL, ...STATUS_BY_SEVERITY];
const SORT_KEYS: readonly string[] = SORT_OPTIONS.map((option) => option.value);

const isStatusFilter = (value: string | null): value is StatusFilter =>
  value !== null && STATUS_FILTERS.includes(value);

const isSortKey = (value: string | null): value is SortKey =>
  value !== null && SORT_KEYS.includes(value);

/** Reads filters from search params. Unknown or missing values fall back to defaults. */
export function parseFilters(params: URLSearchParams): DeviceFilters {
  const status = params.get(FILTER_PARAMS.status);
  const sort = params.get(FILTER_PARAMS.sort);

  return {
    query: params.get(FILTER_PARAMS.query) ?? DEFAULT_FILTERS.query,
    status: isStatusFilter(status) ? status : DEFAULT_FILTERS.status,
    team: params.get(FILTER_PARAMS.team) ?? DEFAULT_FILTERS.team,
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

/**
 * Writes filters onto a copy of `base`, leaving unrelated params untouched.
 * Defaults are omitted so the URL stays short and shareable.
 */
export function writeFilters(filters: DeviceFilters, base: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(base);

  for (const key of Object.keys(FILTER_PARAMS) as (keyof DeviceFilters)[]) {
    if (filters[key] === DEFAULT_FILTERS[key]) {
      next.delete(FILTER_PARAMS[key]);
    } else {
      next.set(FILTER_PARAMS[key], filters[key]);
    }
  }
  return next;
}

export function hasActiveFilters(filters: DeviceFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.status !== DEFAULT_FILTERS.status ||
    filters.team !== DEFAULT_FILTERS.team
  );
}

/* ---------- Filtering and sorting ---------- */

export function filterDevices(
  devices: readonly DeviceSummary[],
  filters: DeviceFilters,
): DeviceSummary[] {
  const query = filters.query.trim().toLowerCase();

  return devices.filter((device) => {
    if (filters.status !== ALL && getDeviceStatus(device.metrics) !== filters.status) return false;
    if (filters.team !== ALL && device.team !== filters.team) return false;
    if (query === '') return true;

    return [device.id, device.owner, device.model].some((field) =>
      field.toLowerCase().includes(query),
    );
  });
}

type Comparator = (a: DeviceSummary, b: DeviceSummary) => number;

const byName: Comparator = (a, b) => a.id.localeCompare(b.id);

const severityRank = (device: DeviceSummary) =>
  STATUS_BY_SEVERITY.indexOf(getDeviceStatus(device.metrics));

/** Every comparator falls back to the device name so the order is stable. */
const COMPARATORS: Record<SortKey, Comparator> = {
  severity: (a, b) => severityRank(a) - severityRank(b) || byName(a, b),
  // ISO timestamps sort chronologically as strings.
  lastCheckIn: (a, b) => a.lastCheckInAt.localeCompare(b.lastCheckInAt) || byName(a, b),
  name: byName,
  // Offline devices have no reading, so they sort last.
  disk: (a, b) => (b.metrics?.disk ?? -1) - (a.metrics?.disk ?? -1) || byName(a, b),
};

export function sortDevices(devices: readonly DeviceSummary[], sort: SortKey): DeviceSummary[] {
  return [...devices].sort(COMPARATORS[sort]);
}

/** The list the admin sees: filtered, then sorted. */
export function selectVisibleDevices(
  devices: readonly DeviceSummary[],
  filters: DeviceFilters,
): DeviceSummary[] {
  return sortDevices(filterDevices(devices, filters), filters.sort);
}

/* ---------- Summaries ---------- */

export function countByStatus(devices: readonly DeviceSummary[]): Record<HealthStatus, number> {
  const counts = { ...EMPTY_STATUS_COUNTS };
  for (const device of devices) {
    counts[getDeviceStatus(device.metrics)] += 1;
  }
  return counts;
}

/** Distinct team names, A–Z, for the team filter. */
export function getTeams(devices: readonly DeviceSummary[]): string[] {
  return [...new Set(devices.map((device) => device.team))].sort((a, b) => a.localeCompare(b));
}
