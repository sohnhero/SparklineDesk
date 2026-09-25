'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { DocTypeKey, DocumentKind } from '@/domains/documents/types';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { TemplateCardCover } from './TemplateCardCover';

export interface TemplateItem {
  key: DocTypeKey;
  label: string;
  description: string;
  tag: string;
  kind?: DocumentKind;
  prefix?: string;
  icon?: string;
  category?: 'billing' | 'proposal' | 'operations';
}

interface TemplatesClientViewProps {
  templates: TemplateItem[];
  currency?: string;
}

const ITEMS_PER_PAGE = 6;

type FilterCategory = 'all' | 'billing' | 'proposal' | 'operations';

export function TemplatesClientView({ templates, currency = 'FCFA' }: TemplatesClientViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<DocTypeKey>('quote');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<FilterCategory>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Category filter
      if (category !== 'all') {
        if (tpl.category !== category) return false;
      }
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesLabel = tpl.label.toLowerCase().includes(q);
        const matchesDesc = tpl.description.toLowerCase().includes(q);
        const matchesKey = tpl.key.toLowerCase().includes(q);
        const matchesPrefix = tpl.prefix?.toLowerCase().includes(q);
        if (!matchesLabel && !matchesDesc && !matchesKey && !matchesPrefix) {
          return false;
        }
      }
      return true;
    });
  }, [templates, category, search]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE));
  const validPage = Math.min(currentPage, totalPages);

  const paginatedTemplates = useMemo(() => {
    const start = (validPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTemplates, validPage]);

  // Handle category change
  const handleSelectCategory = (cat: FilterCategory) => {
    setCategory(cat);
    setCurrentPage(1);
  };

  // Handle search change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  // Clear filters
  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setCurrentPage(1);
  };

  const handleUseTemplate = (typeKey: DocTypeKey) => {
    setSelectedTemplateKey(typeKey);
    setModalOpen(true);
  };

  const categoryCounts = {
    all: templates.length,
    billing: templates.filter((t) => t.category === 'billing').length,
    proposal: templates.filter((t) => t.category === 'proposal').length,
    operations: templates.filter((t) => t.category === 'operations').length,
  };

  const startIndex = filteredTemplates.length === 0 ? 0 : (validPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(validPage * ITEMS_PER_PAGE, filteredTemplates.length);

  return (
    <section className="view active" id="view-templates" style={{ paddingBottom: '48px' }}>
      {/* Intro Header */}
      <div className="templates-intro">
        <span className="section-kicker">BIBLIOTHÈQUE SPARKLINE</span>
        <h2>Des modèles prêts à adapter.</h2>
        <p>
          Chaque modèle utilise la charte graphique Sparkline et préremplit une structure
          professionnelle adaptée à vos prestations. Choisissez un modèle et personnalisez votre document.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="templates-filter-bar">
        {/* Category Tabs */}
        <div className="templates-tabs">
          <button
            type="button"
            className={`templates-tab-btn ${category === 'all' ? 'active' : ''}`}
            onClick={() => handleSelectCategory('all')}
          >
            <span>Tous les modèles</span>
            <span className="tab-count">{categoryCounts.all}</span>
          </button>
          <button
            type="button"
            className={`templates-tab-btn ${category === 'billing' ? 'active' : ''}`}
            onClick={() => handleSelectCategory('billing')}
          >
            <span>Facturation & Devis</span>
            <span className="tab-count">{categoryCounts.billing}</span>
          </button>
          <button
            type="button"
            className={`templates-tab-btn ${category === 'proposal' ? 'active' : ''}`}
            onClick={() => handleSelectCategory('proposal')}
          >
            <span>Propositions & Contrats</span>
            <span className="tab-count">{categoryCounts.proposal}</span>
          </button>
          <button
            type="button"
            className={`templates-tab-btn ${category === 'operations' ? 'active' : ''}`}
            onClick={() => handleSelectCategory('operations')}
          >
            <span>Commandes & Suivi</span>
            <span className="tab-count">{categoryCounts.operations}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="templates-search-box">
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input
            type="search"
            placeholder="Rechercher un modèle…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => handleSearchChange('')}
              title="Effacer la recherche"
            >
              <X size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Templates or Empty State */}
      {filteredTemplates.length === 0 ? (
        <div className="templates-empty-state panel">
          <div className="empty-icon-wrap">
            <FileText size={28} strokeWidth={1.8} />
          </div>
          <h3>Aucun modèle trouvé</h3>
          <p>
            {search.trim()
              ? `Aucun modèle ne correspond à votre recherche « ${search} ».`
              : 'Aucun modèle disponible dans cette catégorie.'}
          </p>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleResetFilters}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px' }}
          >
            <RotateCcw size={13} strokeWidth={2} />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      ) : (
        <>
          <div className="template-grid" id="templateGrid">
            {paginatedTemplates.map((tpl) => (
              <article key={tpl.key} className="template-card">
                {/* Personalized Custom Graphic Cover */}
                <div
                  className="template-preview"
                  onClick={() => handleUseTemplate(tpl.key)}
                  style={{ cursor: 'pointer' }}
                  title="Cliquer pour utiliser ce modèle"
                >
                  <TemplateCardCover
                    typeKey={tpl.key}
                    label={tpl.label}
                    prefix={tpl.prefix || 'DOC'}
                    kind={tpl.kind || 'financial'}
                  />
                </div>

                {/* Card Content & Action */}
                <div className="template-copy">
                  <div className="template-copy-head">
                    <div>
                      <span className="template-type-kicker">
                        {tpl.kind === 'proposal' ? 'DOC ÉDITORIAL' : 'FINANCIER'}
                      </span>
                      <h3>{tpl.label}</h3>
                    </div>
                    <span className="template-tag">{tpl.prefix || tpl.tag}</span>
                  </div>
                  <p>{tpl.description}</p>
                  <button
                    type="button"
                    className="btn btn-dark template-use-btn"
                    onClick={() => handleUseTemplate(tpl.key)}
                  >
                    <Plus size={13} strokeWidth={2.2} />
                    <span>Utiliser<span className="template-btn-extra"> ce modèle</span></span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="templates-pagination-bar">
              <span className="pagination-info">
                Affichage de <strong>{startIndex}</strong> à <strong>{endIndex}</strong> sur{' '}
                <strong>{filteredTemplates.length}</strong> modèles
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

      {/* Creation Modal */}
      <DocumentTypeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialType={selectedTemplateKey}
      />
    </section>
  );
}
