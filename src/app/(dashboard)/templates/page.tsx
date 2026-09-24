import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { TemplatesClientView, TemplateItem } from './TemplatesClientView';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  const [dbTemplates, org] = await Promise.all([
    orgId
      ? prisma.template.findMany({
        where: { organizationId: orgId, isArchived: false },
        orderBy: { createdAt: 'asc' },
      })
      : [],
    orgId ? prisma.organization.findUnique({ where: { id: orgId } }) : null,
  ]);

  const currency = org?.currency || 'FCFA';

  const templates: TemplateItem[] = (
    Object.entries(TYPE_META) as [DocTypeKey, typeof TYPE_META[DocTypeKey]][]
  ).map(([key, meta]) => {
    const dbTpl = dbTemplates.find((t) => t.type.toLowerCase() === key);

    let category: 'billing' | 'proposal' | 'operations' = 'billing';
    if (['quote', 'invoice', 'deposit', 'credit'].includes(key)) {
      category = 'billing';
    } else if (['proposal', 'contract', 'nda'].includes(key)) {
      category = 'proposal';
    } else {
      category = 'operations';
    }

    return {
      key,
      label: dbTpl?.name || meta.label,
      description: dbTpl?.description || meta.description,
      tag: 'SPARKLINE',
      kind: meta.kind,
      prefix: meta.prefix,
      icon: meta.icon,
      category,
    };
  });

  return <TemplatesClientView templates={templates} currency={currency} />;
}
