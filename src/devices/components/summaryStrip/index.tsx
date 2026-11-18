import { Icon, VisuallyHidden } from '@/components';
import {
  ALL,
  STATUS_APPEARANCE,
  STATUS_META,
  SUMMARY_CARD_ORDER,
  type StatusFilter,
} from '@/constants';
import { cx } from '@/utils/cx';

import type { HealthStatus } from '../../models/types';
import styles from './index.module.scss';

interface SummaryStripProps {
  /** null while the device list is loading. */
  counts: Record<HealthStatus, number> | null;
  activeStatus: StatusFilter;
  onSelect: (status: StatusFilter) => void;
}

/**
 * Fleet totals by status. Each card is a toggle button that filters the list
 * to that status; pressing the active card clears the filter.
 */
export function SummaryStrip({ counts, activeStatus, onSelect }: SummaryStripProps) {
  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="visually-hidden">
        Fleet summary
      </h2>
      <ul role="list" className={styles.strip}>
        {SUMMARY_CARD_ORDER.map((status) => {
          const { label, note } = STATUS_META[status];
          const { tone, icon } = STATUS_APPEARANCE[status];
          const isActive = activeStatus === status;

          return (
            <li key={status}>
              <button
                type="button"
                className={cx(styles.card, styles[tone])}
                aria-pressed={isActive}
                onClick={() => onSelect(isActive ? ALL : status)}
              >
                <span className={styles.label}>
                  <Icon name={icon} />
                  {label}
                </span>
                <span className={styles.value}>
                  {counts ? (
                    counts[status]
                  ) : (
                    <>
                      <span aria-hidden="true">–</span>
                      <VisuallyHidden>loading</VisuallyHidden>
                    </>
                  )}
                </span>
                <span className={styles.note}>{note}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
