'use client';

import React from 'react';
import { formatMoney, formatDate } from '@/lib/utils/format';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';

interface DocumentSheetProps {
  document: {
    type: DocTypeKey;
    reference: string;
    title: string;
    intro?: string | null;
    status: string;
    issueDate: string;
    dueDate?: string | null;
    validityDays?: number | null;
    discountPercent: number;
    taxRate: number;
    depositAmount: number;
    conditions?: string | null;
    notes?: string | null;
    options?: {
      showSignature?: boolean;
      showTax?: boolean;
    } | null;
    lines: Array<{
      name: string;
      description?: string | null;
      qty: number;
      price: number;
    }>;
  };
  client?: {
    name: string;
    sector?: string | null;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
  company: {
    name: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    currency: string;
  };
}

export function DocumentSheet({
  document: doc,
  client,
  company,
}: DocumentSheetProps) {
  const meta = TYPE_META[doc.type] || TYPE_META.quote;
  const currency = company.currency || 'FCFA';

  const totals = calculateDocumentTotals({
    items: doc.lines,
    discount: doc.discountPercent,
    taxRate: doc.taxRate,
    deposit: doc.depositAmount,
  });

  const conditionsList = (doc.conditions || '')
    .split('\n')
    .filter(Boolean)
    .map((line) => line.replace(/^[-•]\s*/, ''));

  const showSignature = doc.options?.showSignature !== false;
  const showTax = doc.options?.showTax || Number(doc.taxRate) > 0;

  return (
    <div className="doc-sheet">
      <header className="doc-sheet-header">
        <img
          className="doc-sheet-logo"
          src="/assets/sparkline-logo-dark.svg"
          alt="Sparkline"
        />
        <div className="doc-meta">
          <div className="doc-label">{meta.label.toUpperCase()}</div>
          <h1 className={doc.type === 'invoice' ? 'invoice-title' : ''}>
            {doc.reference}
          </h1>
          <div className="doc-meta-dates">
            <span>Date : {formatDate(doc.issueDate)}</span>
            {doc.dueDate && (
              <>
                <span className="dot-sep">·</span>
                <span>Échéance : {formatDate(doc.dueDate)}</span>
              </>
            )}
            {doc.validityDays ? (
              <>
                <span className="dot-sep">·</span>
                <span>Validité : {doc.validityDays} jours</span>
              </>
            ) : null}
          </div>
          {(doc.status === 'Payé' || doc.status === 'PAID') && (
            <span className="paid-stamp">PAYÉ</span>
          )}
        </div>
      </header>

      <div className="doc-hero-title">
        <div className="accent-line" />
        <h2>{doc.title || meta.label}</h2>
        {doc.intro && <p>{doc.intro}</p>}
      </div>

      <div className="client-strip">
        <div>
          <small>À L’ATTENTION DE</small>
          <strong>{client?.name || 'Client à renseigner'}</strong>
          <div className="doc-sub">{client?.sector || ''}</div>
        </div>
        <div>
          <small>COORDONNÉES</small>
          <strong>{client?.contactName || client?.email || '—'}</strong>
          <div className="doc-sub">{client?.address || client?.phone || ''}</div>
        </div>
      </div>

      <section className="doc-section">
        <div className="doc-section-title">
          <span className="num">01</span>
          <h3>Détail des prestations</h3>
        </div>
        <table className="doc-table">
          <thead>
            <tr>
              <th>Prestation</th>
              <th>Qté</th>
              <th>Prix unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {doc.lines.length === 0 ? (
              <tr>
                <td colSpan={4}>Aucune ligne.</td>
              </tr>
            ) : (
              doc.lines.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="item-name">{item.name || 'Prestation'}</div>
                    {item.description && (
                      <div className="item-desc">{item.description}</div>
                    )}
                  </td>
                  <td>{Number(item.qty || 1)}</td>
                  <td>{formatMoney(item.price, currency)}</td>
                  <td>
                    {formatMoney(
                      Number(item.qty || 1) * Number(item.price || 0),
                      currency
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="doc-total-box">
          <div className="total-row">
            <span>Sous-total</span>
            <strong>{formatMoney(totals.subtotal, currency)}</strong>
          </div>
          {Number(doc.discountPercent) > 0 && (
            <div className="total-row">
              <span>Remise ({Number(doc.discountPercent)}%)</span>
              <strong>− {formatMoney(totals.discountAmount, currency)}</strong>
            </div>
          )}
          {showTax && (
            <div className="total-row">
              <span>TVA ({Number(doc.taxRate)}%)</span>
              <strong>{formatMoney(totals.taxAmount, currency)}</strong>
            </div>
          )}
          {Number(doc.depositAmount) > 0 && (
            <div className="total-row">
              <span>Acompte</span>
              <strong>− {formatMoney(doc.depositAmount, currency)}</strong>
            </div>
          )}
          <div className="total-row grand">
            <span>Total</span>
            <strong>{formatMoney(totals.totalToPay, currency)}</strong>
          </div>
        </div>
      </section>

      {conditionsList.length > 0 && (
        <section className="doc-section">
          <div className="doc-section-title">
            <span className="num">02</span>
            <h3>Conditions particulières</h3>
          </div>
          <ul>
            {conditionsList.map((cond, idx) => (
              <li key={idx}>{cond}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="doc-closing-block">
        {doc.notes && (
          <div className="doc-callout">
            <small>NOTE</small>
            <h3>Pour la suite</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{doc.notes}</p>
          </div>
        )}

        <footer className="doc-footer">
          <div className="signature-block">
            {showSignature && (
              <div className="signature-line">Signature représentant SPARKLINE</div>
            )}
          </div>
          <div className="footer-contact">
            <p>
              <strong>{company.legalName}</strong>
            </p>
            <p>
              {company.address} · {company.phone}
            </p>
            <p>
              {company.email} · {company.website}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
