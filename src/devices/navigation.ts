import type { To } from 'react-router';

import { DETAIL_BESIDE_LIST_QUERY, ROUTES } from '@/constants';

/**
 * Router `location.state` used to move keyboard focus after navigating
 * between the list and a device, so focus follows what the user just did.
 */
export interface DeviceNavigationState {
  /** Set when a device is opened from the list: focus its detail panel. */
  focusDetail?: boolean;
  /** Set when returning to the list: focus this device's link again. */
  focusDeviceId?: string;
}

export function readNavigationState(state: unknown): DeviceNavigationState {
  return typeof state === 'object' && state !== null ? (state as DeviceNavigationState) : {};
}

/** Links keep the current search string so filters survive opening a device. */
export const deviceListPath = (search: string): To => ({ pathname: ROUTES.devices, search });

export const deviceDetailPath = (deviceId: string, search: string): To => ({
  pathname: ROUTES.device(deviceId),
  search,
});

export const deviceLinkId = (deviceId: string) => `device-link-${deviceId}`;

/**
 * At this width and above the detail panel sits beside the list. Below it,
 * the detail replaces the list like a separate page. Keep in sync with the
 * 1200px media queries in the CSS.
 */
export function isDetailBesideList(): boolean {
  return (
    typeof window.matchMedia === 'function' && window.matchMedia(DETAIL_BESIDE_LIST_QUERY).matches
  );
}
