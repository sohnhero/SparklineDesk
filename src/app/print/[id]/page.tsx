import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { ENUM_TO_KEY, STATUS_MAP, DocTypeKey, TYPE_META } from '@/domains/documents/types';
import { DocumentSheet } from '@/components/preview/DocumentSheet';
import { ProposalSheet } from '@/components/preview/ProposalSheet';

export const dynamic = 'force-dynamic';

export default async function PrintPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [document, org] = await Promise.all([
    prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: {
        client: true,
        lines: { orderBy: { position: 'asc' } },
        sections: { orderBy: { position: 'asc' } },
      },
    }),
    prisma.organization.findUnique({
      where: { id: user.organizationId },
    }),
  ]);

  if (!document || !org) notFound();

  const typeKey = (ENUM_TO_KEY[document.type] || 'quote') as DocTypeKey;
  const meta = TYPE_META[typeKey];
  const isFinancial = meta.kind === 'financial';

  const doc = {
    id: document.id,
    type: typeKey,
    reference: document.reference,
    title: document.title,
    intro: document.intro || '',
    status: STATUS_MAP[document.status] || document.status,
    issueDate: document.issueDate.toISOString().slice(0, 10),
    dueDate: document.dueDate ? document.dueDate.toISOString().slice(0, 10) : '',
    validityDays: document.validityDays || 30,
    discountPercent: Number(document.discountPercent || 0),
    taxRate: Number(document.taxRate || 0),
    depositAmount: Number(document.depositAmount || 0),
    conditions: document.conditions || '',
    notes: document.notes || '',
    options: (document.options as any) || { showSignature: true, showTax: false },
    lines: document.lines.map((l) => ({
      id: l.id,
      name: l.name,
      description: l.description || '',
      qty: Number(l.quantity),
      price: Number(l.unitPrice),
    })),
    sections: document.sections.map((s) => ({
      id: s.id,
      title: s.title,
      content: s.content,
      sectionType: s.sectionType,
    })),
  };

  const client = document.client
    ? {
        name: document.client.name,
        sector: document.client.sector || '',
        contactName: document.client.contactName || '',
        email: document.client.email || '',
        phone: document.client.phone || '',
        address: document.client.address || '',
      }
    : undefined;

  const company = {
    name: org.name,
    legalName: org.legalName,
    email: org.email,
    phone: org.phone,
    website: org.website,
    address: org.address,
    currency: org.currency,
  };

  return (
    <>
      <style>{`
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          box-sizing: border-box;
        }
        @page { size: A4; margin: 0; }
        html, body {
          margin: 0;
          padding: 0;
          background: #fff;
          font-family: system-ui, -apple-system, sans-serif;
        }
        /* Override document-page to remove transform and shadows */
        .document-page {
          transform: none !important;
          width: 210mm !important;
          min-height: 297mm !important;
          box-shadow: none !important;
          margin: 0 auto !important;
        }
        .doc-sheet {
          width: 210mm;
          min-height: 297mm;
        }
      `}</style>

      {isFinancial ? (
        <DocumentSheet document={doc} client={client} company={company} />
      ) : (
        <ProposalSheet document={doc} client={client} company={company} />
      )}

      <script
        dangerouslySetInnerHTML={{
          __html: `window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 500); });`,
        }}
      />
    </>
  );
}
