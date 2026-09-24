'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { DocTypeKey } from '@/domains/documents/types';

export function DashboardClientActions() {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <button
        type="button"
        className="btn btn-light"
        onClick={() => setModalOpen(true)}
      >
        Créer un document
      </button>

      <DocumentTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
