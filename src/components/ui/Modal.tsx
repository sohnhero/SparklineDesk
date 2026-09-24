'use client';

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  kicker?: string;
  intro?: string;
  compact?: boolean;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  kicker,
  intro,
  compact = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <section
        className={`modal ${compact ? 'compact-modal' : ''}`}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-head">
          <div>
            {kicker && <span className="section-kicker">{kicker}</span>}
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="icon-button modal-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        {intro && <p className="modal-intro">{intro}</p>}
        {children}
      </section>
    </>
  );
}
