import { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router';

import { formatDate, formatRelativeTime } from '@/utils/format';
import { ApiError } from '@/services/http';
import { Button, Icon, Skeleton, StateMessage, VisuallyHidden } from '@/components';
import { useDevice } from '@/query/queries';

import { getDeviceStatus } from '../../../models/health';
import type { DeviceDetail as Device } from '../../../models/types';
import {
  deviceListPath,
  isDetailBesideList,
  readNavigationState,
  type DeviceNavigationState,
} from '../../../navigation';
import { ReplacementBadge } from '../../replacementBadge';
import { StatusBadge } from '../../statusBadge';
import { AlertList } from '../alertList';
import { MetricTrends } from '../metricTrends';
import { ReplacementAction } from '../replacementAction';
import styles from './index.module.scss';

/**
 * Everything about one device: identity, 7-day trends, alerts and the
 * replacement action. Beside the list on wide screens; on narrow screens it
 * takes the place of the list, with a link back.
 */
export function DeviceDetail({ deviceId }: { deviceId: string }) {
  const location = useLocation();
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);

  const deviceQuery = useDevice(deviceId);
  const device = deviceQuery.data;

  // When the admin opens a device from the list, move focus to this panel so
  // keyboard and screen reader users land on what they just asked for.
  const { focusDetail } = readNavigationState(location.state);
  useEffect(() => {
    if (!focusDetail) return;

    if (!isDetailBesideList()) {
      // The detail has replaced the list: start at its top, not mid-page.
      window.scrollTo({ top: 0 });
    }
    panelRef.current?.focus({ preventScroll: true });
  }, [focusDetail]);

  const backState: DeviceNavigationState = { focusDeviceId: deviceId };

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={styles.panel}
      aria-labelledby={headingId}
      aria-busy={deviceQuery.isPending}
    >
      <Link className={styles.back} to={deviceListPath(location.search)} state={backState}>
        <Icon name="arrow-left" />
        Back to devices
      </Link>

      <header className={styles.head}>
        <div>
          <h2 id={headingId} className={styles.title}>
            {deviceId}
          </h2>
          {device && <p className={styles.model}>{device.model}</p>}
        </div>
        {device && (
          <div className={styles.badges}>
            <StatusBadge status={getDeviceStatus(device.metrics)} />
            {device.replacementFlaggedAt && <ReplacementBadge />}
          </div>
        )}
      </header>

      {deviceQuery.isPending ? (
        <DetailSkeleton />
      ) : deviceQuery.isError ? (
        <DetailError
          error={deviceQuery.error}
          deviceId={deviceId}
          onRetry={() => void deviceQuery.refetch()}
        />
      ) : (
        <DetailBody device={deviceQuery.data} />
      )}
    </section>
  );
}

function DetailBody({ device }: { device: Device }) {
  const facts = [
    { term: 'Owner', value: device.owner },
    { term: 'Team', value: device.team },
    { term: 'OS', value: device.os },
    { term: 'Serial', value: device.serial },
    { term: 'Enrolled', value: formatDate(device.enrolledAt) },
    { term: 'Last check-in', value: formatRelativeTime(device.lastCheckInAt) },
  ];

  return (
    <>
      <dl className={styles.facts}>
        {facts.map(({ term, value }) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {device.metrics && device.history ? (
        <MetricTrends metrics={device.metrics} history={device.history} />
      ) : (
        <section className={styles.section} aria-label="Metrics">
          <p className={styles.muted}>
            No current metrics. This device last checked in{' '}
            {formatRelativeTime(device.lastCheckInAt)}.
          </p>
        </section>
      )}

      <AlertList deviceId={device.id} alerts={device.alerts} />
      <ReplacementAction device={device} />
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className={styles.skeleton}>
      <VisuallyHidden>Loading device details</VisuallyHidden>
      <Skeleton width="60%" />
      <Skeleton width="85%" />
      <Skeleton height="96px" />
      <Skeleton width="40%" />
      <Skeleton height="64px" />
      <Skeleton height="64px" />
    </div>
  );
}

interface DetailErrorProps {
  error: Error;
  deviceId: string;
  onRetry: () => void;
}

function DetailError({ error, deviceId, onRetry }: DetailErrorProps) {
  if (error instanceof ApiError && error.status === 404) {
    return (
      <StateMessage
        icon="search"
        title="Device not found"
        description={`No enrolled device has the ID "${deviceId}". It may have been removed.`}
        role="alert"
      />
    );
  }

  return (
    <StateMessage
      icon="critical"
      tone="critical"
      title="Couldn't load this device"
      description="The fleet service didn't respond. Check your connection and try again."
      action={
        <Button variant="primary" onClick={onRetry}>
          Try again
        </Button>
      }
      role="alert"
    />
  );
}
