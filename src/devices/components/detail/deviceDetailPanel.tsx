import { StateMessage } from '@/components';

import { DeviceDetail } from './deviceDetail';
import styles from './deviceDetail/index.module.scss';

/**
 * The right-hand column. With no device selected it shows a prompt on wide
 * screens and nothing on narrow ones, where the list has the full width.
 */
export function DeviceDetailPanel({ deviceId }: { deviceId: string | undefined }) {
  if (!deviceId) {
    return (
      <aside className={styles.placeholder} aria-label="Device details">
        <StateMessage
          icon="search"
          title="Select a device"
          description="Choose a device from the list to see its trends, alerts and actions."
        />
      </aside>
    );
  }

  // Keyed so switching devices resets all local state (open dialogs, focus).
  return <DeviceDetail key={deviceId} deviceId={deviceId} />;
}
