import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import {
  DEFAULT_FILTERS,
  hasActiveFilters,
  parseFilters,
  writeFilters,
  type DeviceFilters,
} from '../models/filters';

/**
 * The URL is the single owner of filter state. That makes a filtered view
 * shareable and bookmarkable, and it survives a refresh.
 *
 * Updates replace the history entry, so the Back button leaves the page
 * instead of stepping through every keystroke in the search box.
 */
export function useDeviceFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (patch: Partial<DeviceFilters>) => {
      setSearchParams((current) => writeFilters({ ...parseFilters(current), ...patch }, current), {
        replace: true,
      });
    },
    [setSearchParams],
  );

  const resetFilters = useCallback(() => {
    // Sorting is a view preference rather than a filter, so it is kept.
    const { query, status, team } = DEFAULT_FILTERS;
    setFilters({ query, status, team });
  }, [setFilters]);

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters: hasActiveFilters(filters),
  };
}
