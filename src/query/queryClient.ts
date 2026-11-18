import { QueryClient } from '@tanstack/react-query';

import { QUERY_MAX_RETRIES, QUERY_STALE_TIME_MS } from '@/constants';
import { ApiError } from '@/services/http';

/** Retry once for flaky networks, but never for "not found": asking again won't help. */
function shouldRetry(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status === 404) return false;
  return failureCount < QUERY_MAX_RETRIES;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Health data changes slowly; avoid refetching on every remount.
        staleTime: QUERY_STALE_TIME_MS,
        retry: shouldRetry,
      },
    },
  });
}
