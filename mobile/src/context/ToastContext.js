import React, { createContext, useCallback, useContext, useState } from 'react';
import { Toast } from '../components/common/Toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {}, showError: () => {}, showSuccess: () => {} };
  return ctx;
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ visible: false, message: '', variant: 'info' });

  const showToast = useCallback((message, variant = 'info') => {
    setToast({ visible: true, message, variant });
  }, []);

  const showError = useCallback((message) => showToast(message, 'error'), [showToast]);
  const showSuccess = useCallback((message) => showToast(message, 'success'), [showToast]);
  const showInfo = useCallback((message) => showToast(message, 'info'), [showToast]);

  const dismiss = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showInfo }}>
      {children}
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
}
