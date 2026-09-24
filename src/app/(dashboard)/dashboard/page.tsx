import React from 'react';
import Link from 'next/link';
import { FileText, Users, ArrowUpRight, Clock, ArrowRight } from 'lucide-react';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { TYPE_META, DocTypeKey, ENUM_TO_KEY, STATUS_MAP } from '@/domains/documents/types';
import { DashboardClientActions } from './DashboardClientActions';
import { QuickCreateCards } from './QuickCreateCards';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const orgId = user?.organizationId;

  if (!orgId) {
    return <div>Organisation non trouvée.</div>;
  }

  // Fetch all in parallel — optimized selects
  const [totalDocs, totalClients, documents, invoiceTotals, org] = await Promise.all([
    prisma.document.count({ where: { organizationId: orgId } }),
    prisma.client.count({ where: { organizationId: orgId, archivedAt: null } }),
    // Recent docs — only fields needed for the table, no lines
    prisma.document.findMany({
      where: { organizationId: orgId },
      select: {
        id: true,
        type: true,
        reference: true,
        title: true,
        status: true,
        updatedAt: true,
        discountPercent: true,
        taxRate: true,
        depositAmount: true,
        dueDate: true,
        client: { select: { name: true } },
        lines: { select: { quantity: true, unitPrice: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20, // cap at 20 for dashboard
    }),
    // Aggregate invoice amounts directly in DB
    prisma.document.findMany({
      where: {
        organizationId: orgId,
        type: { in: ['INVOICE', 'DEPOSIT'] },
      },
      select: {
        id: true,
        status: true,
        discountPercent: true,
        taxRate: true,
        depositAmount: true,
        dueDate: true,
        reference: true,
        client: { select: { name: true } },
        lines: { select: { quantity: true, unitPrice: true } },
      },
    }),
    prisma.organization.findUnique({
      where: { id: orgId },
      select: { currency: true },
    }),
  ]);

  const currency = org?.currency || 'FCFA';

  // Calculate stats from invoice data
  let paidTotal = 0;
  let pendingTotal = 0;

  invoiceTotals.forEach((inv) => {
    const totals = calculateDocumentTotals({
      items: inv.lines.map((l) => ({ qty: Number(l.quantity), price: Number(l.unitPrice) })),
      discount: Number(inv.discountPercent),
      taxRate: Number(inv.taxRate),
      deposit: Number(inv.depositAmount),
    });

    if (inv.status === 'PAID') {
      paidTotal += totals.grossTotal;
    } else if (inv.status === 'SENT') {
      pendingTotal += totals.grossTotal;
    }
  });

  const acceptedCount = documents.filter((d) => d.status === 'ACCEPTED').length;
  const recentDocs = documents.slice(0, 6);

  // Invoices to follow up
  const followupInvoices = invoiceTotals
    .filter((d) => d.status !== 'PAID' && d.status !== 'REJECTED')
    .sort((a, b) => {
      const timeA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const timeB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return timeA - timeB;
    })
    .slice(0, 4);

  return (
    <>
      <div className="hero-panel">
        <div className="hero-copy">
          <span className="hero-kicker">SPARKLINE DESK</span>
          <h2>
            Vos documents commerciaux,
            <br />
            <em>sans repartir de zéro.</em>
          </h2>
          <p>
            Créez, adaptez, suivez et exportez devis, factures, propositions et
            contrats dans une seule interface.
          </p>
          <div className="hero-actions">
            <DashboardClientActions />
            <Link href="/templates" className="btn btn-ghost-light">
              Voir les modèles
            </Link>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <img src="/assets/sparkline-symbol.svg" alt="" />
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <div>
            <div className="stat-label">Documents</div>
            <div className="stat-value">{totalDocs}</div>
            <div className="stat-sub">Tous formats confondus</div>
          </div>
          <div className="stat-icon">
            <FileText size={18} strokeWidth={2.2} />
          </div>
        </article>

        <article className="stat-card">
          <div>
            <div className="stat-label">Clients</div>
            <div className="stat-value">{totalClients}</div>
            <div className="stat-sub">Fiches enregistrées</div>
          </div>
          <div className="stat-icon">
            <Users size={18} strokeWidth={2.2} />
          </div>
        </article>

        <article className="stat-card">
          <div>
            <div className="stat-label">Encaissé</div>
            <div className="stat-value">{formatMoney(paidTotal, currency)}</div>
            <div className="stat-sub">Factures marquées payées</div>
          </div>
          <div className="stat-icon">
            <ArrowUpRight size={18} strokeWidth={2.2} />
          </div>
        </article>

        <article className="stat-card">
          <div>
            <div className="stat-label">À encaisser</div>
            <div className="stat-value">{formatMoney(pendingTotal, currency)}</div>
            <div className="stat-sub">{acceptedCount} proposition(s) acceptée(s)</div>
          </div>
          <div className="stat-icon">
            <Clock size={18} strokeWidth={2.2} />
          </div>
        </article>
      </div>

      <div className="dashboard-grid">
        <section className="panel span-2">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ACTIVITÉ</span>
              <h3>Documents récents</h3>
            </div>
            <Link href="/documents" className="text-button">
              Tout afficher →
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Client</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recentDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted">
                      Aucun document enregistré.
                    </td>
                  </tr>
                ) : (
                  recentDocs.map((doc) => {
                    const typeKey = (ENUM_TO_KEY[doc.type] || 'quote') as DocTypeKey;
                    const meta = TYPE_META[typeKey];
                    const isFinancial = meta?.kind === 'financial';
                    const totals = isFinancial
                      ? calculateDocumentTotals({
                        items: doc.lines.map((l) => ({
                          qty: Number(l.quantity),
                          price: Number(l.unitPrice),
                        })),
                        discount: Number(doc.discountPercent),
                        taxRate: Number(doc.taxRate),
                        deposit: Number(doc.depositAmount),
                      })
                      : null;
                    const statusLabel = STATUS_MAP[doc.status] || doc.status;

                    return (
                      <tr key={doc.id}>
                        <td>
                          <div className="doc-main">
                            <div className="doc-icon">{meta?.icon || 'DO'}</div>
                            <div>
                              <div className="doc-title">
                                {doc.title || meta?.label}
                              </div>
                              <div className="doc-sub">{doc.reference}</div>
                            </div>
                          </div>
                        </td>
                        <td>{doc.client?.name || '—'}</td>
                        <td className="amount-cell">
                          {totals ? formatMoney(totals.grossTotal, currency) : '—'}
                        </td>
                        <td>
                          <span className={`status-pill ${doc.status}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="muted">{formatDate(doc.updatedAt)}</td>
                        <td>
                          <div className="row-actions">
                            <Link
                              href={`/documents/${doc.id}`}
                              className="mini-action"
                              title="Ouvrir l'éditeur"
                            >
                              ↗
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">À SUIVRE</span>
              <h3>Encaissements</h3>
            </div>
          </div>
          <div className="followup-list">
            {followupInvoices.length === 0 ? (
              <div className="empty-state" style={{ padding: '28px 8px' }}>
                <div className="empty-icon">✓</div>
                <h3>Tout est à jour</h3>
                <p>Aucun paiement à relancer.</p>
              </div>
            ) : (
              followupInvoices.map((inv) => {
                const totals = calculateDocumentTotals({
                  items: inv.lines.map((l) => ({
                    qty: Number(l.quantity),
                    price: Number(l.unitPrice),
                  })),
                  discount: Number(inv.discountPercent),
                  taxRate: Number(inv.taxRate),
                  deposit: Number(inv.depositAmount),
                });
                return (
                  <div key={inv.id} className="followup-item">
                    <div className="followup-top">
                      <span className="followup-name">
                        {inv.client?.name || 'Client'}
                      </span>
                      <span className="followup-amount">
                        {formatMoney(totals.grossTotal, currency)}
                      </span>
                    </div>
                    <div className="followup-meta">
                      {inv.reference} • échéance{' '}
                      {inv.dueDate ? formatDate(inv.dueDate) : 'Non définie'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="panel quick-create-panel">
        <div className="panel-head">
          <div>
            <span className="section-kicker">CRÉATION RAPIDE</span>
            <h3>Que voulez-vous préparer ?</h3>
          </div>
        </div>
        <QuickCreateCards />
      </section>
    </>
  );
}
