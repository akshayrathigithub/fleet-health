import { useEffect, useId, useRef, type ReactNode } from 'react';

import { Button } from '../button';
import { Icon } from '../icon';
import styles from './index.module.scss';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  /** Explains what will happen if the user confirms. */
  children: ReactNode;
  confirmLabel: string;
  /** Shown on the confirm button while `pending` is true. */
  pendingLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  errorMessage?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal confirmation built on the native <dialog>. `showModal()` gives us the
 * focus trap, Escape to cancel, an inert page behind, and focus returning to
 * the trigger on close, without custom focus-management code.
 *
 * Cancel comes first in the DOM so it receives initial focus: the safe choice
 * is the default one.
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  pendingLabel = confirmLabel,
  cancelLabel = 'Cancel',
  pending = false,
  errorMessage,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      // Escape: keep the dialog open while a request is in flight.
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onCancel();
      }}
      // Keep React state in sync if the browser closes the dialog itself.
      onClose={() => {
        if (open) onCancel();
      }}
    >
      <div className={styles.body}>
        <h2 id={titleId} className={styles.title}>
          {title}
        </h2>
        <div id={descriptionId} className={styles.description}>
          {children}
        </div>

        {errorMessage && (
          <p className={styles.error} role="alert">
            <Icon name="critical" />
            {errorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <Button onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="primary" loading={pending} onClick={onConfirm}>
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
