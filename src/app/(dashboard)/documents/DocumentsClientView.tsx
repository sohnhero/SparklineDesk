'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Plus,
  Pencil,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Layers,
  CircleDot,
} from 'lucide-react';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { MobileTableAccordion, MobileTableItem } from '@/components/ui/MobileTableAccordion';
import { FilterDropdown, FilterOption } from '@/components/ui/FilterDropdown';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { toast } from 'react-toastify';

export interface DocumentListItem {
  id: string;
  reference: string;
  typeKey: DocTypeKey;
  typeLabel: string;
  typeIcon: string;
  isFinancial: boolean;
  clientName: string;
  title: string;
  amount: number | null;
  status: string;
  statusEnum: string;
  date: string;
  updatedAt: string;
}

interface DocumentsClientViewProps {
  initialDocuments: DocumentListItem[];
  currency: string;
}

const ITEMS_PER_PAGE = 10;

export function DocumentsClientView({
  initialDocuments,
  currency,
}: DocumentsClientViewProps) {
  const [documents, setDocuments] = useState<DocumentListItem[]>(initialDocuments);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  
  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      if (typeFilter !== 'all' && doc.typeKey !== typeFilter) return false;
      if (statusFilter !== 'all' && doc.status !== statusFilter) return false;
      if (!search.trim()) return true;

      const q = search.trim().toLowerCase();
      const str = `${doc.reference} ${doc.title} ${doc.clientName} ${doc.typeLabel}`.toLowerCase();
      return str.includes(q);
    });
  }, [documents, typeFilter, statusFilter, search]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedDocs = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredDocs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDocs, validPage]);

  const handleTypeFilterChange = (val: string) => {
    setTypeFilter(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
    setCurrentPage(1);
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Échec duplication');
      toast.success('Document dupliqué avec succès.');
      router.refresh();
      const data = await res.json();
      router.push(`/documents/${data.document.id}`);
    } catch {
      toast.success('Erreur lors de la duplication');
    }
  };

  const handleDelete = async (doc: DocumentListItem) => {
    if (!confirm(`Supprimer le document ${doc.reference} ?`)) return;

    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Échec suppression');
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success('Document supprimé.');
      router.refresh();
    } catch {
      toast.success('Erreur lors de la suppression');
    }
  };

  const startIndex = filteredDocs.length === 0 ? 0 : (validPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(validPage * ITEMS_PER_PAGE, filteredDocs.length);

  const typeOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'Tous les types', count: documents.length },
    ...(Object.entries(TYPE_META) as [DocTypeKey, typeof TYPE_META[DocTypeKey]][]).map(([k, m]) => {
      const count = documents.filter((d) => d.typeKey === k).length;
      return {
        value: k,
        label: m.label,
        count: count > 0 ? count : undefined,
      };
    }),
  ], [documents]);

  const statusOptions: FilterOption[] = useMemo(() => [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'Brouillon', label: 'Brouillon', dotColor: '#71717a' },
    { value: 'Envoyé', label: 'Envoyé', dotColor: '#2563eb' },
    { value: 'Accepté', label: 'Accepté', dotColor: '#059669' },
    { value: 'Payé', label: 'Payé', dotColor: '#16a34a' },
    { value: 'Refusé', label: 'Refusé', dotColor: '#dc2626' },
    { value: 'Expiré', label: 'Expiré', dotColor: '#ea580c' },
  ], []);

  return (
    <section className="view active" id="view-documents">
      {/* Top Toolbar */}
      <div className="view-toolbar">
        <div className="toolbar-filters">
          <FilterDropdown
            id="documentTypeFilter"
            label="Type"
            icon={<Layers size={13} strokeWidth={2} />}
            value={typeFilter}
            options={typeOptions}
            onChange={handleTypeFilterChange}
          />

          <FilterDropdown
            id="documentStatusFilter"
            label="Statut"
            icon={<CircleDot size={13} strokeWidth={2} />}
            value={statusFilter}
            options={statusOptions}
            onChange={handleStatusFilterChange}
          />
        </div>

        <button
          type="button"
          className="btn btn-dark"
          id="documentsNewBtn"
          onClick={() => setModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={14} strokeWidth={2.5} />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Main Table Panel */}
      <div className="panel documents-panel">
        <div className="list-search" style={{ position: 'relative' }}>
          <Search size={14} strokeWidth={2} style={{ color: '#a1a1aa' }} />
          <input
            id="documentsSearch"
            type="search"
            placeholder="Rechercher par référence, client ou objet…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => handleSearchChange('')}
              title="Effacer la recherche"
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {filteredDocs.length === 0 ? (
          documents.length === 0 ? (
            <div className="empty-state" id="documentsEmpty">
              <div className="empty-icon" style={{ display: 'grid', placeItems: 'center' }}>
                <FileText size={26} strokeWidth={1.8} />
              </div>
              <h3>Aucun document créé</h3>
              <p>Commencez dès maintenant par créer votre premier devis, facture ou contrat.</p>
              <button
                type="button"
                className="btn btn-dark"
                id="emptyNewDoc"
                onClick={() => setModalOpen(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
              >
                <Plus size={14} strokeWidth={2.5} />
                <span>Créer un document</span>
              </button>
            </div>
          ) : (
            <div className="empty-state" id="documentsSearchEmpty">
              <div className="empty-icon" style={{ display: 'grid', placeItems: 'center' }}>
                <Search size={24} strokeWidth={1.8} />
              </div>
              <h3>Aucun résultat trouvé</h3>
              <p>Aucun document ne correspond à vos filtres et critères de recherche.</p>
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleResetFilters}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
              >
                <RotateCcw size={13} strokeWidth={2} />
                <span>Réinitialiser les filtres</span>
              </button>
            </div>
          )
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="responsive-table-desktop">
              <div className="table-wrap">
                <table className="data-table roomy">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Type</th>
                      <th>Client</th>
                      <th>Objet</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Mise à jour</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="documentsBody">
                    {paginatedDocs.map((d) => (
                      <tr key={d.id}>
                        <td>
                          <div className="doc-main">
                            <div className="doc-icon">{d.typeIcon}</div>
                            <div>
                              <div className="doc-title">{d.reference}</div>
                              <div className="doc-sub">{formatDate(d.date)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="doc-type-badge">{d.typeLabel}</span>
                        </td>
                        <td>
                          <strong style={{ fontWeight: 600, color: '#18181b' }}>{d.clientName}</strong>
                        </td>
                        <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.title}
                        </td>
                        <td className="amount-cell">
                          {d.isFinancial && d.amount !== null
                            ? formatMoney(d.amount, currency)
                            : '—'}
                        </td>
                        <td>
                          <span className={`status-pill ${d.statusEnum}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="muted font-mono" style={{ fontSize: '11px' }}>
                          {formatDate(d.updatedAt)}
                        </td>
                        <td>
                          <div className="row-actions" style={{ justifyContent: 'flex-end', gap: '4px' }}>
                            <Link
                              href={`/documents/${d.id}`}
                              className="mini-action"
                              title="Modifier ce document"
                            >
                              <Pencil size={13} strokeWidth={2} />
                            </Link>
                            <button
                              type="button"
                              className="mini-action"
                              title="Dupliquer ce document"
                              onClick={() => handleDuplicate(d.id)}
                            >
                              <Copy size={13} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              className="mini-action danger"
                              title="Supprimer ce document"
                              onClick={() => handleDelete(d)}
                            >
                              <Trash2 size={13} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Accordion View */}
            <div className="responsive-table-mobile">
              <MobileTableAccordion
                items={paginatedDocs.map((d): MobileTableItem => ({
                  id: d.id,
                  primaryLabel: 'Document',
                  primaryValue: d.reference,
                  previewBadges: (
                    <>
                      {d.isFinancial && d.amount !== null && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#18181b' }}>
                          {formatMoney(d.amount, currency)}
                        </span>
                      )}
                      <span className={`status-pill ${d.statusEnum}`} style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                        {d.status}
                      </span>
                    </>
                  ),
                  fields: [
                    { label: 'Référence', value: <strong style={{ color: '#0284c7' }}>{d.reference}</strong> },
                    { label: 'Type', value: <span className="doc-type-badge">{d.typeLabel}</span> },
                    { label: 'Client', value: <strong>{d.clientName}</strong> },
                    { label: 'Objet', value: d.title || '—' },
                    {
                      label: 'Montant',
                      value: d.isFinancial && d.amount !== null ? (
                        <strong style={{ fontSize: '13px' }}>{formatMoney(d.amount, currency)}</strong>
                      ) : '—',
                    },
                    {
                      label: 'Statut',
                      value: <span className={`status-pill ${d.statusEnum}`}>{d.status}</span>,
                    },
                    { label: 'Émission', value: formatDate(d.date) },
                    { label: 'Mise à jour', value: formatDate(d.updatedAt) },
                  ],
                  actions: (
                    <>
                      <button
                        type="button"
                        className="mobile-action-circle danger"
                        title="Supprimer ce document"
                        onClick={() => handleDelete(d)}
                      >
                        <Trash2 size={15} strokeWidth={2} />
                      </button>
                      <Link
                        href={`/documents/${d.id}`}
                        className="mobile-action-circle edit"
                        title="Modifier ce document"
                      >
                        <Pencil size={15} strokeWidth={2} />
                      </Link>
                      <button
                        type="button"
                        className="mobile-action-circle secondary"
                        title="Dupliquer ce document"
                        onClick={() => handleDuplicate(d.id)}
                      >
                        <Copy size={15} strokeWidth={2} />
                      </button>
                    </>
                  ),
                }))}
              />
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="templates-pagination-bar" style={{ padding: '16px 20px', margin: 0 }}>
                <span className="pagination-info">
                  Affichage de <strong>{startIndex}</strong> à <strong>{endIndex}</strong> sur{' '}
                  <strong>{filteredDocs.length}</strong> documents
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
          </>
        )}
      </div>

      <DocumentTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
