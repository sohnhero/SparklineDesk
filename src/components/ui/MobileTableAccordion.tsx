'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface MobileTableField {
  label: string;
  value: React.ReactNode;
}

export interface MobileTableItem {
  id: string;
  primaryLabel?: string;
  primaryValue: React.ReactNode;
  previewBadges?: React.ReactNode;
  fields: MobileTableField[];
  actions?: React.ReactNode;
}

interface MobileTableAccordionProps {
  items: MobileTableItem[];
  emptyMessage?: string;
  className?: string;
}

export function MobileTableAccordion({
  items,
  emptyMessage = 'Aucun élément à afficher.',
  className = '',
}: MobileTableAccordionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className={`mobile-table-empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`mobile-table-accordion ${className}`} role="region" aria-label="Liste responsive">
      {items.map((item) => {
        const isExpanded = expandedIds.has(item.id);

        return (
          <div
            key={item.id}
            className={`mobile-table-card ${isExpanded ? 'expanded' : ''}`}
          >
            {/* Header row (always visible) */}
            <div
              className="mobile-card-header"
              onClick={() => toggleItem(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(item.id);
                }
              }}
              aria-expanded={isExpanded}
            >
              <button
                type="button"
                className="mobile-toggle-btn"
                aria-label={isExpanded ? 'Réduire' : 'Développer'}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {isExpanded ? (
                  <ChevronUp size={16} strokeWidth={2.6} />
                ) : (
                  <ChevronDown size={16} strokeWidth={2.6} />
                )}
              </button>

              <div className="mobile-card-summary">
                <div className="mobile-card-primary">
                  {item.primaryLabel && (
                    <span className="mobile-label-tag">{item.primaryLabel}</span>
                  )}
                  <span className="mobile-primary-val">{item.primaryValue}</span>
                </div>

                {item.previewBadges && (
                  <div className="mobile-card-preview-badges">
                    {item.previewBadges}
                  </div>
                )}
              </div>
            </div>

            {/* Expandable details area */}
            {isExpanded && (
              <div className="mobile-card-body">
                {item.fields.map((field, idx) => (
                  <div key={idx} className="mobile-field-row">
                    <span className="mobile-field-label">{field.label}</span>
                    <div className="mobile-field-value">{field.value}</div>
                  </div>
                ))}

                {item.actions && (
                  <div className="mobile-field-row mobile-actions-wrapper">
                    <span className="mobile-field-label">Action</span>
                    <div
                      className="mobile-actions-row"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.actions}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
