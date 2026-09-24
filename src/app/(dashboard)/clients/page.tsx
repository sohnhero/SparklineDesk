import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { ClientsClientView, ClientViewData } from './ClientsClientView';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  if (!orgId) return <div>Non autorisé</div>;

  const [clients, org] = await Promise.all([
    prisma.client.findMany({
      where: { organizationId: orgId, archivedAt: null },
      include: {
        documents: {
          include: { lines: true },
          orderBy: { issueDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const currency = org?.currency || 'FCFA';

  const clientData: ClientViewData[] = clients.map((c) => {
    let turnover = 0;
    const docItems = c.documents.map((d) => {
      const totals = calculateDocumentTotals({
        items: d.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
        discount: Number(d.discountPercent),
        taxRate: Number(d.taxRate),
        deposit: Number(d.depositAmount),
      });

      if (d.type === 'INVOICE' && d.status === 'PAID') {
        turnover += totals.grossTotal;
      }

      return {
        id: d.id,
        reference: d.reference,
        title: d.title,
        type: d.type,
        status: d.status,
        date: d.issueDate.toISOString().slice(0, 10),
        amount: totals.grossTotal,
      };
    });

    return {
      id: c.id,
      name: c.name,
      sector: c.sector || '',
      contactName: c.contactName || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      notes: c.notes || '',
      docCount: c.documents.length,
      turnover,
      documents: docItems,
    };
  });

  return <ClientsClientView initialClients={clientData} currency={currency} />;
}
