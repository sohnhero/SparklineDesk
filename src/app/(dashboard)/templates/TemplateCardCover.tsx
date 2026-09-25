'use client';

import React from 'react';
import {
  Calculator,
  Receipt,
  Coins,
  RotateCcw,
  Briefcase,
  PenLine,
  Lock,
  ShoppingBag,
  PackageCheck,
  FileCheck2,
  Check,
  CheckCircle2,
  Minus,
  Shield,
  FileText,
} from 'lucide-react';
import { DocTypeKey, DocumentKind } from '@/domains/documents/types';

interface TemplateCardCoverProps {
  typeKey: DocTypeKey;
  label: string;
  prefix?: string;
  kind?: DocumentKind;
}

interface CustomCoverData {
  categoryLabel: string;
  prefix: string;
  icon: React.ReactNode;
  title: string;
  subtext: string;
  pillTag: string;
  visualGraphic: React.ReactNode;
}

function getCoverData(typeKey: DocTypeKey, defaultPrefix?: string): CustomCoverData {
  switch (typeKey) {
    case 'quote':
      return {
        categoryLabel: 'Facturation & Devis',
        prefix: defaultPrefix || 'DEV',
        icon: <Calculator size={16} strokeWidth={2.2} />,
        title: 'Devis Estimatif',
        subtext: 'Chiffrage & Conditions',
        pillTag: 'Validité 30 jours',
        visualGraphic: (
          <div className="sober-schematic-bar-wrap">
            <div className="sober-schematic-bar">
              <span className="sober-bar-fill" style={{ width: '65%' }} />
            </div>
            <span className="sober-schematic-val">Offre détaillée HT / TTC</span>
          </div>
        ),
      };
    case 'invoice':
      return {
        categoryLabel: 'Facturation & Vente',
        prefix: defaultPrefix || 'FAC',
        icon: <Receipt size={16} strokeWidth={2.2} />,
        title: 'Facture de Vente',
        subtext: 'Prestations & TVA',
        pillTag: 'Échéance à 30 jours',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <Check size={9} strokeWidth={3} />
              <span>À régler</span>
            </span>
            <span className="sober-schematic-val">Net à payer • Reçu</span>
          </div>
        ),
      };
    case 'deposit':
      return {
        categoryLabel: 'Facturation d’Acompte',
        prefix: defaultPrefix || 'ACP',
        icon: <Coins size={16} strokeWidth={2.2} />,
        title: 'Facture d’Acompte',
        subtext: 'Démarrage de mission',
        pillTag: 'Acompte 30% / 50%',
        visualGraphic: (
          <div className="sober-schematic-bar-wrap">
            <div className="sober-schematic-bar">
              <span className="sober-bar-fill" style={{ width: '50%' }} />
            </div>
            <span className="sober-schematic-val">50% Exigible • Solde fin</span>
          </div>
        ),
      };
    case 'credit':
      return {
        categoryLabel: 'Avoir Commercial',
        prefix: defaultPrefix || 'AVO',
        icon: <RotateCcw size={16} strokeWidth={2.2} />,
        title: 'Avoir sur Facture',
        subtext: 'Régularisation',
        pillTag: 'Déduction comptable',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <Minus size={9} strokeWidth={3} />
              <span>Avoir</span>
            </span>
            <span className="sober-schematic-val">Compensation de facture</span>
          </div>
        ),
      };
    case 'proposal':
      return {
        categoryLabel: 'Juridique & Stratégie',
        prefix: defaultPrefix || 'PROP',
        icon: <Briefcase size={16} strokeWidth={2.2} />,
        title: 'Proposition Commerciale',
        subtext: 'Pitch & Scope',
        pillTag: 'Roadmap & Livrables',
        visualGraphic: (
          <div className="sober-schematic-dots-row">
            <span className="sober-dot-step active" />
            <span className="sober-dot-line" />
            <span className="sober-dot-step active" />
            <span className="sober-dot-line" />
            <span className="sober-dot-step" />
            <span className="sober-schematic-val" style={{ marginLeft: '4px' }}>3 phases</span>
          </div>
        ),
      };
    case 'contract':
      return {
        categoryLabel: 'Juridique & Accords',
        prefix: defaultPrefix || 'CTR',
        icon: <PenLine size={16} strokeWidth={2.2} />,
        title: 'Contrat de Prestation',
        subtext: 'Clauses & Obligations',
        pillTag: 'Accord bilatéral',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <CheckCircle2 size={9} strokeWidth={2.5} />
              <span>Clauses</span>
            </span>
            <span className="sober-schematic-val">Cadre légal & Signature</span>
          </div>
        ),
      };
    case 'nda':
      return {
        categoryLabel: 'Confidentialité',
        prefix: defaultPrefix || 'NDA',
        icon: <Lock size={16} strokeWidth={2.2} />,
        title: 'Accord Confidentialité',
        subtext: 'Secret d’affaires & PI',
        pillTag: 'Protection bilatérale',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <Shield size={9} strokeWidth={2.5} />
              <span>Secret</span>
            </span>
            <span className="sober-schematic-val">Propriété intellectuelle</span>
          </div>
        ),
      };
    case 'order':
      return {
        categoryLabel: 'Opérations & Achats',
        prefix: defaultPrefix || 'BDC',
        icon: <ShoppingBag size={16} strokeWidth={2.2} />,
        title: 'Bon de Commande',
        subtext: 'Fournisseur & Réf.',
        pillTag: 'Validation d’achats',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <Check size={9} strokeWidth={3} />
              <span>Validé</span>
            </span>
            <span className="sober-schematic-val">Bordereau fournisseur</span>
          </div>
        ),
      };
    case 'delivery':
      return {
        categoryLabel: 'Opérations & Suivi',
        prefix: defaultPrefix || 'BL',
        icon: <PackageCheck size={16} strokeWidth={2.2} />,
        title: 'Bon de Livraison',
        subtext: 'Réception colis',
        pillTag: 'Conformité colis',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <CheckCircle2 size={9} strokeWidth={2.5} />
              <span>Conforme</span>
            </span>
            <span className="sober-schematic-val">Signature réception</span>
          </div>
        ),
      };
    case 'report':
    default:
      return {
        categoryLabel: 'Opérations & PV',
        prefix: defaultPrefix || 'PV',
        icon: <FileCheck2 size={16} strokeWidth={2.2} />,
        title: 'Compte Rendu / PV',
        subtext: 'Synthèse de réunion',
        pillTag: 'Relevé des décisions',
        visualGraphic: (
          <div className="sober-schematic-badge-row">
            <span className="sober-mini-tag">
              <Check size={9} strokeWidth={3} />
              <span>Adopté</span>
            </span>
            <span className="sober-schematic-val">Quorum & Décisions</span>
          </div>
        ),
      };
  }
}

