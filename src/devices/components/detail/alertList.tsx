import { useId, useRef } from 'react';

import { Button, Icon, useToast, VisuallyHidden } from '@/components';
import { ALERT_ICON } from '@/constants';
import { useAcknowledgeAlert } from '@/query/mutations';
import { cx } from '@/utils/cx';
import { formatRelativeTime } from '@/utils/format';

import { countActiveAlerts, sortAlerts } from '../../models/alerts';
import type { DeviceAlert } from '../../models/types';
import styles from './deviceDetail/index.module.scss';

interface AlertListProps {
  deviceId: string;
  alerts: readonly DeviceAlert[];
}

export function AlertList({ deviceId, alerts }: AlertListProps) {
  const headingId = useId();
  const sorted = sortAlerts(alerts);
  const activeCount = countActiveAlerts(alerts);

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <div className={styles.sectionHead}>
        <h3 id={headingId}>Alerts</h3>
        {alerts.length > 0 && (
          <p className={styles.sectionNote}>
            {activeCount} active · {alerts.length - activeCount} acknowledged
          </p>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className={styles.muted}>No alerts for this device.</p>
      ) : (
        <ul role="list" className={styles.alerts}>
          {sorted.map((alert) => (
            <AlertItem key={alert.id} deviceId={deviceId} alert={alert} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AlertItem({ deviceId, alert }: { deviceId: string; alert: DeviceAlert }) {
  const itemRef = useRef<HTMLLIElement>(null);
  const acknowledge = useAcknowledgeAlert(deviceId);
  const showToast = useToast();

  const handleAcknowledge = () => {
    acknowledge.mutate(alert.id, {
      onSuccess: () => showToast(`Alert acknowledged: ${alert.title}`),
      onError: () =>
        showToast(`Couldn't acknowledge "${alert.title}". The change was undone.`, 'error'),
    });

    // The optimistic update removes the button that has focus. Park focus on
    // the alert itself so keyboard users keep their place in the list.
    itemRef.current?.focus();
  };

  if (alert.acknowledgedAt !== null) {
    return (
      <li ref={itemRef} tabIndex={-1} className={cx(styles.alert, styles.acknowledged)}>
        <Icon name="check" className={styles.alertIcon} />
        <div>
          <p className={styles.alertTitle}>{alert.title}</p>
          <p className={styles.alertText}>{alert.description}</p>
          <p className={styles.alertText}>
            Acknowledged {formatRelativeTime(alert.acknowledgedAt)}
          </p>
        </div>
      </li>
    );
  }

  return (
    <li ref={itemRef} tabIndex={-1} className={cx(styles.alert, styles[alert.severity])}>
      <Icon name={ALERT_ICON[alert.severity]} className={styles.alertIcon} />
      <div>
        <p className={styles.alertTitle}>
          <VisuallyHidden>{alert.severity}: </VisuallyHidden>
          {alert.title}
        </p>
        <p className={styles.alertText}>
          {alert.description} · raised {formatRelativeTime(alert.raisedAt)}
        </p>
        <Button
          size="sm"
          className={styles.alertAction}
          // Several alerts have this button, so name which one it acts on.
          aria-label={`Acknowledge alert: ${alert.title}`}
          onClick={handleAcknowledge}
        >
          Acknowledge
        </Button>
      </div>
    </li>
  );
}
