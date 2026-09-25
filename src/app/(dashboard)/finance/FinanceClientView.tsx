'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Download,
  Search,
  ShieldCheck,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Pencil,
  CircleDot,
} from 'lucide-react';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { toast } from 'react-toastify';
import { Modal } from '@/components/ui/Modal';
import { MobileTableAccordion, MobileTableItem } from '@/components/ui/MobileTableAccordion';
import { FilterDropdown, FilterOption } from '@/components/ui/FilterDropdown';

export interface InvoiceTrackingItem {
  id: string;
  reference: string;
  date: string;
  dueDate: string | null;
  clientName: string;
  amount: number;
  status: string;
  statusEnum: string;
}

interface FinanceClientViewProps {
  summary: {
    issued: number;
    paid: number;
    pending: number;
    overdue: number;
  };
  currency: string;
  chartBars: Array<{
    key: string;
    val: number;
    label: string;
    fullLabel?: string;
    heightPercent: number;
    isLatest: boolean;
  }>;
  statusCounts: Array<{
    label: string;
    count: number;
    percent: number;
  }>;
  invoices: InvoiceTrackingItem[];
  statsMeta?: {
    periodTotal: number;
    averageMonthly: number;
    bestMonth: {
      label: string;
      val: number;
    };
    recoveryRate: number;
  };
}

