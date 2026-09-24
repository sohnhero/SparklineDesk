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
} from 'lucide-react';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';

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
  const { toast } = useToast();

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
      toast('Document dupliqué avec succès.');
      router.refresh();
      const data = await res.json();
      router.push(`/documents/${data.document.id}`);
    } catch {
      toast('Erreur lors de la duplication', 'error');
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
      toast('Document supprimé.');
      router.refresh();
    } catch {
      toast('Erreur lors de la suppression', 'error');
    }
  };

  const startIndex = filteredDocs.length === 0 ? 0 : (validPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(validPage * ITEMS_PER_PAGE, filteredDocs.length);

  return (
    <section className="view active" id="view-documents">
      {/* Top Toolbar */}
      <div className="view-toolbar">
        <div className="toolbar-filters">
          <select
            id="documentTypeFilter"
            className="control"
            value={typeFilter}
            onChange={(e) => handleTypeFilterChange(e.target.value)}
          >
            <option value="all">Tous les types ({documents.length})</option>
            {(Object.entries(TYPE_META) as [DocTypeKey, typeof TYPE_META[DocTypeKey]][]).map(
              ([k, m]) => {
                const count = documents.filter((d) => d.typeKey === k).length;
                return (
                  <option key={k} value={k}>
                    {m.label} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              }
            )}
          </select>

          <select
            id="documentStatusFilter"
            className="control"
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="Brouillon">Brouillon</option>
            <option value="Envoyé">Envoyé</option>
            <option value="Accepté">Accepté</option>
            <option value="Payé">Payé</option>
            <option value="Refusé">Refusé</option>
            <option value="Expiré">Expiré</option>
          </select>
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
