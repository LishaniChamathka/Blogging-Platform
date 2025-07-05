// This handles alerts, confirmations, and notifications in this place
import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertDialog from '../components/ui/AlertDialog';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const ModalContext = createContext();

// Custom hook to use modal functions anywhere in the app
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  // State for alert modal (simple notifications)
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'info',
    buttonText: 'OK'
  });

  // State for confirmation modal (yes/no questions)
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    onConfirm: () => {}
  });

  // Show a general alert dialog with custom options
  const showAlert = useCallback(({
    title,
    message,
    variant = 'info',
    buttonText = 'OK'
  }) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      variant,
      buttonText
    });
  }, []);

  // Show a confirmation dialog that asks user to confirm an action
  const showConfirm = useCallback(({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    onConfirm = () => {}
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm
    });
  }, []);

  // Close the alert dialog
  const closeAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Close the confirmation dialog
  const closeConfirm = useCallback(() => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Quick success notification - used for things like "Post saved!"
  const showSuccess = useCallback((message, title = 'Success') => {
    showAlert({ title, message, variant: 'success' });
  }, [showAlert]);

  // Quick error notification - used when something goes wrong
  const showError = useCallback((message, title = 'Error') => {
    showAlert({ title, message, variant: 'error' });
  }, [showAlert]);

  // Quick warning notification - used to warn users about something
  const showWarning = useCallback((message, title = 'Warning') => {
    showAlert({ title, message, variant: 'warning' });
  }, [showAlert]);

  // Quick info notification - used for general information
  const showInfo = useCallback((message, title = 'Information') => {
    showAlert({ title, message, variant: 'info' });
  }, [showAlert]);

  // Special delete confirmation - commonly used throughout the app
  const confirmDelete = useCallback((onConfirm, itemName = 'this item') => {
    showConfirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
      onConfirm
    });
  }, [showConfirm]);

  // All the functions we want to make available throughout the app
  const modalFunctions = {
    showAlert,
    showConfirm,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    confirmDelete,
    closeAlert,
    closeConfirm
  };

  return (
    <ModalContext.Provider value={modalFunctions}>
      {children}
      
      {/* The actual alert dialog component */}
      <AlertDialog
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        variant={alertModal.variant}
        buttonText={alertModal.buttonText}
      />
      
      {/* The actual confirmation dialog component */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        variant={confirmModal.variant}
      />
    </ModalContext.Provider>
  );
};

export default ModalContext;
