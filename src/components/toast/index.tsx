import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { TOAST_AUTO_DISMISS_MS } from '@/constants';
import { ToastContext, type ShowToast, type ToastTone } from '@/context/toast';
import { cx } from '@/utils/cx';

import { Icon } from '../icon';
import styles from './index.module.scss';

interface ToastState {
  id: number;
  message: string;
  tone: ToastTone;
}

/**
 * Shows one toast at a time; a new message replaces the current one.
 *
 * The live region is always in the DOM, and only its content changes. Screen
 * readers announce changes inside an existing live region, not a region that
 * appears already filled.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback<ShowToast>((message, tone = 'success') => {
    nextId.current += 1;
    setToast({ id: nextId.current, message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), TOAST_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext value={showToast}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toast && (
          <div key={toast.id} className={cx(styles.toast, styles[toast.tone])}>
            <Icon name={toast.tone === 'error' ? 'critical' : 'check'} />
            <p className={styles.message}>{toast.message}</p>
            <button
              type="button"
              className={styles.dismiss}
              aria-label="Dismiss notification"
              onClick={() => setToast(null)}
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        )}
      </div>
    </ToastContext>
  );
}
