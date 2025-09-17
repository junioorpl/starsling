import { X } from 'lucide-react';
import { forwardRef, memo, type HTMLAttributes, type ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  showCloseButton?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal = memo(
  forwardRef<HTMLDivElement, ModalProps>(
    (
      {
        open,
        onClose,
        title,
        description,
        children,
        showCloseButton = true,
        size = 'md',
        className,
        ...props
      },
      ref
    ) => {
      if (!open) return null;

      const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
      };

      const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal Content */}
          <div
            ref={ref}
            className={cn(
              'relative w-full rounded-lg bg-white shadow-xl',
              sizeClasses[size],
              className
            )}
            {...props}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex-1">
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold text-gray-900"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-gray-500"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="ml-4 h-8 w-8 p-0"
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-6">{children}</div>
          </div>
        </div>
      );
    }
  )
);

Modal.displayName = 'Modal';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

const ConfirmModal = memo(
  ({
    open,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    loading = false,
  }: ConfirmModalProps) => {
    const handleConfirm = () => {
      onConfirm();
      onClose();
    };

    return (
      <Modal open={open} onClose={onClose} title={title} size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'primary'}
              onClick={handleConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

ConfirmModal.displayName = 'ConfirmModal';

export interface AlertModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  buttonText?: string;
}

const AlertModal = memo(
  ({
    open,
    onClose,
    title,
    message,
    variant = 'info',
    buttonText = 'OK',
  }: AlertModalProps) => {
    const variantStyles = {
      success: 'text-green-600',
      error: 'text-red-600',
      warning: 'text-yellow-600',
      info: 'text-blue-600',
    };

    const getTitle = () => {
      if (title) return title;
      switch (variant) {
        case 'success':
          return 'Success';
        case 'error':
          return 'Error';
        case 'warning':
          return 'Warning';
        case 'info':
          return 'Information';
        default:
          return 'Information';
      }
    };

    return (
      <Modal open={open} onClose={onClose} title={getTitle()} size="sm">
        <div className="space-y-4">
          <p className={`text-sm ${variantStyles[variant]}`}>{message}</p>
          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>
              {buttonText}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }
);

AlertModal.displayName = 'AlertModal';

export { AlertModal, ConfirmModal, Modal };
