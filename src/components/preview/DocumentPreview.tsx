'use client';

import React from 'react';
import { DocumentSheet } from './DocumentSheet';
import { ProposalSheet } from './ProposalSheet';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';

interface DocumentPreviewProps {
  document: any;
  client?: any;
  company: any;
  zoom?: number;
}

export function DocumentPreview({
  document: doc,
  client,
  company,
  zoom = 0.8,
}: DocumentPreviewProps) {
  const meta = TYPE_META[doc.type as DocTypeKey] || TYPE_META.quote;
  const isFinancial = meta.kind === 'financial';

  return (
    <article
      className="document-page"
      id="documentPreview"
      style={{
        transform: `scale(${zoom})`,
      }}
    >
      {isFinancial ? (
        <DocumentSheet document={doc} client={client} company={company} />
      ) : (
        <ProposalSheet document={doc} client={client} company={company} />
      )}
    </article>
  );
}
