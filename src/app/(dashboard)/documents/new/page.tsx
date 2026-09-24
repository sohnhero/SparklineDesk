import { redirect } from 'next/navigation';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentType, DocumentStatus } from '@prisma/client';
import {
  TYPE_META,
  KEY_TO_ENUM,
  DocTypeKey,
} from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

function getDefaultTitle(type: DocTypeKey): string {
  const map: Record<DocTypeKey, string> = {
    quote: 'Proposition de services',
    invoice: 'Facture de prestations',
    deposit: "Acompte de démarrage",
    credit: 'Avoir sur facture',
    proposal: 'Proposition commerciale',
    contract: 'Contrat de prestation de services',
    nda: 'Accord de confidentialité',
    order: 'Bon de commande',
    delivery: 'Bon de livraison',
    report: 'Compte rendu de réunion',
  };
  return map[type] || TYPE_META[type].label;
}

function getDefaultIntro(type: DocTypeKey): string {
  const map: Record<DocTypeKey, string> = {
    quote:
      'Nous vous proposons les prestations suivantes, adaptées à vos objectifs et à votre contexte.',
    invoice:
      'Veuillez trouver ci-dessous le détail des prestations facturées.',
    proposal:
      'Une proposition conçue pour répondre à vos enjeux avec une approche claire, structurée et orientée impact.',
    contract:
      'Le présent document définit le cadre de la collaboration entre Sparkline et le client.',
    nda:
      'Le présent accord définit les règles de confidentialité applicables aux informations partagées.',
    order: 'Commande formalisée pour exécution.',
    delivery: 'Bordereau de livraison des prestations convenues.',
    report: 'Ce document synthétise les échanges, décisions et prochaines actions.',
    deposit: "Demande d'acompte avant démarrage des prestations.",
    credit: 'Avoir émis en régularisation.',
  };
  return map[type] || '';
}

function getDefaultSections(type: DocTypeKey): Array<{ title: string; content: string }> {
  if (type === 'contract') {
    return [
      { title: 'Objet du contrat', content: 'Décrire la mission, son périmètre et les livrables attendus.' },
      { title: 'Modalités d’exécution', content: '- Calendrier et jalons\n- Responsabilités des parties\n- Processus de validation' },
      { title: 'Conditions financières', content: 'Préciser le montant, les échéances et le mode de paiement.' },
      { title: 'Propriété & confidentialité', content: 'Préciser les règles applicables aux livrables, données et actifs transmis.' },
    ];
  }
  if (type === 'nda') {
    return [
      { title: 'Informations confidentielles', content: 'Définir les informations couvertes par le présent accord.' },
      { title: 'Obligations des parties', content: '- Ne pas divulguer les informations confidentielles\n- Limiter les accès aux seules personnes autorisées\n- Protéger les documents et données reçus' },
      { title: 'Durée', content: 'Préciser la durée de l’obligation de confidentialité.' },
    ];
  }
  if (type === 'report') {
    return [
      { title: 'Contexte & participants', content: 'Date, objet de la réunion et personnes présentes.' },
      { title: 'Points abordés', content: '- Point 1\n- Point 2\n- Point 3' },
      { title: 'Décisions', content: '- Décision 1\n- Décision 2' },
      { title: 'Plan d’action', content: '- Action — Responsable — Échéance' },
    ];
  }
  return [
    { title: 'Contexte', content: 'Décrivez ici le contexte du client, le besoin exprimé et l’opportunité.' },
    { title: 'Objectifs', content: '- Objectif principal\n- Résultat attendu\n- Indicateur de réussite' },
    { title: 'Approche & périmètre', content: 'Présentez votre approche, les étapes et les livrables.' },
    { title: 'Budget & modalités', content: 'Précisez l’investissement, le calendrier et les conditions de paiement.' },
    { title: 'Prochaines étapes', content: 'Validation de la proposition, lancement et cadrage opérationnel.' },
  ];
}

export default async function NewDocumentPage({
  searchParams,
}: {
  searchParams: { type?: string; clientId?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const typeKey = (searchParams.type?.toLowerCase() as DocTypeKey) || 'quote';
  const meta = TYPE_META[typeKey] || TYPE_META.quote;
  const enumType = (KEY_TO_ENUM[typeKey] || 'QUOTE') as DocumentType;

  // Find or use default client
  let targetClientId = searchParams.clientId;
  if (!targetClientId) {
    const firstClient = await prisma.client.findFirst({
      where: { organizationId: user.organizationId, archivedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    targetClientId = firstClient?.id;
  }

  if (!targetClientId) {
    // If no client exists, create one
    const newClient = await prisma.client.create({
      data: {
        organizationId: user.organizationId,
        name: 'Client Exemple',
        sector: 'Services',
        address: 'Dakar, Sénégal',
      },
    });
    targetClientId = newClient.id;
  }

  // Generate reference
  const year = new Date().getFullYear();
  const count = await prisma.document.count({
    where: {
      organizationId: user.organizationId,
      type: enumType,
      reference: { contains: String(year) },
    },
  });
  const sequence = count + 1;
  const reference = `${meta.prefix}-${year}-${String(sequence).padStart(3, '0')}`;

  const isFinancial = meta.kind === 'financial';
  const org = await prisma.organization.findUnique({
    where: { id: user.organizationId },
  });

  const dueDate =
    typeKey === 'invoice' || typeKey === 'deposit'
      ? new Date(Date.now() + 15 * 86400000)
      : null;

  const doc = await prisma.document.create({
    data: {
      organizationId: user.organizationId,
      clientId: targetClientId,
      type: enumType,
      reference,
      title: getDefaultTitle(typeKey),
      intro: getDefaultIntro(typeKey),
      status: DocumentStatus.DRAFT,
      issueDate: new Date(),
      dueDate,
      validityDays: typeKey === 'quote' ? org?.quoteValidityDays || 30 : null,
      currency: org?.currency || 'FCFA',
      taxRate: org?.taxRate || 0,
      discountPercent: 0,
      depositAmount: 0,
      conditions: org?.paymentTerms || '',
      notes: '',
      createdById: user.id,
      options: {
        showSignature: true,
        showTax: Number(org?.taxRate || 0) > 0,
        coverPage: typeKey === 'proposal',
      },
      lines: {
        create: isFinancial
          ? [
              {
                position: 0,
                name: 'Prestation',
                description: 'Description de la prestation ou du livrable',
                quantity: 1,
                unitPrice: 0,
              },
            ]
          : [],
      },
      sections: {
        create: !isFinancial
          ? getDefaultSections(typeKey).map((s, idx) => ({
              position: idx,
              title: s.title,
              content: s.content,
              sectionType: 'standard',
            }))
          : [],
      },
    },
  });

  redirect(`/documents/${doc.id}`);
}
