import React from 'react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { STATUS_MAP } from '@/domains/documents/types';
import { FinanceClientView, InvoiceTrackingItem } from './FinanceClientView';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  if (!orgId) return <div>Non autorisé</div>;

  const [invoices, org] = await Promise.all([
    prisma.document.findMany({
      where: {
        organizationId: orgId,
        type: { in: ['INVOICE', 'DEPOSIT'] },
        archivedAt: null,
      },
      include: {
        client: true,
        lines: true,
      },
      orderBy: { issueDate: 'desc' },
    }),
    prisma.organization.findUnique({ where: { id: orgId } }),
  ]);

  const currency = org?.currency || 'FCFA';
  const now = new Date();

  let issuedTotal = 0;
  let paidTotal = 0;
  let pendingTotal = 0;
  let overdueTotal = 0;

  const monthMap = new Map<string, number>();

  const trackingItems: InvoiceTrackingItem[] = invoices.map((inv) => {
    const totals = calculateDocumentTotals({
      items: inv.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
      discount: Number(inv.discountPercent),
      taxRate: Number(inv.taxRate),
      deposit: Number(inv.depositAmount),
    });

    const amount = totals.grossTotal;
    issuedTotal += amount;

    if (inv.status === 'PAID') {
      paidTotal += amount;
    } else if (inv.status === 'SENT') {
      pendingTotal += amount;
    }

    if (inv.status !== 'PAID' && inv.dueDate && new Date(inv.dueDate) < now) {
      overdueTotal += amount;
    }

    const d = new Date(inv.issueDate);
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amount);

    return {
      id: inv.id,
      reference: inv.reference,
      date: inv.issueDate.toISOString(),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      clientName: inv.client?.name || '—',
      amount,
      status: (STATUS_MAP[inv.status] || inv.status) as any,
      statusEnum: inv.status,
    };
  });

  // Generate continuous last 6 calendar months trailing from current date
  const last6Months: Array<{ key: string; label: string; fullLabel: string }> = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const rawShort = new Intl.DateTimeFormat('fr-FR', { month: 'short' }).format(d).replace('.', '');
    const shortLabel = rawShort.charAt(0).toUpperCase() + rawShort.slice(1);
    const fullLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d);
    last6Months.push({ key, label: shortLabel, fullLabel });
  }

  const maxVal = Math.max(...last6Months.map((m) => monthMap.get(m.key) || 0), 100000);

  const chartBars = last6Months.map((m, idx) => {
    const val = monthMap.get(m.key) || 0;
    const heightPercent = val > 0 ? Math.max(14, Math.round((val / maxVal) * 88)) : 6;
    const isLatest = idx === last6Months.length - 1;
    return {
      key: m.key,
      val,
      label: m.label,
      fullLabel: m.fullLabel,
      heightPercent,
      isLatest,
    };
  });

  const periodTotal = chartBars.reduce((sum, b) => sum + b.val, 0);
  const averageMonthly = Math.round(periodTotal / 6);
  const bestMonth = chartBars.reduce(
    (prev, curr) => (curr.val > prev.val ? curr : prev),
    chartBars[0]
  );
  const recoveryRate = issuedTotal > 0 ? Math.round((paidTotal / issuedTotal) * 100) : 100;

  // Status breakdown
  const statusKeys = ['Payé', 'Envoyé', 'Brouillon', 'Refusé', 'Expiré'];
  const totalCount = Math.max(invoices.length, 1);
  const statusCounts = statusKeys.map((s) => {
    const count = trackingItems.filter((i) => i.status === s).length;
    const percent = Math.round((count / totalCount) * 100);
    return { label: s, count, percent };
  });

  return (
    <FinanceClientView
      summary={{
        issued: issuedTotal,
        paid: paidTotal,
        pending: pendingTotal,
        overdue: overdueTotal,
      }}
      currency={currency}
      chartBars={chartBars}
      statusCounts={statusCounts}
      invoices={trackingItems}
      statsMeta={{
        periodTotal,
        averageMonthly,
        bestMonth: {
          label: bestMonth.label,
          val: bestMonth.val,
        },
        recoveryRate,
      }}
    />
  );
}
