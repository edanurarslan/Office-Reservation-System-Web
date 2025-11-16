import React, { type ReactNode } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// Base Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-96';
      case 'large':
        return 'w-2/3';
      case 'medium':
      default:
        return 'w-[500px]';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className={`${getSizeClasses()} bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.5rem',
            borderBottom: '1px solid #e0e7ff',
          }}
        >
          <h2
            style={{
              fontSize: '1.3rem',
              fontWeight: 700,
              color: '#312e81',
              margin: 0,
            }}
          >
            {title}
          </h2>
          {closeButton && (
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>{children}</div>
      </div>
    </div>
  );
};

// Confirm Dialog
interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  isDangerous = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onCancel}
    >
      <div
        className="w-96 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Title */}
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          {isDangerous ? (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertCircle style={{ width: '48px', height: '48px', color: '#ef4444' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <Info style={{ width: '48px', height: '48px', color: '#6366f1' }} />
            </div>
          )}
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#312e81',
              marginBottom: '0.75rem',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p style={{ color: '#818cf8', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '1.5rem',
            borderTop: '1px solid #e0e7ff',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onCancel}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: '2px solid #e0e7ff',
              background: '#fff',
              color: '#818cf8',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: isDangerous ? '#ef4444' : '#6366f1',
              color: '#fff',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Alert Dialog
interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type?: 'info' | 'success' | 'error' | 'warning';
  closeText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  title,
  message,
  onClose,
  type = 'info',
  closeText = 'Kapat',
}) => {
  if (!isOpen) return null;

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#6366f1';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 style={{ width: '48px', height: '48px', color: getIconColor() }} />;
      case 'error':
        return <AlertCircle style={{ width: '48px', height: '48px', color: getIconColor() }} />;
      case 'warning':
        return <AlertCircle style={{ width: '48px', height: '48px', color: getIconColor() }} />;
      case 'info':
      default:
        return <Info style={{ width: '48px', height: '48px', color: getIconColor() }} />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        className="w-96 bg-white rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon & Content */}
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            {getIcon()}
          </div>
          <h3
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: '#312e81',
              marginBottom: '0.75rem',
              margin: 0,
            }}
          >
            {title}
          </h3>
          <p style={{ color: '#818cf8', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        {/* Action */}
        <div
          style={{
            display: 'flex',
            padding: '1.5rem',
            borderTop: '1px solid #e0e7ff',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.75rem',
              border: 'none',
              background: getIconColor(),
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {closeText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sheet/Side Panel Component
interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  position?: 'left' | 'right';
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          marginLeft: position === 'left' ? 0 : 'auto',
          width: '360px',
          background: '#fff',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 4px 24px #6366f133',
          animation: position === 'right' ? 'slideIn 0.3s ease-out' : 'slideInLeft 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid #e0e7ff',
            }}
          >
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: 700,
                color: '#312e81',
                margin: 0,
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#818cf8',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              <X style={{ width: '24px', height: '24px' }} />
            </button>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflow: 'y-auto', padding: '1.5rem' }}>{children}</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
