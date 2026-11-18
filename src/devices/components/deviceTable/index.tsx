import { Link, useLocation } from 'react-router';

import { Meter, VisuallyHidden } from '@/components';
import { LEVEL_TONE, OPEN_DETAIL_STATE, OPTIONAL_METRICS } from '@/constants';
import { cx } from '@/utils/cx';
import { formatRelativeTime } from '@/utils/format';

import { getDeviceStatus, getMetricLevel, METRIC_KEYS, METRICS } from '../../models/health';
import type { DeviceSummary, MetricKey } from '../../models/types';
import { deviceDetailPath, deviceLinkId } from '../../navigation';
import { ReplacementBadge } from '../replacementBadge';
import { StatusBadge } from '../statusBadge';
import styles from './index.module.scss';

interface DeviceTableProps {
  devices: readonly DeviceSummary[];
  selectedId: string | undefined;
}

/**
 * One table at every width. On phones the CSS lays each row out as a card;
 * the markup, reading order and tab order do not change.
 *
 * The ARIA table roles repeat what the elements already mean. They are set
 * explicitly because some browsers drop table semantics once `display` is
 * overridden, which the card layout does.
 */
export function DeviceTable({ devices, selectedId }: DeviceTableProps) {
  const { search } = useLocation();

  return (
    <table role="table" className={styles.table}>
      <caption className="visually-hidden">
        Enrolled devices with health status and current metrics
      </caption>
      <thead role="rowgroup">
        <tr role="row">
          <th role="columnheader" scope="col">
            Device
          </th>
          <th role="columnheader" scope="col">
            Owner
          </th>
          <th role="columnheader" scope="col">
            Health
          </th>
          {METRIC_KEYS.map((key) => (
            <th
              key={key}
              role="columnheader"
              scope="col"
              className={cx(OPTIONAL_METRICS.has(key) && styles.optional)}
            >
              {METRICS[key].shortLabel}
            </th>
          ))}
          <th role="columnheader" scope="col" className={styles.optional}>
            Last check-in
          </th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        {devices.map((device) => {
          const isSelected = device.id === selectedId;

          return (
            <tr key={device.id} role="row" data-selected={isSelected || undefined}>
              <th role="rowheader" scope="row" className={styles.device}>
                <span className={styles.name}>
                  <Link
                    id={deviceLinkId(device.id)}
                    className={styles.link}
                    to={deviceDetailPath(device.id, search)}
                    state={OPEN_DETAIL_STATE}
                    aria-current={isSelected ? 'page' : undefined}
                  >
                    {device.id}
                  </Link>
                  {device.replacementFlaggedAt && <ReplacementBadge />}
                </span>
                <span className={styles.sub}>{device.model}</span>
              </th>
              <td role="cell" className={styles.owner}>
                {device.owner}
                <span className={styles.sub}>{device.team}</span>
              </td>
              <td role="cell" className={styles.health}>
                <StatusBadge status={getDeviceStatus(device.metrics)} />
              </td>
              {METRIC_KEYS.map((key) => (
                <MetricCell
                  key={key}
                  metricKey={key}
                  value={device.metrics ? device.metrics[key] : null}
                />
              ))}
              <td
                role="cell"
                className={cx(styles.seen, styles.optional)}
                data-label="Last check-in"
              >
                {formatRelativeTime(device.lastCheckInAt)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

interface MetricCellProps {
  metricKey: MetricKey;
  /** null when the device is offline and has no current reading. */
  value: number | null;
}

function MetricCell({ metricKey, value }: MetricCellProps) {
  const label = METRICS[metricKey].shortLabel;
  const optional = OPTIONAL_METRICS.has(metricKey) && styles.optional;

  if (value === null) {
    return (
      <td role="cell" className={cx(styles.metric, styles.noData, optional)} data-label={label}>
        <span aria-hidden="true">—</span>
        <VisuallyHidden>No data</VisuallyHidden>
      </td>
    );
  }

  const level = getMetricLevel(metricKey, value);

  return (
    <td
      role="cell"
      className={cx(styles.metric, level !== 'ok' && styles[level], optional)}
      data-label={label}
    >
      <span className={styles.value}>{value}%</span>
      {/* The colour and weight mean "warning"/"critical"; say so in text too. */}
      {level !== 'ok' && <VisuallyHidden> ({level})</VisuallyHidden>}
      <Meter value={value} tone={LEVEL_TONE[level]} />
    </td>
  );
}
