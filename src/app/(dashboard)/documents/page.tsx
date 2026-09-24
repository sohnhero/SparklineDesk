import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { TYPE_META, ENUM_TO_KEY, STATUS_MAP, DocTypeKey } from '@/domains/documents/types';
import { DocumentsClientView, DocumentListItem } from './DocumentsClientView';

export const dynamic = 'force-dynamic';

export default async function DocumentsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  if (!orgId) return <div>Non autorisé</div>;

  const [documents, org] = await Promise.all([
    prisma.document.findMany({
      where: { organizationId: orgId, archivedAt: null },
      include: {
        client: true,
        lines: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const currency = org?.currency || 'FCFA';

  const listItems: DocumentListItem[] = documents.map((doc) => {
    const typeKey = (ENUM_TO_KEY[doc.type] || 'quote') as DocTypeKey;
    const meta = TYPE_META[typeKey] || TYPE_META.quote;
    const isFinancial = meta.kind === 'financial';

    const totals = isFinancial
      ? calculateDocumentTotals({
          items: doc.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
          discount: Number(doc.discountPercent),
          taxRate: Number(doc.taxRate),
          deposit: Number(doc.depositAmount),
        })
      : null;

    return {
      id: doc.id,
      reference: doc.reference,
      typeKey,
      typeLabel: meta.label,
      typeIcon: meta.icon,
      isFinancial,
      clientName: doc.client?.name || '—',
      title: doc.title || '—',
      amount: totals ? totals.grossTotal : null,
      status: (STATUS_MAP[doc.status] || doc.status) as any,
      statusEnum: doc.status,
      date: doc.issueDate.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  });

  return <DocumentsClientView initialDocuments={listItems} currency={currency} />;
}
