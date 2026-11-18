import { useQuery } from '@tanstack/react-query';

import { deviceApi } from '@/services/deviceApi';

import { deviceKeys } from './deviceKeys';

export function useDevices() {
  return useQuery({
    queryKey: deviceKeys.list(),
    queryFn: deviceApi.list,
  });
}

export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: deviceKeys.detail(deviceId),
    queryFn: () => deviceApi.get(deviceId),
  });
}
