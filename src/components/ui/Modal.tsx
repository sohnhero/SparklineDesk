'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const origBodyOverflow = document.body.style.overflow;
      const origHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = origBodyOverflow;
        document.documentElement.style.overflow = origHtmlOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
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
    </>,
    document.body
  );
}
