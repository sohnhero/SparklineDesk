import React from 'react';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { ENUM_TO_KEY, STATUS_MAP, DocTypeKey } from '@/domains/documents/types';
import { DocumentEditorClient } from './DocumentEditorClient';

export const dynamic = 'force-dynamic';

export default async function DocumentEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const [document, clients, catalogItems, org] = await Promise.all([
    prisma.document.findUnique({
      where: { id: params.id, organizationId: user.organizationId },
      include: {
        client: true,
        lines: { orderBy: { position: 'asc' } },
        sections: { orderBy: { position: 'asc' } },
        payments: { orderBy: { paidAt: 'desc' } },
      },
    }),
    prisma.client.findMany({
      where: { organizationId: user.organizationId, archivedAt: null },
      orderBy: { name: 'asc' },
    }),
    prisma.serviceCatalogItem.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      orderBy: { category: 'asc' },
    }),
    prisma.organization.findUnique({
      where: { id: user.organizationId },
    }),
  ]);

  if (!document || !org) {
    notFound();
  }

  const typeKey = (ENUM_TO_KEY[document.type] || 'quote') as DocTypeKey;

  const initialDocument = {
    id: document.id,
    type: typeKey,
    reference: document.reference,
    title: document.title,
    intro: document.intro || '',
    clientId: document.clientId,
    status: STATUS_MAP[document.status] || document.status,
    issueDate: document.issueDate.toISOString().slice(0, 10),
    dueDate: document.dueDate ? document.dueDate.toISOString().slice(0, 10) : '',
    validityDays: document.validityDays || 30,
    currency: document.currency || org.currency || 'FCFA',
    discountPercent: Number(document.discountPercent || 0),
    taxRate: Number(document.taxRate || 0),
    depositAmount: Number(document.depositAmount || 0),
    conditions: document.conditions || '',
    notes: document.notes || '',
    options: (document.options as any) || {
      showSignature: true,
      showTax: Number(document.taxRate) > 0,
      coverPage: typeKey === 'proposal',
    },
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

  const clientList = clients.map((c) => ({
    id: c.id,
    name: c.name,
    sector: c.sector || '',
    contactName: c.contactName || '',
    email: c.email || '',
    phone: c.phone || '',
    address: c.address || '',
  }));

  const catalogList = catalogItems.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    description: item.description || '',
    price: Number(item.price || 0),
    unit: item.unit || 'prestation',
  }));

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
    <DocumentEditorClient
      initialDoc={initialDocument}
      clients={clientList}
      catalog={catalogList}
      company={company}
    />
  );
}
