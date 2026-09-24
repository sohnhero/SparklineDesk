import { PrismaClient, Role, ClientType, DocumentType, DocumentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sparkline Desk database seed...');

  // 1. Clean existing records if any
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.documentSection.deleteMany();
  await prisma.documentLine.deleteMany();
  await prisma.document.deleteMany();
  await prisma.template.deleteMany();
  await prisma.serviceCatalogItem.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // 2. Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Sparkline Studio',
      legalName: 'Sparkline — Digital Solutions',
      email: 'sparkline221@gmail.com',
      phone: '+221 78 942 24 23',
      website: 'www.sparkline.sn',
      address: 'Dakar, Sénégal',
      city: 'Dakar',
      country: 'Sénégal',
      currency: 'FCFA',
      taxRate: 0.0,
      quoteValidityDays: 30,
      paymentTerms: '50% à la signature, solde avant livraison',
      footerNote: 'Concevoir la nouvelle ère du numérique.',
      logoDarkUrl: '/assets/sparkline-logo-dark.svg',
      logoLightUrl: '/assets/sparkline-logo-white.svg',
      symbolUrl: '/assets/sparkline-symbol.svg',
    },
  });

  // 3. Create Admin User
  const passwordHash = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.create({
    data: {
      organizationId: org.id,
      name: 'Sparkline Studio',
      email: 'admin@sparkline.sn',
      passwordHash,
      role: Role.OWNER,
    },
  });

  // 4. Create Clients
  const fidele = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: 'FIDÈLE SARL',
      sector: 'BTP & Ingénierie',
      contactName: 'Directeur Général',
      email: 'contact@fidele-btp.sn',
      phone: '+221 77 123 45 67',
      address: 'Dakar, Sénégal',
      city: 'Dakar',
      country: 'Sénégal',
      type: ClientType.CLIENT,
      notes: 'Client communication & présence digitale.',
      tags: ['BTP', 'Communication', 'Prioritaire'],
    },
  });

  const baraka = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: 'Baraka',
      sector: 'E-commerce & High-Tech',
      contactName: 'Responsable Opérations',
      email: 'hello@baraka-store.com',
      phone: '+221 78 234 56 78',
      address: 'Dakar, Sénégal',
      city: 'Dakar',
      country: 'Sénégal',
      type: ClientType.CLIENT,
      tags: ['E-commerce', 'Plateforme'],
    },
  });

  const mbor = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: 'MBOR Store',
      sector: 'Retail & Sportswear',
      contactName: 'Gérant',
      email: 'shop@mbor-sport.sn',
      phone: '+221 76 345 67 89',
      address: 'Dakar, Sénégal',
      city: 'Dakar',
      country: 'Sénégal',
      type: ClientType.CLIENT,
      tags: ['Retail', 'Maintenance'],
    },
  });

  // 5. Create Documents
  // Doc 1: Quote for FIDELE SARL
  const docQuote = await prisma.document.create({
    data: {
      organizationId: org.id,
      clientId: fidele.id,
      type: DocumentType.QUOTE,
      reference: '2026-FIDELE-001',
      title: 'Communication & Réseaux Sociaux',
      intro: 'Prestations proposées pour renforcer la présence digitale de FIDÈLE SARL.',
      status: DocumentStatus.SENT,
      issueDate: new Date('2026-09-05T10:00:00Z'),
      validityDays: 30,
      currency: 'FCFA',
      taxRate: 0.0,
      discountPercent: 0.0,
      depositAmount: 0.0,
      conditions: `Contrat Réseaux : 3 mois renouvelable par tacite reconduction\nDélai shooting : à convenir conjointement\nLancement réseaux : 5 jours ouvrables après signature\nPaiement : 50% acompte à la signature, solde avant livraison`,
      notes: '',
      createdById: adminUser.id,
      options: { showSignature: true, showTax: false, coverPage: false },
      lines: {
        create: [
          {
            position: 0,
            name: 'Séance Shooting Professionnel',
            description: 'Photos professionnelles sur le terrain + 3 vidéos de présentation des services (retouche et édition incluses)',
            quantity: 1,
            unitPrice: 80000,
          },
          {
            position: 1,
            name: 'Gestion Réseaux Sociaux',
            description: 'Création pages • Production contenu (12–15 posts) • Stories • Suivi engagement • Rapports mensuels — engagement initial 3 mois',
            quantity: 3,
            unitPrice: 100000,
          },
        ],
      },
    },
  });

  // Doc 2: Proposal for FIDELE SARL
  await prisma.document.create({
    data: {
      organizationId: org.id,
      clientId: fidele.id,
      type: DocumentType.PROPOSAL,
      reference: 'PROP-2026-FIDELE-001',
      title: 'Offre Défi — Communication & Réseaux Sociaux',
      intro: 'Fidèle SARL souhaite renforcer sa présence digitale et sa visibilité auprès de ses clients. Cette proposition combine contenu visuel professionnel et stratégie de présence en ligne.',
      status: DocumentStatus.ACCEPTED,
      issueDate: new Date('2026-09-05T09:00:00Z'),
      validityDays: 30,
      currency: 'FCFA',
      taxRate: 0.0,
      discountPercent: 0.0,
      depositAmount: 0.0,
      conditions: '',
      notes: 'Nous restons à votre disposition pour tout ajustement.',
      createdById: adminUser.id,
      options: { showSignature: true, showTax: false, coverPage: true },
      sections: {
        create: [
          {
            position: 0,
            title: 'Objectif',
            content: 'Créer une présence digitale professionnelle et attractive pour Fidèle SARL : valoriser les réalisations et services terrain, animer les réseaux sociaux de manière stratégique et transformer la visibilité en opportunités commerciales.',
          },
          {
            position: 1,
            title: 'Offre 1 — Séance Shooting Professionnel',
            content: `- Shooting photos d’au moins ½ journée sur le terrain\n- Capture des équipes et chantiers en situation réelle\n- Production de 3 vidéos de présentation (30–60 sec)\n- Retouche et édition professionnelle\n- Livraison des fichiers HD prêts pour les réseaux sociaux\n\nBudget : 80 000 FCFA`,
          },
          {
            position: 2,
            title: 'Offre 2 — Gestion Réseaux Sociaux',
            content: `- Création et configuration des pages professionnelles\n- Identité visuelle cohérente\n- 12–15 posts par mois\n- Stories 3–4 fois par semaine\n- Réponse aux commentaires et messages\n- Analytics, engagement et rapport mensuel\n\nBudget : 100 000 FCFA / mois — engagement initial 3 mois`,
          },
          {
            position: 3,
            title: 'Bonus inclus',
            content: `- Consultation stratégique initiale\n- Plan de contenu adapté au secteur\n- Support et conseils techniques\n- Accompagnement à la transition du site vers les réseaux`,
          },
          {
            position: 4,
            title: 'Conditions particulières',
            content: `- Engagement initial de 3 mois renouvelable\n- Résiliation avec préavis écrit\n- Shooting planifié après signature\n- 50% d’acompte à la signature, solde avant livraison`,
          },
        ],
      },
    },
  });

  // Doc 3: Invoice for Baraka (Paid)
  const invoiceBaraka = await prisma.document.create({
    data: {
      organizationId: org.id,
      clientId: baraka.id,
      type: DocumentType.INVOICE,
      reference: 'FAC-2026-009',
      title: 'Conception & développement plateforme',
      intro: 'Facturation du lot livré et validé.',
      status: DocumentStatus.PAID,
      issueDate: new Date('2026-09-10T12:00:00Z'),
      dueDate: new Date('2026-09-20T12:00:00Z'),
      currency: 'FCFA',
      taxRate: 0.0,
      discountPercent: 0.0,
      depositAmount: 0.0,
      conditions: 'Paiement par virement ou Wave/Orange Money.',
      notes: '',
      createdById: adminUser.id,
      options: { showSignature: false, showTax: false, coverPage: false },
      lines: {
        create: [
          {
            position: 0,
            name: 'Développement interface web',
            description: 'Lot UI/UX & intégration front-end',
            quantity: 1,
            unitPrice: 450000,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: 450000,
            paidAt: new Date('2026-09-20T12:00:00Z'),
            method: 'Virement bancaire',
            reference: 'VIR-2026-0920-BARAKA',
            note: 'Règlement intégral facture FAC-2026-009',
            createdById: adminUser.id,
          },
        ],
      },
    },
  });

  // Doc 4: Invoice for MBOR Store (Sent / pending)
  await prisma.document.create({
    data: {
      organizationId: org.id,
      clientId: mbor.id,
      type: DocumentType.INVOICE,
      reference: 'FAC-2026-010',
      title: 'Maintenance & optimisation',
      intro: 'Maintenance applicative et optimisation des performances.',
      status: DocumentStatus.SENT,
      issueDate: new Date('2026-09-18T08:30:00Z'),
      dueDate: new Date('2026-09-30T08:30:00Z'),
      currency: 'FCFA',
      taxRate: 0.0,
      discountPercent: 0.0,
      depositAmount: 0.0,
      conditions: 'Paiement à réception.',
      notes: '',
      createdById: adminUser.id,
      options: { showSignature: false, showTax: false, coverPage: false },
      lines: {
        create: [
          {
            position: 0,
            name: 'Forfait maintenance',
            description: 'Correctifs, suivi et optimisation',
            quantity: 1,
            unitPrice: 250000,
          },
        ],
      },
    },
  });

  // 6. Service Catalog
  const catalog = [
    { name: 'Séance Shooting Professionnel', category: 'Contenus & Motion Design', description: 'Photos sur le terrain + 3 vidéos de présentation des services (retouche et édition incluses)', price: 80000, unit: 'séance' },
    { name: 'Gestion Réseaux Sociaux (1 mois)', category: 'Contenus & Motion Design', description: 'Création pages, 12-15 posts, stories, modération et rapport mensuel', price: 100000, unit: 'mois' },
    { name: 'Développement Interface Web & Dashboard', category: 'Développement & Architecture', description: 'Intégration front-end moderne Next.js / TypeScript, responsive et performante', price: 450000, unit: 'lot' },
    { name: 'Architecture Cloud & Déploiement', category: 'Développement & Architecture', description: 'Configuration serveurs, bases PostgreSQL, Docker, CI/CD et sécurisation', price: 350000, unit: 'mission' },
    { name: 'Design Système & Prototype Figma UI/UX', category: 'Expérience Utilisateur', description: 'Recherche utilisateur, wireframes, design system sur-mesure et maquettes interactives', price: 300000, unit: 'projet' },
    { name: 'Stratégie & Identité Visuelle', category: 'Stratégie & Identité', description: 'Charte graphique, logotype, typographie, palette chromatique et templates', price: 250000, unit: 'pack' },
  ];

  for (const item of catalog) {
    await prisma.serviceCatalogItem.create({
      data: {
        organizationId: org.id,
        name: item.name,
        category: item.category,
        description: item.description,
        price: item.price,
        unit: item.unit,
        isActive: true,
      },
    });
  }

  // 7. System Templates
  const templates = [
    { type: DocumentType.QUOTE, name: 'Devis Standard Sparkline', description: 'Chiffrage détaillé, validité, conditions et signature.' },
    { type: DocumentType.INVOICE, name: 'Facture de Prestation', description: 'Facturation client, échéance et suivi du paiement.' },
    { type: DocumentType.DEPOSIT, name: "Facture d'acompte 50%", description: "Demande d'acompte avant démarrage de mission." },
    { type: DocumentType.CREDIT, name: 'Avoir sur Facture', description: 'Correction ou annulation partielle d’une facture.' },
    { type: DocumentType.PROPOSAL, name: 'Proposition Commerciale Sparkline', description: 'Offre structurée : contexte, objectifs, périmètre, budget.' },
    { type: DocumentType.CONTRACT, name: 'Contrat de Prestation', description: 'Cadre de collaboration, obligations et modalités.' },
    { type: DocumentType.NDA, name: 'Accord de Confidentialité (NDA)', description: 'NDA simple pour protéger les informations échangées.' },
    { type: DocumentType.ORDER, name: 'Bon de Commande', description: 'Commande formalisée avec lignes et montant total.' },
    { type: DocumentType.DELIVERY, name: 'Bon de Livraison', description: 'Récapitulatif des livrables remis au client.' },
    { type: DocumentType.REPORT, name: 'Compte Rendu / PV Réunion', description: 'Décisions, actions, responsables et échéances.' },
  ];

  for (const t of templates) {
    await prisma.template.create({
      data: {
        organizationId: org.id,
        type: t.type,
        name: t.name,
        description: t.description,
        isDefault: true,
        structure: {
          title: t.name,
          defaultTerms: org.paymentTerms,
        },
      },
    });
  }

  console.log('✅ Sparkline Desk seed successfully completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