export function TemplateCardCover({ typeKey, label, prefix }: TemplateCardCoverProps) {
  const data = getCoverData(typeKey, prefix);

  return (
    <div className={`template-sober-cover cover-type-${typeKey}`}>
      {/* Background Subtle Tech Dot Matrix */}
      <div className="cover-tech-pattern" />

      {/* Top Header: Category kicker on left, Monogram pill on right */}
      <div className="sober-cover-top">
        <div className="sober-category-kicker">
          <span className="sober-dot" />
          <span>{data.categoryLabel}</span>
        </div>
        <span className="sober-monogram-pill">
          {data.prefix}
        </span>
      </div>

      {/* Centered Elevated Mini Card */}
      <div className="sober-center-card">
        <div className="sober-icon-tile">
          {data.icon}
        </div>
        <div className="sober-center-info">
          <div className="sober-center-title">{data.title}</div>
          <div className="sober-center-sub">{data.subtext}</div>
          {data.visualGraphic}
        </div>
      </div>

      {/* Bottom Footer Row: Pill tag on left, Brand on right */}
      <div className="sober-cover-bottom">
        <span className="sober-tag-pill">{data.pillTag}</span>
        <span className="sober-sparkline-mark">Sparkline Desk</span>
      </div>
    </div>
  );
}
