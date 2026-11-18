import { Icon, VisuallyHidden } from '@/components';

import styles from './index.module.scss';

/**
 * Tag shown wherever a flagged device appears. Sighted users see the short
 * "Replacement"; screen readers hear "Flagged for replacement".
 * Drawn like an Ant Design red Tag, with a red flag.
 */
export function ReplacementBadge() {
  return (
    <span className={styles.tag}>
      <Icon name="flag" size={12} />
      <span>
        <VisuallyHidden>Flagged for </VisuallyHidden>Replacement
      </span>
    </span>
  );
}
