import { useMutation, useQueryClient } from '@tanstack/react-query';

import { withAlertAcknowledged } from '@/devices/models/alerts';
import type { DeviceDetail, DeviceSummary } from '@/devices/models/types';
import { deviceApi } from '@/services/deviceApi';

import { deviceKeys } from './deviceKeys';

/**
 * Acknowledging is low-stakes and easy to retry, so the UI updates
 * optimistically: the alert changes immediately and is rolled back if the
 * request fails.
 */
export function useAcknowledgeAlert(deviceId: string) {
  const queryClient = useQueryClient();
  const detailKey = deviceKeys.detail(deviceId);

  return useMutation({
    mutationFn: (alertId: string) => deviceApi.acknowledgeAlert(deviceId, alertId),

    onMutate: async (alertId) => {
      // Stop in-flight refetches from overwriting the optimistic state.
      await queryClient.cancelQueries({ queryKey: detailKey });

      const previous = queryClient.getQueryData<DeviceDetail>(detailKey);
      if (previous) {
        queryClient.setQueryData<DeviceDetail>(
          detailKey,
          withAlertAcknowledged(previous, alertId, new Date().toISOString()),
        );
      }
      return { previous };
    },

    onError: (_error, _alertId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(detailKey, context.previous);
      }
    },

    // Success or failure, re-sync with the server's version of the device.
    onSettled: () => queryClient.invalidateQueries({ queryKey: detailKey }),
  });
}

/**
 * Flagging notifies the device owner, so it is not optimistic: the UI waits
 * for the server to confirm, then writes the result into both caches so the
 * detail panel and the table row change together.
 */
export function useFlagForReplacement(deviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deviceApi.flagForReplacement(deviceId),

    onSuccess: (device) => {
      queryClient.setQueryData<DeviceDetail>(deviceKeys.detail(deviceId), device);
      queryClient.setQueryData<DeviceSummary[]>(deviceKeys.list(), (devices) =>
        devices?.map((item) =>
          item.id === device.id
            ? { ...item, replacementFlaggedAt: device.replacementFlaggedAt }
            : item,
        ),
      );
    },
  });
}
