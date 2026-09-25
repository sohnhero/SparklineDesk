'use client';

import React, { useState } from 'react';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';

export function QuickCreateCards() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocTypeKey>('quote');

  const handleCardClick = (key: DocTypeKey) => {
    setSelectedType(key);
    setModalOpen(true);
  };

  return (
    <>
      <div className="quick-grid">
        {(Object.entries(TYPE_META) as [DocTypeKey, typeof TYPE_META[DocTypeKey]][])
          .slice(0, 6)
          .map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleCardClick(key)}
              className="quick-card"
            >
              <div className="q-icon">{meta.icon}</div>
              <div className="quick-card-info">
                <strong>{meta.label}</strong>
                <span className="quick-card-desc">{meta.description}</span>
              </div>
            </button>
          ))}
      </div>

      <DocumentTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={selectedType}
      />
    </>
  );
}
