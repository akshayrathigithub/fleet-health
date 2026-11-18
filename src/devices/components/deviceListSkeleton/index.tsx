import { Skeleton, VisuallyHidden } from '@/components';
import { DEVICE_LIST_SKELETON_ROWS } from '@/constants';

import styles from './index.module.scss';

/** Placeholder rows shown while the device list is loading. */
export function DeviceListSkeleton() {
  return (
    <div className={styles.list} aria-busy="true">
      <VisuallyHidden>Loading devices</VisuallyHidden>
      {Array.from({ length: DEVICE_LIST_SKELETON_ROWS }, (_, index) => (
        <div key={index} className={styles.row} aria-hidden="true">
          <div className={styles.stack}>
            <Skeleton width="55%" height="14px" />
            <Skeleton width="80%" height="10px" />
          </div>
          <Skeleton width="70%" />
          <Skeleton width="60%" height="20px" />
          <Skeleton width="50%" />
        </div>
      ))}
    </div>
  );
}
