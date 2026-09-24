import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { SettingsClientView } from './SettingsClientView';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  if (!orgId) return <div>Non autorisé</div>;

  const [org, users] = await Promise.all([
    prisma.organization.findUnique({ where: { id: orgId } }),
    prisma.user.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  if (!org) return <div>Organisation introuvable</div>;

  const companyData = {
    name: org.name,
    legalName: org.legalName,
    email: org.email,
    phone: org.phone,
    website: org.website,
    address: org.address,
    city: org.city,
    country: org.country,
  };

  const documentData = {
    currency: org.currency,
    taxRate: Number(org.taxRate),
    quoteValidityDays: org.quoteValidityDays,
    paymentTerms: org.paymentTerms,
    autoNumber: true,
  };

  const userList = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <SettingsClientView
      initialCompany={companyData}
      initialDocuments={documentData}
      users={userList}
    />
  );
}
