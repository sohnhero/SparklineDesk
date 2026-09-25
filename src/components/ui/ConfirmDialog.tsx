'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  Trash2,
  AlertTriangle,
  AlertCircle,
  Info,
  LogOut,
  RefreshCw,
  X,
  Loader2,
} from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'primary';

export interface ConfirmOptions {
  title: string;
  description: React.ReactNode;
  highlight?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  icon?: 'trash' | 'alert' | 'warning' | 'info' | 'logout' | 'refresh' | React.ReactNode;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: ((value: boolean) => void) | null;
  }>({
    isOpen: false,
    options: {
      title: '',
      description: '',
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      variant: 'danger',
    },
    resolve: null,
  });

  const [mounted, setMounted] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        options: {
          variant: 'danger',
          confirmText: options.variant === 'danger' ? 'Supprimer' : 'Confirmer',
          cancelText: 'Annuler',
          ...options,
        },
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback(
    (result: boolean) => {
      if (dialogState.resolve) {
        dialogState.resolve(result);
      }
      setDialogState((prev) => ({
        ...prev,
        isOpen: false,
        resolve: null,
      }));
    },
    [dialogState]
  );

  // Lock scroll and handle keyboard events
  useEffect(() => {
    if (!dialogState.isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // Focus confirm button after mount
    const timer = setTimeout(() => {
      confirmButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalDocOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dialogState.isOpen, handleClose]);

  const { isOpen, options } = dialogState;
  const variant = options.variant || 'danger';

  // Variant design tokens
  const theme = {
    danger: {
      border: 'rgba(239, 68, 68, 0.25)',
      glow: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(239, 68, 68, 0.18), transparent 70%)',
      badgeBg: 'rgba(239, 68, 68, 0.12)',
      badgeBorder: 'rgba(239, 68, 68, 0.25)',
      badgeColor: '#ef4444',
      badgeShadow: '0 0 24px -4px rgba(239, 68, 68, 0.3)',
      buttonBg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      buttonShadow: '0 4px 16px rgba(239, 68, 68, 0.35)',
      buttonHoverShadow: '0 6px 22px rgba(239, 68, 68, 0.5)',
      defaultIcon: <Trash2 size={24} strokeWidth={2} />,
    },
    warning: {
      border: 'rgba(245, 158, 11, 0.25)',
      glow: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245, 158, 11, 0.18), transparent 70%)',
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      badgeBorder: 'rgba(245, 158, 11, 0.25)',
      badgeColor: '#f59e0b',
      badgeShadow: '0 0 24px -4px rgba(245, 158, 11, 0.3)',
      buttonBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      buttonShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
      buttonHoverShadow: '0 6px 22px rgba(245, 158, 11, 0.5)',
      defaultIcon: <AlertTriangle size={24} strokeWidth={2} />,
    },
    primary: {
      border: 'rgba(224, 86, 36, 0.3)',
      glow: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(224, 86, 36, 0.2), transparent 70%)',
      badgeBg: 'rgba(224, 86, 36, 0.12)',
      badgeBorder: 'rgba(224, 86, 36, 0.28)',
      badgeColor: '#e05624',
      badgeShadow: '0 0 24px -4px rgba(224, 86, 36, 0.35)',
      buttonBg: 'linear-gradient(135deg, #e05624 0%, #c2410c 100%)',
      buttonShadow: '0 4px 16px rgba(224, 86, 36, 0.35)',
      buttonHoverShadow: '0 6px 22px rgba(224, 86, 36, 0.5)',
      defaultIcon: <AlertCircle size={24} strokeWidth={2} />,
    },
    info: {
      border: 'rgba(59, 130, 246, 0.25)',
      glow: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59, 130, 246, 0.18), transparent 70%)',
      badgeBg: 'rgba(59, 130, 246, 0.12)',
      badgeBorder: 'rgba(59, 130, 246, 0.25)',
      badgeColor: '#3b82f6',
      badgeShadow: '0 0 24px -4px rgba(59, 130, 246, 0.3)',
      buttonBg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      buttonShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
      buttonHoverShadow: '0 6px 22px rgba(59, 130, 246, 0.5)',
      defaultIcon: <Info size={24} strokeWidth={2} />,
    },
  }[variant];

  // Resolve custom icon
  const renderIcon = () => {
    if (!options.icon) return theme.defaultIcon;
    if (typeof options.icon === 'string') {
      switch (options.icon) {
        case 'trash':
          return <Trash2 size={24} strokeWidth={2} />;
        case 'alert':
          return <AlertTriangle size={24} strokeWidth={2} />;
        case 'warning':
          return <AlertCircle size={24} strokeWidth={2} />;
        case 'info':
          return <Info size={24} strokeWidth={2} />;
        case 'logout':
          return <LogOut size={24} strokeWidth={2} style={{ transform: 'translateX(-2px)' }} />;
        case 'refresh':
          return <RefreshCw size={24} strokeWidth={2} />;
        default:
          return theme.defaultIcon;
      }
    }
    return options.icon;
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {mounted &&
        isOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            {/* Backdrop with frosted blur */}
            <div
              onClick={() => handleClose(false)}
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.72)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                animation: 'confirmFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              }}
            />

            {/* Modal Card */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '430px',
                background: 'rgba(18, 18, 22, 0.96)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: `1px solid ${theme.border}`,
                borderRadius: '24px',
                padding: '32px 28px 24px',
                boxShadow:
                  '0 32px 64px -16px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
                animation: 'confirmScaleUp 0.24s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                overflow: 'hidden',
                zIndex: 1,
              }}
            >
              {/* Close 'X' button */}
              <button
                type="button"
                onClick={() => handleClose(false)}
                aria-label="Fermer"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  color: '#71717a',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.15s, background-color 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#71717a';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={18} strokeWidth={2} />
              </button>

              {/* Ambient radial glow at top */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100%',
                  height: '140px',
                  background: theme.glow,
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                {/* Glowing Icon Badge */}
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '18px',
                    background: theme.badgeBg,
                    border: `1px solid ${theme.badgeBorder}`,
                    color: theme.badgeColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    boxShadow: theme.badgeShadow,
                  }}
                >
                  {renderIcon()}
                </div>

                {/* Title */}
                <h3
                  id="confirm-dialog-title"
                  style={{
                    fontSize: '19px',
                    fontWeight: 650,
                    color: '#ffffff',
                    margin: '0 0 10px 0',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {options.title}
                </h3>

                {/* Optional Highlight Pill (e.g. Reference, Client Name) */}
                {options.highlight && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#f4f4f5',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      marginBottom: '12px',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {options.highlight}
                  </div>
                )}

                {/* Description */}
                <p
                  style={{
                    color: '#a1a1aa',
                    fontSize: '14px',
                    lineHeight: 1.55,
                    margin: '0 0 26px 0',
                    maxWidth: '360px',
                  }}
                >
                  {options.description}
                </p>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    gap: '12px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleClose(false)}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#e4e4e7',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.09)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#e4e4e7';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    {options.cancelText || 'Annuler'}
                  </button>

                  <button
                    ref={confirmButtonRef}
                    type="button"
                    onClick={() => handleClose(true)}
                    style={{
                      flex: 1,
                      background: theme.buttonBg,
                      border: 'none',
                      color: '#ffffff',
                      padding: '12px 18px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: theme.buttonShadow,
                      transition: 'all 0.15s ease',
                      outline: 'none',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = theme.buttonHoverShadow;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = theme.buttonShadow;
                    }}
                  >
                    {options.confirmText || 'Confirmer'}
                  </button>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes confirmFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes confirmScaleUp {
                from { opacity: 0; transform: scale(0.95) translateY(10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}</style>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
