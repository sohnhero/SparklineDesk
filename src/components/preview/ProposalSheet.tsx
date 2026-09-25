'use client';

import React from 'react';
import { formatDate } from '@/lib/utils/format';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';

interface ProposalSheetProps {
  document: {
    type: DocTypeKey;
    reference: string;
    title: string;
    intro?: string | null;
    status: string;
    issueDate: string;
    conditions?: string | null;
    notes?: string | null;
    options?: {
      showSignature?: boolean;
      coverPage?: boolean;
    } | null;
    sections: Array<{
      title: string;
      content: string;
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
  };
}

export function ProposalSheet({
  document: doc,
  client,
  company,
}: ProposalSheetProps) {
  const meta = TYPE_META[doc.type] || TYPE_META.proposal;
  const showCover = doc.type === 'proposal' && doc.options?.coverPage !== false;
  const showSignature = doc.options?.showSignature !== false;

  const renderSectionContent = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`}>
            {currentList.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    lines.forEach((line, idx) => {
      if (/^[-•]\s+/.test(line)) {
        currentList.push(line.replace(/^[-•]\s+/, ''));
      } else {
        flushList();
        if (line.trim()) {
          elements.push(<p key={idx}>{line}</p>);
        }
      }
    });
    flushList();

    return elements;
  };

  return (
    <>
      {showCover && (
        <>
          <div className="proposal-cover">
            <img
              className="proposal-cover-logo"
              src="/assets/sparkline-logo-dark.svg"
              alt="Sparkline"
            />
            <div className="proposal-cover-main">
              <div className="overline">
                PROPOSITION POUR {(client?.name || 'VOTRE CLIENT').toUpperCase()}
              </div>
              <h1>
                {doc.title.split('—').map((part, i) =>
                  i === 0 ? (
                    part
                  ) : (
                    <React.Fragment key={i}>
                      <br />
                      <span>—</span> {part}
                    </React.Fragment>
                  )
                )}
              </h1>
              {doc.intro && <p>{doc.intro}</p>}
            </div>
            <div className="proposal-cover-footer">
              <div>
                <strong>{doc.reference}</strong>
                <br />
                {formatDate(doc.issueDate)}
              </div>
              <div>
                {company.website}
                <br />
                {company.email}
              </div>
            </div>
          </div>
          <div className="page-break-label screen-only">PAGE 2 — PROPOSITION DÉTAILLÉE</div>
        </>
      )}

      <div className="proposal-body">
        <header className="doc-sheet-header">
          <img
            className="doc-sheet-logo"
            src="/assets/sparkline-logo-dark.svg"
            alt="Sparkline"
          />
          <div className="doc-meta">
            <div className="doc-label">{meta.label.toUpperCase()}</div>
            <h1>{doc.reference}</h1>
            <p>{formatDate(doc.issueDate)}</p>
          </div>
        </header>

        {!showCover && (
          <div className="doc-hero-title">
            <div className="accent-line" />
            <h2>{doc.title}</h2>
            {doc.intro && <p>{doc.intro}</p>}
          </div>
        )}

        <div className="client-strip">
          <div>
            <small>CLIENT</small>
            <strong>{client?.name || 'Client à renseigner'}</strong>
            <div className="doc-sub">{client?.sector || ''}</div>
          </div>
          <div>
            <small>PRÉPARÉ PAR</small>
            <strong>{company.legalName}</strong>
            <div className="doc-sub">{company.address}</div>
          </div>
        </div>

        {doc.sections.map((section, idx) => (
          <section key={idx} className="proposal-section">
            <div className="index">{String(idx + 1).padStart(2, '0')}</div>
            <h2>{section.title}</h2>
            {renderSectionContent(section.content)}
          </section>
        ))}

        {doc.conditions && (
          <div className="doc-callout">
            <small>MODALITÉS</small>
            <h3>Conditions de collaboration</h3>
            <p style={{ whiteSpace: 'pre-line' }}>{doc.conditions}</p>
          </div>
        )}

        <div className="proposal-closing-block">
          {doc.notes && (
            <section className="proposal-section conclusion-section">
              <h2>Conclusion</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{doc.notes}</p>
            </section>
          )}

          <footer className="doc-footer">
            <div className="signature-block">
              {showSignature && (
                <div className="signature-line">Signature & validation</div>
              )}
            </div>
            <div className="footer-contact">
              <p>
                <strong>{company.legalName}</strong>
              </p>
              <p>
                {company.phone} · {company.email}
              </p>
              <p>{company.website}</p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
