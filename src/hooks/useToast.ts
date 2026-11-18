import { useContext } from 'react';

import { ToastContext, type ShowToast } from '@/context/toast';

/** Returns a function that shows a short, auto-dismissing confirmation message. */
export function useToast(): ShowToast {
  const showToast = useContext(ToastContext);
  if (!showToast) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return showToast;
}