export function FinanceClientView({
  summary,
  currency,
  chartBars,
  statusCounts,
  invoices: initialInvoices,
  statsMeta,
}: FinanceClientViewProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const financeStatusOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'Tous les statuts', count: invoices.length },
    { value: 'Envoyé', label: 'À encaisser', dotColor: '#2563eb' },
    { value: 'Payé', label: 'Payé', dotColor: '#16a34a' },
    { value: 'Expiré', label: 'En retard', dotColor: '#ea580c' },
    { value: 'Brouillon', label: 'Brouillon', dotColor: '#71717a' },
  ], [invoices.length]);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceTrackingItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Wave');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);

  const router = useRouter();
  
  const periodTotal = statsMeta?.periodTotal ?? chartBars.reduce((s, b) => s + b.val, 0);
  const averageMonthly = statsMeta?.averageMonthly ?? Math.round(periodTotal / (chartBars.length || 1));
  const recoveryRate = statsMeta?.recoveryRate ?? (summary.issued > 0 ? Math.round((summary.paid / summary.issued) * 100) : 100);
  const bestMonth = statsMeta?.bestMonth ?? chartBars.reduce((p, c) => (c.val > p.val ? c : p), chartBars[0] || { label: '—', val: 0 });

  const handleOpenPayModal = (inv: InvoiceTrackingItem) => {
    setPayingInvoice(inv);
    setPaymentAmount(inv.amount);
    setPaymentMethod('Wave');
    setPaymentRef('');
    setPaymentNote(`Règlement ${inv.reference}`);
  };

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;

    setSubmittingPayment(true);
    try {
      const res = await fetch('/api/finance/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: payingInvoice.id,
          amount: paymentAmount,
          method: paymentMethod,
          reference: paymentRef.trim() || undefined,
          note: paymentNote.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Échec du règlement');

      setInvoices((prev) =>
        prev.map((item) =>
          item.id === payingInvoice.id
            ? { ...item, status: 'Payé', statusEnum: 'PAID' }
            : item
        )
      );
      toast.success(`Règlement enregistré pour ${payingInvoice.reference} (${paymentMethod}).`);
      setPayingInvoice(null);
      router.refresh();
    } catch {
      toast.success('Erreur lors du règlement de la facture.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const ITEMS_PER_PAGE = 8;

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        inv.reference.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q)
      );
    });
  }, [invoices, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedInvoices = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredInvoices, validPage]);

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStatusFilter('all');
    setSearch('');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['Référence', 'Client', 'Date', 'Échéance', 'Montant', 'Statut'];
    const rows = filteredInvoices.map((inv) => [
      `"${inv.reference}"`,
      `"${inv.clientName.replace(/"/g, '""')}"`,
      `"${inv.date.slice(0, 10)}"`,
      `"${inv.dueDate ? inv.dueDate.slice(0, 10) : '—'}"`,
      inv.amount,
      `"${inv.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sparkline-factures-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export CSV des factures généré.');
  };

  const cards = [
    {
      id: 'issued',
      label: 'Facturé',
      value: summary.issued,
      sub: 'Total des factures émises',
      tag: 'Base globale',
      accent: 'ink',
      icon: <FileText size={18} strokeWidth={2} />,
    },
    {
      id: 'paid',
      label: 'Encaissé',
      value: summary.paid,
      sub: `${recoveryRate}% du CA facturé`,
      tag: 'Taux : ' + recoveryRate + '%',
      accent: 'ink',
      icon: <CheckCircle2 size={18} strokeWidth={2} />,
    },
    {
      id: 'pending',
      label: 'À encaisser',
      value: summary.pending,
      sub: 'Factures en attente de règlement',
      tag: 'En attente',
      accent: 'ink',
      icon: <Clock size={18} strokeWidth={2} />,
    },
    {
      id: 'overdue',
      label: 'En retard',
      value: summary.overdue,
      sub: summary.overdue === 0 ? 'Aucun retard de paiement' : 'Échéance dépassée',
      tag: summary.overdue === 0 ? 'À jour' : 'Action requise',
      accent: 'ink',
      icon: summary.overdue === 0 ? (
        <CheckCircle2 size={18} strokeWidth={2} />
      ) : (
        <AlertTriangle size={18} strokeWidth={2} />
      ),
    },
  ];

  return (
    <section className="view active" id="view-finance">
      {/* 4 Stat Cards */}
      <div className="finance-summary" id="financeSummary">
        {cards.map((c) => (
          <article key={c.id} className={`finance-stat-card card-${c.accent}`}>
            <div className="stat-card-top">
              <div className="stat-card-meta">
                <span className="stat-card-label">{c.label}</span>
                <span className={`stat-card-tag tag-${c.accent}`}>{c.tag}</span>
              </div>
              <div className={`stat-card-icon icon-${c.accent}`}>
                {c.icon}
              </div>
            </div>

            <div className="stat-card-middle">
              <div className="stat-card-value">{formatMoney(c.value, currency)}</div>
            </div>

            <div className="stat-card-bottom">
              <span className="stat-card-sub">{c.sub}</span>
            </div>
            <div className={`stat-card-accent-bar bar-${c.accent}`} />
          </article>
        ))}
      </div>

      <div className="dashboard-grid finance-grid">
        {/* Monthly Revenue Chart */}
        <section className="panel finance-chart-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ENCAISSEMENTS</span>
              <h3>Évolution du chiffre d’affaires</h3>
            </div>
            <div className="chart-head-badges">
              <span className="pill-badge pill-period">6 derniers mois</span>
              <span className="pill-badge pill-total">Total : <strong>{formatMoney(periodTotal, currency)}</strong></span>
            </div>
          </div>

          <div className="finance-chart-body">
            {/* Horizontal guide lines */}
            <div className="chart-guides" aria-hidden="true">
              <div className="chart-guide-line"><span className="guide-label">Max</span></div>
              <div className="chart-guide-line"><span className="guide-label">50%</span></div>
              <div className="chart-guide-line base"><span className="guide-label">0</span></div>
            </div>

            <div className="chart-bars" id="financeChart">
              {chartBars.map((bar) => {
                const isHovered = hoveredBar === bar.key;
                return (
                  <div
                    key={bar.key}
                    className={`chart-bar-wrap ${bar.isLatest ? 'is-current' : ''}`}
                    onMouseEnter={() => setHoveredBar(bar.key)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Tooltip / Amount bubble */}
                    <div className={`chart-bar-tooltip ${isHovered || bar.isLatest ? 'visible' : ''}`}>
                      <span className="tooltip-amount">{formatMoney(bar.val, currency)}</span>
                    </div>

                    <div className="chart-bar-track">
                      <div
                        className={`chart-bar ${bar.isLatest ? 'current' : ''} ${bar.val === 0 ? 'zero-val' : ''}`}
                        style={{ height: `${bar.heightPercent}%` }}
                        title={`${bar.fullLabel || bar.label} : ${formatMoney(bar.val, currency)}`}
                      />
                    </div>

                    <div className="chart-label-wrap">
                      <span className={`chart-label ${bar.isLatest ? 'active' : ''}`}>{bar.label}</span>
                      {bar.isLatest && <span className="active-dot" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="chart-footer-metrics">
            <div className="metric-item">
              <span className="metric-label">Moyenne mensuelle</span>
              <strong className="metric-value">{formatMoney(averageMonthly, currency)} / mois</strong>
            </div>
            <div className="metric-divider" />
            <div className="metric-item">
              <span className="metric-label">Mois record</span>
              <strong className="metric-value">{bestMonth.label} ({formatMoney(bestMonth.val, currency)})</strong>
            </div>
          </div>
        </section>

        {/* Breakdown by Status */}
        <section className="panel finance-breakdown-panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">RÉPARTITION</span>
              <h3>État des factures</h3>
            </div>
            <span className="pill-badge pill-rate">Taux : <strong>{recoveryRate}%</strong></span>
          </div>

          <div className="progress-stack" id="financeBreakdown">
            {statusCounts.map((sc, i) => {
              const statusColors: Record<string, { dot: string; fill: string }> = {
                Payé: { dot: '#10b981', fill: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
                Envoyé: { dot: '#f59e0b', fill: 'linear-gradient(90deg, #ff7a00 0%, #ea580c 100%)' },
                Brouillon: { dot: '#94a3b8', fill: 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)' },
                Refusé: { dot: '#f43f5e', fill: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)' },
                Expiré: { dot: '#ef4444', fill: 'linear-gradient(90deg, #ef4444 0%, #b91c1c 100%)' },
              };
              const col = statusColors[sc.label] || { dot: '#888', fill: '#888' };

              return (
                <div key={i} className="progress-item">
                  <div className="progress-meta">
                    <div className="progress-label-wrap">
                      <span className="status-indicator-dot" style={{ background: col.dot }} />
                      <strong className="status-text">{sc.label}</strong>
                    </div>
                    <div className="progress-stats">
                      <span className="count-tag">{sc.count} facture{sc.count > 1 ? 's' : ''}</span>
                      <span className="percent-tag">{sc.percent}%</span>
                    </div>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${sc.percent}%`,
                        background: col.fill,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="recovery-health-box">
            <div
              className="health-icon-wrap"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: recoveryRate >= 70 ? '#ecfdf5' : '#fffbeb',
                color: recoveryRate >= 70 ? '#059669' : '#d97706',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              {recoveryRate >= 70 ? (
                <ShieldCheck size={18} strokeWidth={2.2} />
              ) : (
                <AlertCircle size={18} strokeWidth={2.2} />
              )}
            </div>
            <div className="health-copy">
              <strong>{recoveryRate >= 70 ? 'Santé financière solide' : 'Encaissement à surveiller'}</strong>
              <p>
                {recoveryRate >= 70
                  ? `${recoveryRate}% du montant total facturé a déjà été perçu avec succès.`
                  : `${formatMoney(summary.pending, currency)} en attente d'encaissement.`}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Invoice Tracking Table */}
      <div style={{ marginTop: '16px', paddingBottom: '48px' }}>
        <section className="panel">
          <div className="panel-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="section-kicker">SUIVI DE PAIEMENT</span>
              <h3>Factures & Échéances</h3>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search
                  size={13}
                  strokeWidth={2}
                  style={{ position: 'absolute', left: '10px', color: '#888', pointerEvents: 'none' }}
                />
                <input
                  type="search"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    fontSize: '11px',
                    padding: '6px 26px 6px 30px',
                    borderRadius: '7px',
                    border: '1px solid #e0e0dc',
                  }}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange('')}
                    title="Effacer la recherche"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0,
                    }}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              <FilterDropdown
                label="Statut"
                icon={<CircleDot size={13} strokeWidth={2} />}
                value={statusFilter}
                options={financeStatusOptions}
                onChange={handleStatusFilterChange}
              />

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleExportCSV}
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={13} strokeWidth={2} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="table-wrap">
              <table className="data-table" id="financeTable">
                <tbody>
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px 20px', color: '#999' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: '#f4f4f2',
                          color: '#888884',
                          display: 'grid',
                          placeItems: 'center',
                          margin: '0 auto 8px',
                        }}
                      >
                        <FileText size={20} strokeWidth={1.8} />
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b', marginBottom: '4px' }}>
                        {invoices.length === 0
                          ? 'Aucune facture émise pour le moment.'
                          : 'Aucune facture trouvée pour ces critères.'}
                      </div>
                      {invoices.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-outline"
                          onClick={handleResetFilters}
                          style={{
                            fontSize: '11px',
                            padding: '5px 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            marginTop: '8px',
                          }}
                        >
                          <RotateCcw size={12} strokeWidth={2} />
                          <span>Réinitialiser les filtres</span>
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="responsive-table-desktop">
                <div className="table-wrap">
                  <table className="data-table" id="financeTable">
                    <thead>
                      <tr>
                        <th>Facture</th>
                        <th>Client</th>
                        <th>Émission</th>
                        <th>Échéance</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedInvoices.map((inv) => {
                        const isOverdue = inv.status !== 'Payé' && inv.dueDate && new Date(inv.dueDate) < new Date();
                        const clientInitials = inv.clientName
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase() || 'CL';

                        return (
                          <tr key={inv.id} className="finance-table-row">
                            <td>
                              <Link href={`/documents/${inv.id}`} className="invoice-ref-link">
                                <span className="doc-icon-mini">FAC</span>
                                <span className="ref-text">{inv.reference}</span>
                              </Link>
                            </td>
                            <td>
                              <div className="client-cell">
                                <div className="client-avatar-mini">{clientInitials}</div>
                                <span className="client-name">{inv.clientName}</span>
                              </div>
                            </td>
                            <td className="muted font-mono">{formatDate(inv.date)}</td>
                            <td>
                              {inv.dueDate ? (
                                <span className={`due-date-tag ${isOverdue ? 'overdue' : ''}`}>
                                  {isOverdue && <span className="overdue-dot" />}
                                  {formatDate(inv.dueDate)}
                                </span>
                              ) : (
                                <span className="muted">—</span>
                              )}
                            </td>
                            <td>
                              <strong className="amount-cell">{formatMoney(inv.amount, currency)}</strong>
                            </td>
                            <td>
                              <span className={`status-pill ${inv.status}`}>
                                {inv.status}
                              </span>
                            </td>
                            <td>
                              {inv.status !== 'Payé' ? (
                                <button
                                  type="button"
                                  className="btn-pay-action"
                                  onClick={() => handleOpenPayModal(inv)}
                                  title="Enregistrer un règlement pour cette facture"
                                >
                                  <CreditCard size={12} strokeWidth={2.2} />
                                  <span>Encaisser</span>
                                </button>
                              ) : (
                                <span className="paid-badge">
                                  <Check size={12} strokeWidth={2.5} />
                                  <span>Payé</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile / Tablet Accordion */}
              <div className="responsive-table-mobile">
                <MobileTableAccordion
                  items={paginatedInvoices.map((inv): MobileTableItem => {
                    const isOverdue = inv.status !== 'Payé' && inv.dueDate && new Date(inv.dueDate) < new Date();
                    return {
                      id: inv.id,
                      primaryLabel: 'Facture',
                      primaryValue: inv.reference,
                      previewBadges: (
                        <>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#18181b' }}>
                            {formatMoney(inv.amount, currency)}
                          </span>
                          <span className={`status-pill ${inv.status}`} style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                            {inv.status}
                          </span>
                        </>
                      ),
                      fields: [
                        {
                          label: 'Facture',
                          value: (
                            <Link href={`/documents/${inv.id}`} style={{ fontWeight: 600, color: '#0284c7' }}>
                              {inv.reference}
                            </Link>
                          ),
                        },
                        { label: 'Client', value: <strong>{inv.clientName}</strong> },
                        { label: 'Émission', value: formatDate(inv.date) },
                        {
                          label: 'Échéance',
                          value: inv.dueDate ? (
                            <span className={`due-date-tag ${isOverdue ? 'overdue' : ''}`}>
                              {isOverdue && <span className="overdue-dot" />}
                              {formatDate(inv.dueDate)}
                            </span>
                          ) : '—',
                        },
                        {
                          label: 'Montant',
                          value: <strong>{formatMoney(inv.amount, currency)}</strong>,
                        },
                        {
                          label: 'Statut',
                          value: <span className={`status-pill ${inv.status}`}>{inv.status}</span>,
                        },
                      ],
                      actions: (
                        <>
                          <Link
                            href={`/documents/${inv.id}`}
                            className="mobile-action-circle edit"
                            title="Ouvrir la facture"
                          >
                            <Pencil size={15} strokeWidth={2} />
                          </Link>
                          {inv.status !== 'Payé' ? (
                            <button
                              type="button"
                              className="btn-pay-action"
                              onClick={() => handleOpenPayModal(inv)}
                              title="Enregistrer un règlement"
                              style={{ height: '34px', padding: '0 12px', borderRadius: '18px' }}
                            >
                              <CreditCard size={13} strokeWidth={2.2} />
                              <span>Encaisser</span>
                            </button>
                          ) : (
                            <span className="paid-badge" style={{ height: '34px', padding: '0 12px', borderRadius: '18px' }}>
                              <Check size={13} strokeWidth={2.5} />
                              <span>Payé</span>
                            </span>
                          )}
                        </>
                      ),
                    };
                  })}
                />
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="templates-pagination-bar" style={{ padding: '16px 20px', margin: 0 }}>
              <span className="pagination-info">
                Affichage de <strong>{(validPage - 1) * ITEMS_PER_PAGE + 1}</strong> à{' '}
                <strong>{Math.min(validPage * ITEMS_PER_PAGE, filteredInvoices.length)}</strong> sur{' '}
                <strong>{filteredInvoices.length}</strong> factures
              </span>

              <div className="pagination-controls">
                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={validPage === 1}
                  aria-label="Page précédente"
                >
                  <ChevronLeft size={16} strokeWidth={2} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`pagination-btn page-num ${pageNum === validPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  className="pagination-btn nav-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={validPage === totalPages}
                  aria-label="Page suivante"
                >
                  <ChevronRight size={16} strokeWidth={2} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Payment Registration Modal */}
      {payingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPayingInvoice(null)}
          kicker="RÈGLEMENT DE FACTURE"
          title={`Encaisser ${payingInvoice.reference}`}
          intro={`Enregistrez le paiement reçu pour le client ${payingInvoice.clientName}.`}
        >
          <form onSubmit={handleConfirmPayment} className="form-grid">
            <div className="inline-row">
              <div className="field">
                <label>Montant encaissé ({currency}) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value || 0))}
                  required
                />
              </div>

              <div className="field">
                <label>Moyen de paiement *</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="Wave">Wave</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Référence de transaction / Reçu</label>
              <input
                placeholder="Ex : TID-982348 ou REF-VIR-001"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Note / Remarque</label>
              <textarea
                placeholder="Remarque éventuelle sur ce paiement…"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                rows={2}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPayingInvoice(null)}
                disabled={submittingPayment}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-dark"
                disabled={submittingPayment || paymentAmount <= 0}
              >
                {submittingPayment ? 'Enregistrement…' : 'Valider le règlement'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
