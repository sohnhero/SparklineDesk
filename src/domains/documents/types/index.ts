export type DocumentKind = 'financial' | 'proposal';

export type DocTypeKey =
  | 'quote'
  | 'invoice'
  | 'deposit'
  | 'credit'
  | 'proposal'
  | 'contract'
  | 'nda'
  | 'order'
  | 'delivery'
  | 'report';

export type DocStatusKey =
  | 'Brouillon'
  | 'Envoyé'
  | 'Accepté'
  | 'Payé'
  | 'Refusé'
  | 'Expiré'
  | 'Annulé';

export interface TypeMetaItem {
  key: DocTypeKey;
  enumType: string;
  label: string;
  icon: string;
  prefix: string;
  kind: DocumentKind;
  description: string;
}

export const TYPE_META: Record<DocTypeKey, TypeMetaItem> = {
  quote: { key: 'quote', enumType: 'QUOTE', label: 'Devis', icon: 'DV', prefix: 'DEV', kind: 'financial', description: 'Chiffrage détaillé, validité, conditions et signature.' },
  invoice: { key: 'invoice', enumType: 'INVOICE', label: 'Facture', icon: 'FA', prefix: 'FAC', kind: 'financial', description: 'Facturation client, échéance et suivi du paiement.' },
  deposit: { key: 'deposit', enumType: 'DEPOSIT', label: "Facture d'acompte", icon: 'AC', prefix: 'ACP', kind: 'financial', description: "Demande d'acompte avant démarrage de mission." },
  credit: { key: 'credit', enumType: 'CREDIT', label: 'Avoir', icon: 'AV', prefix: 'AVO', kind: 'financial', description: 'Correction ou annulation partielle d’une facture.' },
  proposal: { key: 'proposal', enumType: 'PROPOSAL', label: 'Proposition commerciale', icon: 'PC', prefix: 'PROP', kind: 'proposal', description: 'Offre structurée : contexte, objectifs, périmètre, budget.' },
  contract: { key: 'contract', enumType: 'CONTRACT', label: 'Contrat de prestation', icon: 'CT', prefix: 'CTR', kind: 'proposal', description: 'Cadre de collaboration, obligations et modalités.' },
  nda: { key: 'nda', enumType: 'NDA', label: 'Accord de confidentialité', icon: 'NC', prefix: 'NDA', kind: 'proposal', description: 'NDA simple pour protéger les informations échangées.' },
  order: { key: 'order', enumType: 'ORDER', label: 'Bon de commande', icon: 'BC', prefix: 'BDC', kind: 'financial', description: 'Commande formalisée avec lignes et montant total.' },
  delivery: { key: 'delivery', enumType: 'DELIVERY', label: 'Bon de livraison', icon: 'BL', prefix: 'BL', kind: 'financial', description: 'Récapitulatif des livrables remis au client.' },
  report: { key: 'report', enumType: 'REPORT', label: 'Compte rendu / PV', icon: 'PV', prefix: 'PV', kind: 'proposal', description: 'Décisions, actions, responsables et échéances.' },
};

export const ENUM_TO_KEY: Record<string, DocTypeKey> = {
  QUOTE: 'quote',
  INVOICE: 'invoice',
  DEPOSIT: 'deposit',
  CREDIT: 'credit',
  PROPOSAL: 'proposal',
  CONTRACT: 'contract',
  NDA: 'nda',
  ORDER: 'order',
  DELIVERY: 'delivery',
  REPORT: 'report',
};

export const KEY_TO_ENUM: Record<DocTypeKey, string> = {
  quote: 'QUOTE',
  invoice: 'INVOICE',
  deposit: 'DEPOSIT',
  credit: 'CREDIT',
  proposal: 'PROPOSAL',
  contract: 'CONTRACT',
  nda: 'NDA',
  order: 'ORDER',
  delivery: 'DELIVERY',
  report: 'REPORT',
};

export const STATUS_MAP: Record<string, string> = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyé',
  ACCEPTED: 'Accepté',
  PAID: 'Payé',
  REJECTED: 'Refusé',
  EXPIRED: 'Expiré',
  CANCELLED: 'Annulé',
};

export const STATUS_TO_ENUM: Record<string, string> = {
  Brouillon: 'DRAFT',
  Envoyé: 'SENT',
  Accepté: 'ACCEPTED',
  Payé: 'PAID',
  Refusé: 'REJECTED',
  Expiré: 'EXPIRED',
  Annulé: 'CANCELLED',
};

export interface DocumentLineData {
  id?: string;
  name: string;
  description: string;
  qty: number;
  price: number;
  taxRate?: number;
}

export interface DocumentSectionData {
  id?: string;
  title: string;
  content: string;
  sectionType?: string;
}

export interface DocumentOptionsData {
  showSignature?: boolean;
  showTax?: boolean;
  coverPage?: boolean;
}

export interface DocumentFullData {
  id: string;
  organizationId: string;
  clientId: string;
  type: DocTypeKey;
  reference: string;
  title: string;
  intro?: string;
  status: DocStatusKey;
  issueDate: string;
  dueDate?: string;
  validityDays?: number;
  currency: string;
  taxRate: number;
  discountPercent: number;
  depositAmount: number;
  conditions?: string;
  notes?: string;
  templateId?: string;
  options: DocumentOptionsData;
  lines: DocumentLineData[];
  sections: DocumentSectionData[];
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    sector?: string | null;
    contactName?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
  } | null;
}
