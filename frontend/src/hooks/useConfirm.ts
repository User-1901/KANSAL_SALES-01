/**
 * useConfirm Custom Hook
 * Centralized confirmation dialog state management
 * Eliminates duplication of confirmation logic across admin pages
 */

import { useState } from 'react';

export interface ConfirmState {
  isOpen: boolean;
  message: string;
  onConfirm?: () => void | Promise<void>;
  isLoading?: boolean;
}

export function useConfirm() {
  const [confirm, setConfirm] = useState<ConfirmState>({
    isOpen: false,
    message: '',
  });

  const openConfirm = (message: string, onConfirm: () => void | Promise<void>) => {
    setConfirm({
      isOpen: true,
      message,
      onConfirm,
      isLoading: false,
    });
  };

  const closeConfirm = () => {
    setConfirm(c => ({ ...c, isOpen: false }));
  };

  const handleConfirm = async () => {
    if (!confirm.onConfirm) return;
    
    setConfirm(c => ({ ...c, isLoading: true }));
    try {
      await confirm.onConfirm();
      closeConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      setConfirm(c => ({ ...c, isLoading: false }));
    }
  };

  return {
    confirm,
    setConfirm,
    openConfirm,
    closeConfirm,
    handleConfirm,
  };
}
