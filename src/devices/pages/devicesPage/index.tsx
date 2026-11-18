import { useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router';

import { Button, StateMessage } from '@/components';
import { useDevices } from '@/query/queries';

import { DeviceDetailPanel } from '../../components/detail/deviceDetailPanel';
import { DeviceFilters } from '../../components/deviceFilters';
import { DeviceListSkeleton } from '../../components/deviceListSkeleton';
import { DeviceTable } from '../../components/deviceTable';
import { SummaryStrip } from '../../components/summaryStrip';
import { useDeviceFilters } from '../../hooks/useDeviceFilters';
import { ALL, countByStatus, getTeams, selectVisibleDevices } from '../../models/filters';
import { deviceLinkId, readNavigationState } from '../../navigation';
import styles from './index.module.scss';

/**
 * The fleet workspace: summary, filterable device list and the selected
 * device's detail.
 *
 * This is the only component that wires state together. Server state comes
 * from the query cache, view state from the URL, and everything shown is
 * derived from those two during render, so nothing can drift out of sync.
 */
export function DevicesPage() {
  const { deviceId } = useParams();
  const location = useLocation();
  const { filters, setFilters, resetFilters, hasActiveFilters } = useDeviceFilters();

  const devicesQuery = useDevices();
  const devices = devicesQuery.data;

  const counts = useMemo(() => (devices ? countByStatus(devices) : null), [devices]);
  const teams = useMemo(() => (devices ? getTeams(devices) : []), [devices]);
  const visibleDevices = useMemo(
    () => (devices ? selectVisibleDevices(devices, filters) : []),
    [devices, filters],
  );

  useEffect(() => {
    document.title = deviceId ? `${deviceId} · Fleet Health` : 'Devices · Fleet Health';
  }, [deviceId]);

  // Coming back from a device on a narrow screen: return focus to the row the
  // admin opened, so they continue from where they left off.
  const { focusDeviceId } = readNavigationState(location.state);
  useEffect(() => {
    if (!deviceId && focusDeviceId) {
      document.getElementById(deviceLinkId(focusDeviceId))?.focus();
    }
  }, [deviceId, focusDeviceId]);

  return (
    <div className={styles.page} data-detail-open={deviceId ? 'true' : 'false'}>
      <div className={styles.overview}>
        <header className={styles.pageHead}>
          <h1 className={styles.title}>Devices</h1>
          <p className={styles.subtitle}>
            {counts && devices
              ? `${devices.length} enrolled laptops · ${counts.critical + counts.warning} need attention`
              : devicesQuery.isError
                ? 'Fleet health is unavailable right now'
                : 'Checking fleet health…'}
          </p>
        </header>

        <SummaryStrip
          counts={counts}
          activeStatus={filters.status}
          onSelect={(status) => setFilters({ status })}
        />
      </div>

      <div className={styles.workspace}>
        <section className={styles.list} aria-labelledby="device-list-heading">
          <h2 id="device-list-heading" className="visually-hidden">
            Device list
          </h2>

          <DeviceFilters filters={filters} teams={teams} onChange={setFilters} />

          {devicesQuery.isPending ? (
            <DeviceListSkeleton />
          ) : devicesQuery.isError ? (
            <StateMessage
              icon="critical"
              tone="critical"
              title="Couldn't load devices"
              description="The fleet service didn't respond. Your filters are kept."
              action={
                <Button variant="primary" onClick={() => void devicesQuery.refetch()}>
                  Try again
                </Button>
              }
              role="alert"
            />
          ) : (
            <>
              {/* Announced by screen readers whenever filtering changes the count. */}
              <p className={styles.resultCount} role="status">
                Showing {visibleDevices.length} of {devicesQuery.data.length} devices
              </p>

              {visibleDevices.length > 0 ? (
                <DeviceTable devices={visibleDevices} selectedId={deviceId} />
              ) : devicesQuery.data.length === 0 ? (
                <StateMessage
                  icon="search"
                  title="No devices enrolled yet"
                  description="Devices appear here once the monitoring agent is installed on them."
                />
              ) : filters.status !== ALL && !filters.query.trim() && filters.team === ALL ? (
                <StateMessage
                  icon="check"
                  tone="success"
                  title={`No ${filters.status} devices`}
                  description="Nothing in the fleet has this status right now."
                  action={<Button onClick={resetFilters}>View all devices</Button>}
                />
              ) : (
                <StateMessage
                  icon="search"
                  title="No devices match these filters"
                  description="Try removing a filter, or search by owner name instead."
                  action={hasActiveFilters && <Button onClick={resetFilters}>Clear filters</Button>}
                />
              )}
            </>
          )}
        </section>

        <DeviceDetailPanel deviceId={deviceId} />
      </div>
    </div>
  );
}
