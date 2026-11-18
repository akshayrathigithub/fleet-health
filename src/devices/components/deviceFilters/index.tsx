import { useMemo } from 'react';

import { SearchField, Select, type SelectOption } from '@/components';

import {
  ALL,
  SORT_OPTIONS,
  type DeviceFilters as Filters,
  type StatusFilter,
} from '../../models/filters';
import { STATUS_BY_SEVERITY, STATUS_META } from '../../models/health';
import styles from './index.module.scss';

const STATUS_OPTIONS: readonly SelectOption<StatusFilter>[] = [
  { value: ALL, label: 'All statuses' },
  ...STATUS_BY_SEVERITY.map((status) => ({ value: status, label: STATUS_META[status].label })),
];

interface DeviceFiltersProps {
  filters: Filters;
  /** Team names present in the fleet. */
  teams: readonly string[];
  onChange: (patch: Partial<Filters>) => void;
}

/** Search, filter and sort controls. Results update as the admin types or picks. */
export function DeviceFilters({ filters, teams, onChange }: DeviceFiltersProps) {
  const teamOptions = useMemo<SelectOption<string>[]>(
    () => [
      { value: ALL, label: 'All teams' },
      ...teams.map((team) => ({ value: team, label: team })),
    ],
    [teams],
  );

  return (
    <form
      role="search"
      aria-label="Search and filter devices"
      className={styles.toolbar}
      // There is nothing to submit: every change applies immediately.
      onSubmit={(event) => event.preventDefault()}
    >
      <SearchField
        label="Search"
        placeholder="Device name, owner or model"
        value={filters.query}
        onChange={(query) => onChange({ query })}
        className={styles.search}
      />
      <Select
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />
      <Select
        label="Team"
        value={filters.team}
        options={teamOptions}
        onChange={(team) => onChange({ team })}
      />
      <Select
        label="Sort by"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(sort) => onChange({ sort })}
      />
    </form>
  );
}
