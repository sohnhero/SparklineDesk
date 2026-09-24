import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { AppShell } from '@/components/layout/AppShell';
import { initials } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  let documentsCount = 0;
  let clientsCount = 0;

  if (orgId) {
    [documentsCount, clientsCount] = await Promise.all([
      prisma.document.count({ where: { organizationId: orgId } }),
      prisma.client.count({ where: { organizationId: orgId, archivedAt: null } }),
    ]);
  }

  const userInitials = user ? initials(user.name) : 'SL';

  return (
    <AppShell
      initialCounts={{ documents: documentsCount, clients: clientsCount }}
      userInitials={userInitials}
    >
      {children}
    </AppShell>
  );
}
