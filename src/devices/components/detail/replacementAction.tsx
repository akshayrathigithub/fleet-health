import { useEffect, useRef, useState } from 'react';

import { formatRelativeTime } from '@/utils/format';
import { useFlagForReplacement } from '@/query/mutations';
import { Button, ConfirmDialog, Icon, useToast } from '@/components';
import type { DeviceDetail } from '../../models/types';
import styles from './deviceDetail/index.module.scss';

/**
 * Flags a device for replacement. Because flagging notifies the owner, the
 * admin must confirm first, and nothing changes until the server agrees.
 */
export function ReplacementAction({ device }: { device: DeviceDetail }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const flagMutation = useFlagForReplacement(device.id);
  const showToast = useToast();

  // After a successful flag the button that opened the dialog is replaced by
  // a status line, so the browser has nothing to return focus to. Once the
  // dialog has closed, move focus to the status line instead: it gets
  // announced and keyboard users keep their place.
  const flaggedRef = useRef<HTMLParagraphElement>(null);
  const focusFlaggedStatus = useRef(false);
  useEffect(() => {
    if (!confirmOpen && device.replacementFlaggedAt && focusFlaggedStatus.current) {
      focusFlaggedStatus.current = false;
      flaggedRef.current?.focus();
    }
  }, [confirmOpen, device.replacementFlaggedAt]);

  const handleConfirm = () => {
    flagMutation.mutate(undefined, {
      onSuccess: () => {
        focusFlaggedStatus.current = true;
        setConfirmOpen(false);
        showToast(`${device.id} flagged for replacement`);
      },
    });
  };

  const handleCancel = () => {
    flagMutation.reset();
    setConfirmOpen(false);
  };

  return (
    <div className={styles.section}>
      {device.replacementFlaggedAt ? (
        <p ref={flaggedRef} tabIndex={-1} className={styles.flagged}>
          <Icon name="flag" />
          <span>
            Flagged for replacement {formatRelativeTime(device.replacementFlaggedAt)}.{' '}
            {device.owner} has been notified.
          </span>
        </p>
      ) : (
        <>
          <Button variant="primary" fullWidth onClick={() => setConfirmOpen(true)}>
            Flag for replacement
          </Button>
          <p className={styles.hint}>
            Adds this device to the replacement queue and notifies the owner.
          </p>
        </>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Flag ${device.id} for replacement?`}
        confirmLabel="Yes, flag for replacement"
        pendingLabel="Flagging…"
        pending={flagMutation.isPending}
        errorMessage={
          flagMutation.isError
            ? "Couldn't flag this device. Check your connection and try again."
            : null
        }
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      >
        This adds {device.owner}&rsquo;s {device.model} to the replacement queue and notifies{' '}
        {device.owner}.
      </ConfirmDialog>
    </div>
  );
}
