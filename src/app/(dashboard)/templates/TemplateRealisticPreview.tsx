'use client';

import React from 'react';
import { DocTypeKey, DocumentKind } from '@/domains/documents/types';

interface TemplateRealisticPreviewProps {
  typeKey: DocTypeKey;
  label: string;
  prefix: string;
  kind: DocumentKind;
  currency?: string;
}

export function TemplateRealisticPreview({
  typeKey,
  label,
  prefix,
  kind,
  currency = 'FCFA',
}: TemplateRealisticPreviewProps) {
  return (
    <div className={`realistic-doc-sheet sheet-${typeKey} sheet-kind-${kind}`}>
      {/* Brand Watermark / Mini Sparkline Logo */}
      <div className="mini-sheet-top">
        <div className="mini-brand">
          <span className="mini-brand-mark">
            <span className="dot" />
          </span>
          <span className="mini-brand-name">Sparkline</span>
        </div>
        <div className="mini-doc-ref-badge">
          <span className="mini-doc-type-badge">{prefix}</span>
          <span className="mini-doc-ref-num">2026-042</span>
        </div>
      </div>

      {/* Render layout specific to each document type */}
      {typeKey === 'quote' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">DEVIS ESTIMATIF</div>
            <div className="mini-doc-date">24/09/2026 • Validité 30j</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">DESTINATAIRE</div>
            <div className="mini-client-name">Studio Acme SARL</div>
          </div>

          <div className="mini-table">
            <div className="mini-table-head">
              <span>PRESTATION</span>
              <span>TOTAL</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Design UI & Identité</span>
              <span className="item-val">1 250k</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Développement Web</span>
              <span className="item-val">2 400k</span>
            </div>
          </div>

          <div className="mini-totals-box">
            <div className="mini-total-line">
              <span>Total HT</span>
              <span>3 650 000</span>
            </div>
            <div className="mini-total-line grand-total">
              <span>NET TTC</span>
              <span>4 307 000 {currency}</span>
            </div>
          </div>

          <div className="mini-signature-zone">
            <span className="mini-sig-label">Bon pour accord & Signature</span>
            <div className="mini-sig-line">
              <svg className="mini-sig-curve" viewBox="0 0 60 14" fill="none">
                <path d="M2 10 C15 2, 25 14, 38 6 C44 2, 50 12, 58 5" stroke="#18181b" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {typeKey === 'invoice' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">FACTURE DE VENTE</div>
            <div className="mini-status-chip unpaid">À RÉGLER</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">FACTURÉ À</div>
            <div className="mini-client-name">Groupe Horizon SA</div>
          </div>

          <div className="mini-table">
            <div className="mini-table-head">
              <span>PRESTATION</span>
              <span>MONTANT</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Mission Conseil & Audit</span>
              <span className="item-val">1 800k</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Accompagnement Q3</span>
              <span className="item-val">950k</span>
            </div>
          </div>

          <div className="mini-totals-box invoice-totals">
            <div className="mini-total-line">
              <span>TVA (18%)</span>
              <span>495 000</span>
            </div>
            <div className="mini-total-line grand-total">
              <span>NET À PAYER</span>
              <span>3 245 000 {currency}</span>
            </div>
          </div>

          <div className="mini-payment-strip">
            <span className="mini-pay-title">Échéance : 30 jours net</span>
            <span className="mini-pay-sub">Virement bancaire • IBAN CI93...</span>
          </div>
        </div>
      )}

      {typeKey === 'deposit' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">FACTURE D’ACOMPTE</div>
            <div className="mini-status-chip neutral">50 %</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">ACOMPTE SUR DEV-2026-039</div>
            <div className="mini-client-name">Nexa Technologies</div>
          </div>

          <div className="mini-deposit-gauge">
            <div className="mini-gauge-track">
              <div className="mini-gauge-fill" style={{ width: '50%' }} />
            </div>
            <div className="mini-gauge-labels">
              <span>Acompte : 50%</span>
              <span>Solde : 50%</span>
            </div>
          </div>

          <div className="mini-totals-box">
            <div className="mini-total-line grand-total">
              <span>ACOMPTE EXIGIBLE</span>
              <span>1 450 000 {currency}</span>
            </div>
          </div>

          <div className="mini-payment-strip">
            <span className="mini-pay-title">Conditions de démarrage</span>
            <span className="mini-pay-sub">Prestation initiée dès réception du règlement</span>
          </div>
        </div>
      )}

      {typeKey === 'credit' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title credit-title">AVOIR COMMERCIAL</div>
            <div className="mini-status-chip credit">RÉGULARISATION</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">RÉF. FACTURE FAC-2026-0089</div>
            <div className="mini-client-name">Atlas Média SARL</div>
          </div>

          <div className="mini-table">
            <div className="mini-table-head">
              <span>DÉSIGNATION</span>
              <span>CRÉDIT</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Ajustement périmètre</span>
              <span className="item-val credit-val">- 350k</span>
            </div>
          </div>

          <div className="mini-totals-box credit-box">
            <div className="mini-total-line grand-total credit-val">
              <span>NET À DÉDUIRE</span>
              <span>- 350 000 {currency}</span>
            </div>
          </div>

          <div className="mini-payment-strip">
            <span className="mini-pay-title">Compensation comptable</span>
            <span className="mini-pay-sub">Montant déductible de la prochaine facture</span>
          </div>
        </div>
      )}

      {typeKey === 'proposal' && (
        <div className="mini-sheet-body">
          <div className="mini-editorial-badge">PROPOSITION STRATÉGIQUE</div>
          <div className="mini-editorial-title">Stratégie Digitale & Plateforme Web</div>
          <div className="mini-editorial-sub">Préparé pour : Studio Acme</div>

          <div className="mini-editorial-section">
            <div className="mini-clause-title">01. Contexte & Enjeux</div>
            <div className="mini-text-line" style={{ width: '92%' }} />
            <div className="mini-text-line" style={{ width: '78%' }} />
          </div>

          <div className="mini-editorial-section">
            <div className="mini-clause-title">02. Livrables Clés</div>
            <div className="mini-bullet-line">
              <span className="bullet-dot" />
              <span className="bullet-text">Audit & Arborescence UX</span>
            </div>
            <div className="mini-bullet-line">
              <span className="bullet-dot" />
              <span className="bullet-text">Interface Responsive & API</span>
            </div>
          </div>

          <div className="mini-proposal-pill">
            <span className="pill-lbl">Budget Estimé :</span>
            <span className="pill-val">4 500 000 {currency}</span>
          </div>

          <div className="mini-dual-sig">
            <div className="sig-side">Prestataire ✓</div>
            <div className="sig-side">Client [Visa]</div>
          </div>
        </div>
      )}

      {typeKey === 'contract' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">CONTRAT DE PRESTATION</div>
            <div className="mini-doc-date">Réf : CTR-2026-08</div>
          </div>

          <div className="mini-legal-intro">
            Entre Sparkline Desk et le Client signataire :
          </div>

          <div className="mini-legal-clauses">
            <div className="mini-legal-clause">
              <strong>Art. 1 — Objet de la mission</strong>
              <div className="mini-text-line" style={{ width: '95%' }} />
            </div>
            <div className="mini-legal-clause">
              <strong>Art. 2 — Propriété & Livrables</strong>
              <div className="mini-text-line" style={{ width: '85%' }} />
            </div>
            <div className="mini-legal-clause">
              <strong>Art. 3 — Rémunération & Clauses</strong>
              <div className="mini-text-line" style={{ width: '90%' }} />
            </div>
          </div>

          <div className="mini-dual-sig legal-dual-sig">
            <div className="sig-side">
              <span className="sig-who">Pour Sparkline</span>
              <div className="sig-box-line signed">Validé ✓</div>
            </div>
            <div className="sig-side">
              <span className="sig-who">Pour le Client</span>
              <div className="sig-box-line">Signature</div>
            </div>
          </div>
        </div>
      )}

      {typeKey === 'nda' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title nda-title">ACCORD DE CONFIDENTIALITÉ</div>
            <div className="mini-nda-stamp">CONFIDENTIEL</div>
          </div>

          <div className="mini-legal-intro">
            Accord bilatéral de protection des données (NDA)
          </div>

          <div className="mini-legal-clauses">
            <div className="mini-legal-clause">
              <strong>§ 1. Informations Protégées</strong>
              <div className="mini-text-line" style={{ width: '95%' }} />
            </div>
            <div className="mini-legal-clause">
              <strong>§ 2. Engagement de Non-Divulgation</strong>
              <div className="mini-text-line" style={{ width: '90%' }} />
            </div>
            <div className="mini-legal-clause">
              <strong>§ 3. Durée de Protection (3 ans)</strong>
              <div className="mini-text-line" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="mini-dual-sig legal-dual-sig">
            <div className="sig-side">
              <span className="sig-who">Partie Émettrice</span>
              <div className="sig-box-line signed">Scellé</div>
            </div>
            <div className="sig-side">
              <span className="sig-who">Partie Réceptrice</span>
              <div className="sig-box-line">Visa</div>
            </div>
          </div>
        </div>
      )}

      {typeKey === 'order' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">BON DE COMMANDE</div>
            <div className="mini-status-chip neutral">BDC-0027</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">FOURNISSEUR VALIDÉ</div>
            <div className="mini-client-name">Tech Solutions Pro</div>
          </div>

          <div className="mini-table">
            <div className="mini-table-head">
              <span>RÉF. ARTICLE</span>
              <span>QTÉ / P.U</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Postes Développeur Pro</span>
              <span className="item-val">x2 • 1 800k</span>
            </div>
            <div className="mini-table-row">
              <span className="item-name">Licences SaaS Annuelles</span>
              <span className="item-val">x5 • 450k</span>
            </div>
          </div>

          <div className="mini-totals-box">
            <div className="mini-total-line grand-total">
              <span>TOTAL COMMANDE</span>
              <span>2 250 000 {currency}</span>
            </div>
          </div>

          <div className="mini-signature-zone">
            <span className="mini-sig-label">Validation Service Achats</span>
            <div className="mini-sig-line">Approuvé le 24/09/2026 ✓</div>
          </div>
        </div>
      )}

      {typeKey === 'delivery' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">BON DE LIVRAISON</div>
            <div className="mini-status-chip neutral">BL-0019</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">DESTINATION DU COLIS</div>
            <div className="mini-client-name">Abidjan, Imm. Postel 2001</div>
          </div>

          <div className="mini-delivery-checklist">
            <div className="mini-checklist-item">
              <span className="check-icon">✓</span>
              <span>01. Lot Matériel informatique (Qté: 4)</span>
            </div>
            <div className="mini-checklist-item">
              <span className="check-icon">✓</span>
              <span>02. Câblage réseau Gigabit (Qté: 2)</span>
            </div>
            <div className="mini-checklist-item">
              <span className="check-icon">✓</span>
              <span>03. Documentation & Garanties</span>
            </div>
          </div>

          <div className="mini-signature-zone">
            <span className="mini-sig-label">Réception conforme & Visa client</span>
            <div className="mini-sig-line">Reçu sans réserve ✓</div>
          </div>
        </div>
      )}

      {typeKey === 'report' && (
        <div className="mini-sheet-body">
          <div className="mini-sheet-header">
            <div className="mini-doc-title">PROCÈS-VERBAL / RAPPORT</div>
            <div className="mini-status-chip neutral">PV-0012</div>
          </div>

          <div className="mini-client-card">
            <div className="mini-client-kicker">OBJET DE LA MISSION</div>
            <div className="mini-client-name">Audit de Sécurité & Mise en Production</div>
          </div>

          <div className="mini-delivery-checklist">
            <div className="mini-checklist-item">
              <span className="check-icon">•</span>
              <span>Diagnostic d&apos;infrastructure validé</span>
            </div>
            <div className="mini-checklist-item">
              <span className="check-icon">•</span>
              <span>Déploiement des correctifs (3/3)</span>
            </div>
            <div className="mini-checklist-item">
              <span className="check-icon">•</span>
              <span>Validation PV de recette client</span>
            </div>
          </div>

          <div className="mini-dual-sig">
            <div className="sig-side">Visa Consultant ✓</div>
            <div className="sig-side">Visa Client ✓</div>
          </div>
        </div>
      )}
    </div>
  );
}
