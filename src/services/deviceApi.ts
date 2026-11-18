import type { DeviceDetail, DeviceSummary } from '@/devices/models/types';
import { API_PATHS } from '@/constants';
import { request } from '@/services/http';

/** The device endpoints, one function per call. Components never call fetch directly. */
export const deviceApi = {
  list: () => request<DeviceSummary[]>(API_PATHS.devices),

  get: (deviceId: string) => request<DeviceDetail>(API_PATHS.device(deviceId)),

  acknowledgeAlert: (deviceId: string, alertId: string) =>
    request<DeviceDetail>(API_PATHS.acknowledgeAlert(deviceId, alertId), { method: 'POST' }),

  flagForReplacement: (deviceId: string) =>
    request<DeviceDetail>(API_PATHS.replacementFlag(deviceId), { method: 'PUT' }),
};
