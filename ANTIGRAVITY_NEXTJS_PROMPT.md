# PROMPT ANTIGRAVITY — MIGRATION PIXEL PERFECT DE SPARKLINE DESK VERS NEXT.JS

Tu es un lead engineer full-stack senior et un product designer expert des SaaS B2B premium. Tu dois transformer le prototype HTML/CSS/JS fourni dans ce repository en une application Next.js production-ready, robuste, maintenable, sécurisée et pixel perfect, sans dégrader le rendu visuel actuel.

## 0. RÈGLE ABSOLUE : NE PAS REDESIGNER

Le prototype actuel est la référence visuelle. Commence par l'auditer et le lancer. Capture mentalement/techniquement chaque écran, espacement, grille, taille, bordure, rayon, contraste, état hover, responsive, hiérarchie, typographie, panneau d'édition et rendu A4.

Tu dois :
- conserver exactement la direction artistique noir / blanc / orange de Sparkline ;
- réutiliser les logos/assets présents dans `/assets` ;
- préserver la structure générale, les proportions et l'expérience visuelle ;
- ne pas remplacer l'interface par un dashboard générique de template SaaS ;
- ne pas ajouter de gradients inutiles, d'effets glassmorphism excessifs ou d'éléments décoratifs non présents ;
- ne pas supprimer de fonctionnalité existante ;
- ne pas simplifier le prototype sous prétexte de migration ;
- améliorer uniquement les détails invisibles ou clairement nécessaires : accessibilité, architecture, performances, sécurité, UX d'erreur, robustesse et micro-interactions cohérentes.

Avant toute modification : analyse `index.html`, `styles.css`, `app.js`, tous les assets et le README. Dresse mentalement la cartographie des composants, états et données. Ensuite migre progressivement en garantissant l'absence de régression visuelle.

---

## 1. OBJECTIF PRODUIT

Nom du produit : **Sparkline Desk**.

C'est l'outil interne de Sparkline pour centraliser tout le cycle documentaire d'une startup / agence tech :
- clients ;
- prospects ;
- propositions commerciales ;
- devis ;
- factures ;
- factures d'acompte ;
- avoirs ;
- contrats de prestation ;
- NDA ;
- bons de commande ;
- bons de livraison ;
- comptes rendus / PV ;
- modèles ;
- suivi des statuts ;
- finance / encaissements ;
- génération de PDF ;
- partage et envoi ;
- historique des versions ;
- paramètres de l'entreprise.

Le principe UX est : **ne jamais repartir de zéro**. L'utilisateur choisit un modèle, sélectionne un client, adapte uniquement les particularités de la mission, prévisualise en temps réel puis exporte/envoie.

Le produit doit être utilisable réellement par l'équipe Sparkline en production, pas être une simple démo.

---

## 2. STACK TECHNIQUE CIBLE

Utilise une architecture moderne Next.js avec App Router et TypeScript strict.

Préférences :
- Next.js App Router ;
- TypeScript strict ;
- React Server Components par défaut, Client Components uniquement lorsque nécessaire ;
- PostgreSQL ;
- Prisma ORM ou Drizzle ORM, choisis une seule solution et applique-la proprement ;
- Auth.js / solution d'authentification mature compatible Next.js ;
- Zod pour validation serveur et client ;
- React Hook Form pour les formulaires complexes ;
- Server Actions ou Route Handlers selon le cas d'usage ;
- stockage de fichiers compatible S3 / Cloudflare R2 / Vercel Blob via une abstraction de provider ;
- génération PDF serveur fiable à partir d'un composant document dédié ;
- e-mails transactionnels via une abstraction `MailProvider` ;
- tests unitaires + tests d'intégration + Playwright pour les parcours critiques ;
- ESLint + Prettier ;
- pas de `any` non justifié ;
- pas de logique métier critique uniquement côté client.

Ne mets aucun secret dans le code source. Utilise `.env.example`.

---

## 3. ARCHITECTURE À METTRE EN PLACE

Structure claire par domaine, pas un gigantesque dossier `components` fourre-tout.

Exemple d'organisation souhaitée :

```text
src/
  app/
    (auth)/
    (dashboard)/
      dashboard/
      documents/
      clients/
      templates/
      finance/
      settings/
    api/
  domains/
    documents/
      components/
      server/
      schemas/
      services/
      templates/
      types/
    clients/
    finance/
    organization/
    users/
  components/
    ui/
    layout/
  lib/
    db/
    auth/
    pdf/
    mail/
    storage/
    security/
    utils/
  styles/
```

Les composants documentaires A4 doivent être distincts des formulaires d'édition. Le rendu d'un PDF ne doit pas dépendre du DOM du dashboard.

---

## 4. DESIGN SYSTEM SPARKLINE

Extrais les tokens du CSS existant dans un design system propre :
- couleurs ;
- espacements ;
- typographie ;
- radius ;
- ombres ;
- border colors ;
- breakpoints ;
- z-index ;
- tailles de composants.

Conserve comme couleur d'accent principale l'orange Sparkline du prototype. Le noir profond, le blanc, les gris neutres et l'orange doivent rester dominants.

Crée des composants UI internes cohérents :
- Button ;
- IconButton ;
- Input ;
- Textarea ;
- Select ;
- Badge ;
- StatusBadge ;
- Modal/Dialog ;
- Drawer ;
- Table/DataTable ;
- EmptyState ;
- Toast ;
- ConfirmDialog ;
- StatCard ;
- SearchField ;
- Switch ;
- Tabs ;
- Skeleton ;
- ErrorState.

Tous les états doivent exister : default, hover, focus-visible, active, disabled, loading, error.

Accessibilité : navigation clavier, labels, aria, contrastes, focus visible, dialogs accessibles.

---

## 5. AUTHENTIFICATION & ORGANISATION

L'application est multi-utilisateur pour Sparkline.

Implémente :
- connexion sécurisée ;
- déconnexion ;
- reset password si le provider le permet ;
- organisation `Sparkline` ;
- rôles minimum : `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` ;
- contrôles d'autorisation côté serveur ;
- sessions sécurisées ;
- audit des actions sensibles.

Permissions proposées :
- OWNER : tout ;
- ADMIN : clients, documents, modèles, finance, paramètres non critiques ;
- MEMBER : clients et documents ;
- VIEWER : lecture uniquement.

Ne te contente jamais de masquer un bouton côté UI : protège les mutations côté serveur.

---

## 6. MODÈLE DE DONNÉES

Conçois un schéma relationnel normalisé avec au minimum :

### Organization
- id
- name
- legalName
- email
- phone
- website
- address
- city
- country
- currency
- taxRate
- quoteValidityDays
- paymentTerms
- logoDarkUrl
- logoLightUrl
- symbolUrl
- createdAt
- updatedAt

### User
- id
- name
- email
- role
- organizationId
- createdAt
- updatedAt

### Client
- id
- organizationId
- type: PROSPECT | CLIENT | PARTNER
- name
- sector
- contactName
- email
- phone
- address
- city
- country
- taxId / NINEA (optionnel)
- notes
- tags
- archivedAt
- createdAt
- updatedAt

### Document
- id UUID
- organizationId
- clientId
- type enum
- reference unique par organisation
- title
- intro
- status
- issueDate
- dueDate
- validityDays
- currency
- taxRate
- discountPercent
- depositAmount
- conditions
- notes
- templateId nullable
- createdById
- updatedById
- sentAt
- acceptedAt
- paidAt
- archivedAt
- createdAt
- updatedAt

### DocumentLine
- id
- documentId
- position
- name
- description
- quantity decimal
- unitPrice decimal
- taxRate nullable

### DocumentSection
- id
- documentId
- position
- title
- content
- sectionType

### DocumentVersion
- id
- documentId
- versionNumber
- snapshot JSON
- createdById
- createdAt

### Template
- id
- organizationId
- name
- type
- description
- structure JSON
- isDefault
- isArchived
- createdAt
- updatedAt

### Payment
- id
- invoiceId
- amount
- paidAt
- method
- reference
- note
- createdById

### ActivityLog
- id
- organizationId
- actorId
- entityType
- entityId
- action
- metadata JSON
- createdAt

Utilise des `Decimal` pour les montants en base. Ne stocke pas l'argent dans des floats JS imprécis.

---

## 7. TYPES DE DOCUMENTS À SUPPORTER

Conserve les 10 types du prototype :
1. Devis
2. Facture
3. Facture d'acompte
4. Avoir
5. Proposition commerciale
6. Contrat de prestation
7. Accord de confidentialité / NDA
8. Bon de commande
9. Bon de livraison
10. Compte rendu / PV

Prévois une architecture extensible pour ajouter de nouveaux types sans recopier toute la logique.

Les documents financiers utilisent des lignes de prestation et des calculs. Les documents éditoriaux utilisent des sections ordonnées. Certains types peuvent combiner les deux.

---

## 8. NUMÉROTATION DES DOCUMENTS

Implémente un système de séquences fiable et atomique par organisation et type.

Exemples :
- `DEV-2026-001`
- `FAC-2026-001`
- `ACP-2026-001`
- `AVO-2026-001`
- `PROP-2026-001`
- `CTR-2026-001`

La numérotation ne doit jamais produire de doublon en concurrence.

Permets dans les paramètres de choisir un pattern configurable :
`{PREFIX}-{YEAR}-{SEQ:3}`.

---

## 9. MODULE CLIENTS

Reproduis pixel perfect la page Clients du prototype puis rends-la réellement persistante.

Fonctionnalités :
- créer ;
- modifier ;
- archiver ;
- rechercher ;
- filtrer par type / secteur / tags ;
- voir l'historique des documents ;
- chiffre d'affaires encaissé ;
- total facturé ;
- montant en attente ;
- dernière activité ;
- bouton “Créer un document” prérempli pour ce client ;
- protection contre suppression destructive si documents liés ;
- fusion de doublons en option si simple à maintenir.

---

## 10. MODULE DOCUMENTS

Reproduis la DataTable existante avec :
- recherche instantanée ;
- filtres type ;
- filtres statut ;
- filtre client ;
- plage de dates ;
- tri ;
- pagination ;
- duplication ;
- archivage ;
- suppression avec confirmation ;
- actions bulk sur sélection ;
- URL partageable avec query params des filtres ;
- persistance des filtres non nécessaire mais appréciée.

Statuts minimum :
- DRAFT / Brouillon
- SENT / Envoyé
- ACCEPTED / Accepté
- PAID / Payé
- REJECTED / Refusé
- EXPIRED / Expiré
- CANCELLED / Annulé

Les transitions de statut doivent être cohérentes. Exemple : `Payé` doit concerner en priorité les documents de facturation.

---

## 11. ÉDITEUR DE DOCUMENTS

C'est la partie la plus importante du produit.

Conserve le layout desktop du prototype :
- topbar dédiée ;
- panneau formulaire à gauche ;
- aperçu A4 à droite ;
- zoom ;
- modifications en temps réel ;
- onglets “Contenu” / “Options” ;
- actions enregistrer / dupliquer / exporter.

### Exigences UX
- autosave debounced vers le serveur ;
- indicateur `Enregistrement… / Enregistré / Erreur` ;
- protection contre perte de données ;
- `Cmd/Ctrl + S` ;
- validation inline ;
- erreurs réseau non destructives ;
- optimistic UI seulement lorsque sûr ;
- versioning à chaque sauvegarde significative ;
- capacité de restaurer une version précédente.

### Éditeur financier
- lignes dynamiques ;
- reorder drag & drop ;
- nom ;
- description ;
- quantité ;
- unité facultative ;
- prix unitaire ;
- remise document ;
- TVA ;
- acompte ;
- sous-total ;
- total HT ;
- taxe ;
- total TTC ;
- reste à payer ;
- arrondis corrects ;
- support FCFA sans décimales par défaut ;
- devise paramétrable.

### Éditeur éditorial
- sections dynamiques ;
- drag & drop ;
- duplication de section ;
- suppression ;
- types de section réutilisables ;
- contenu multiligne ;
- listes ;
- titre ;
- ordre persistant.

Ne construis pas un éditeur WYSIWYG lourd si ce n'est pas nécessaire. Priorité à la stabilité.

---

## 12. APERÇU A4 & PDF

Le rendu A4 existant doit rester visuellement identique ou plus précis.

Exigences :
- composant document indépendant du dashboard ;
- rendu identique entre aperçu web et PDF ;
- marges A4 correctes ;
- pagination propre ;
- aucun bloc coupé de manière absurde ;
- page de couverture pour la proposition commerciale ;
- footer cohérent ;
- logo haute qualité ;
- titres orphelins évités ;
- tableaux répétant les en-têtes si plusieurs pages ;
- liens cliquables lorsque pertinent ;
- métadonnées PDF ;
- nom de fichier propre, par exemple `DEV-2026-023-FIDELE-SARL.pdf`.

Le bouton “Exporter PDF” doit générer un PDF serveur téléchargeable. Ne dépends pas uniquement de `window.print()` en production.

Crée une route sécurisée d'export PDF et vérifie que l'utilisateur a accès au document demandé.

---

## 13. PROPOSITIONS COMMERCIALES

Le modèle de proposition doit supporter :
- couverture ;
- contexte ;
- objectif ;
- problème / opportunité ;
- solution proposée ;
- périmètre ;
- livrables ;
- méthodologie ;
- planning ;
- équipe projet ;
- offres / options ;
- tarifs ;
- bonus ;
- hypothèses ;
- conditions ;
- prochaines étapes ;
- conclusion ;
- signature.

L'utilisateur doit pouvoir ajouter, masquer, supprimer, dupliquer et réordonner ces sections.

---

## 14. MODÈLES / TEMPLATES

La page Modèles du prototype doit devenir un vrai système :
- modèles système Sparkline ;
- modèles personnalisés ;
- création depuis un document existant ;
- définir comme modèle par défaut par type ;
- dupliquer un modèle ;
- archiver ;
- prévisualiser ;
- structure JSON versionnée ;
- variables de fusion : `{{client.name}}`, `{{company.email}}`, `{{document.reference}}`, etc.

Prévois des templates orientés services Sparkline :
- Développement & Architecture ;
- UI/UX & Produit ;
- Cloud & DevOps ;
- Identité Visuelle & Branding ;
- Contenus & Motion Design ;
- offre mixte / transformation digitale.

---

## 15. FINANCE

Conserve la page Finance actuelle et rends-la réellement calculée depuis les données serveur.

Indicateurs :
- facturé ;
- encaissé ;
- restant à encaisser ;
- en retard ;
- montant des devis acceptés ;
- panier moyen ;
- CA mensuel ;
- CA par client ;
- CA par service si la donnée existe ;
- âge des créances.

Fonctionnalités :
- enregistrer un paiement partiel ou total ;
- méthodes de paiement ;
- référence de transaction ;
- date de paiement ;
- reste à payer automatique ;
- statut facture automatiquement mis à jour ;
- échéances dépassées détectées côté serveur ;
- filtre par période ;
- export CSV des factures et paiements.

Le dashboard financier ne doit jamais compter un devis comme du chiffre d'affaires encaissé.

---

## 16. ENVOI & PARTAGE

Ajouter depuis un document :
- téléchargement PDF ;
- envoi par e-mail au contact client ;
- champ destinataires ;
- CC ;
- sujet ;
- message personnalisé ;
- PDF joint ;
- journal des envois ;
- timestamp `sentAt` ;
- option de copie à l'utilisateur.

Créer une abstraction de mail. Si aucune clé provider n'est configurée en local, fournir un mode dev qui loggue l'e-mail sans crash.

Option avancée : lien public sécurisé et expirant vers une proposition/devis, avec bouton accepter/refuser. Ne l'implémente que si le socle principal est propre.

---

## 17. SIGNATURE / ACCEPTATION

Préparer l'architecture pour :
- signature manuelle par upload ou dessin ;
- validation simple “Accepté par le client” ;
- nom, fonction, date ;
- IP/metadata seulement si légalement et techniquement pertinent ;
- version du document figée au moment de l'acceptation.

La première version peut se limiter à une acceptation interne enregistrée dans l'audit log, mais le modèle de données doit pouvoir évoluer.

---

## 18. DASHBOARD

Conserve le hero Sparkline et les cards du prototype.

Données réelles :
- nombre de documents ;
- clients actifs ;
- encaissé ;
- à encaisser ;
- devis/propositions acceptés ;
- documents récents ;
- factures à relancer ;
- échéances proches ;
- raccourcis de création.

Les agrégats doivent être calculés efficacement côté serveur.

---

## 19. RECHERCHE GLOBALE

Conserve `Cmd/Ctrl + K`.

Transformer le champ en palette de recherche rapide permettant de trouver :
- clients ;
- documents ;
- références ;
- titres ;
- e-mails de contact.

Support clavier : flèches, Entrée, Échap.

---

## 20. PARAMÈTRES

Sections :
- entreprise ;
- identité visuelle ;
- coordonnées ;
- devise ;
- TVA ;
- validité devis ;
- conditions de paiement ;
- numérotation ;
- modèles par défaut ;
- membres ;
- rôles ;
- préférences e-mail ;
- export des données ;
- sécurité.

Upload des logos avec prévisualisation et stockage sécurisé.

---

## 21. IMPORT / EXPORT & BACKUP

Conserve l'import/export JSON du prototype pour migration et secours.

Ajoute :
- validation Zod du fichier importé ;
- preview avant import ;
- stratégie merge / replace explicite ;
- export complet de l'organisation ;
- export CSV clients ;
- export CSV factures ;
- journal d'import.

Ne jamais écraser silencieusement des données existantes.

---

## 22. SÉCURITÉ

Applique au minimum :
- authorization serveur systématique ;
- validation Zod de toutes les mutations ;
- rate limiting sur routes sensibles ;
- CSRF selon mécanisme de la stack ;
- cookies sécurisés ;
- headers sécurité ;
- sanitization si rendu de contenu riche ;
- pas de HTML utilisateur injecté sans contrôle ;
- vérification MIME/taille des fichiers ;
- audit log ;
- aucune donnée d'une organisation accessible par une autre ;
- transactions DB sur opérations financières et séquences de numérotation.

---

## 23. PERFORMANCE

Objectifs :
- dashboard rapide ;
- chargement initial maîtrisé ;
- tables paginées ;
- requêtes DB indexées ;
- pas de N+1 ;
- bundles clients minimisés ;
- charts chargés uniquement où nécessaire ;
- preview A4 optimisée ;
- images/logo optimisés ;
- loading states avec skeletons ;
- cache seulement lorsque cohérent avec les données privées.

---

## 24. RESPONSIVE

Le desktop est prioritaire, mais l'application doit rester utilisable tablette et mobile.

- sidebar en drawer sous ~980px ;
- tables horizontalement scrollables ou adaptées ;
- formulaires mono-colonne mobile ;
- éditeur : sur mobile, afficher formulaire et aperçu dans deux onglets / modes, au lieu de cacher définitivement l'aperçu ;
- boutons principaux accessibles au pouce ;
- aucun débordement horizontal parasite.

---

## 25. QUALITÉ & TESTS

Tests obligatoires :

### Unitaires
- calcul de sous-total ;
- remise ;
- taxe ;
- acompte ;
- reste à payer ;
- génération de référence ;
- transitions de statut ;
- permissions.

### Intégration
- création client ;
- création devis ;
- ajout/suppression de ligne ;
- sauvegarde ;
- duplication ;
- génération PDF ;
- enregistrement paiement.

### E2E Playwright
- login ;
- créer un client ;
- créer un devis ;
- vérifier le preview ;
- enregistrer ;
- exporter PDF ;
- convertir le devis en facture si cette fonctionnalité est ajoutée ;
- marquer la facture payée ;
- vérifier dashboard/finance.

Ajoute des tests de non-régression visuelle sur les écrans clés si possible.

---

## 26. CONVERSION ENTRE DOCUMENTS

Implémente un workflow très utile :
- Proposition commerciale → Devis ;
- Devis accepté → Facture / Facture d'acompte ;
- Facture → Avoir ;
- Document → Modèle.

Lors d'une conversion :
- conserver le client ;
- reprendre les lignes/sections pertinentes ;
- créer une nouvelle référence ;
- conserver un lien `sourceDocumentId` ;
- ne jamais modifier destructivement le document source.

---

## 27. CATALOGUE DE SERVICES

Ajouter un mini catalogue interne de prestations Sparkline pour remplir plus vite les documents.

Entité `ServiceCatalogItem` :
- nom ;
- catégorie ;
- description ;
- prix indicatif optionnel ;
- unité ;
- actif/inactif.

Catégories de base :
- Développement & Architecture ;
- Expérience Utilisateur ;
- Déploiement & Sécurité ;
- Stratégie & Identité ;
- Contenus & Motion Design.

Dans l'éditeur d'un devis/facture, permettre “Ajouter depuis le catalogue” puis personnaliser librement la ligne.

---

## 28. DONNÉES DE DÉMONSTRATION / SEED

Conserve les données FIDÈLE SARL présentes dans le prototype comme données de démonstration en environnement dev :
- devis communication / réseaux sociaux ;
- proposition commerciale correspondante ;
- prestations shooting ;
- gestion réseaux sociaux ;
- conditions de paiement ;
- quelques factures exemples.

Ne seed jamais ces données automatiquement en production.

---

## 29. MIGRATION DU PROTOTYPE

Procède dans cet ordre :

1. Auditer les fichiers existants et lister les écrans/comportements.
2. Initialiser Next.js + TypeScript strict sans casser le prototype.
3. Migrer les tokens CSS et layout global.
4. Recréer pixel perfect le sidebar/topbar/dashboard.
5. Migrer Clients.
6. Migrer Documents + DataTable.
7. Migrer l'éditeur et le preview A4.
8. Migrer Templates.
9. Migrer Finance.
10. Migrer Settings.
11. Ajouter DB et repositories.
12. Remplacer progressivement les données `localStorage` par les données serveur.
13. Ajouter auth et permissions.
14. Ajouter PDF serveur.
15. Ajouter mail.
16. Ajouter paiements, versions et audit logs.
17. Ajouter tests et hardening.
18. Vérifier responsive et accessibilité.
19. Faire une passe de non-régression visuelle écran par écran.
20. Documenter installation, variables d'environnement et déploiement.

À chaque étape, garde l'application exécutable.

---

## 30. CRITÈRES D'ACCEPTATION

Le travail n'est terminé que si :
- le rendu est pixel perfect par rapport au prototype ;
- toutes les fonctionnalités existantes fonctionnent encore ;
- les données persistent en PostgreSQL ;
- l'application est authentifiée ;
- les permissions sont serveur-side ;
- un client peut être créé puis réutilisé dans un document ;
- un devis calcule correctement ses montants ;
- une proposition gère ses sections ;
- un PDF propre est généré ;
- une facture peut être suivie et payée ;
- les chiffres finance correspondent aux données ;
- la duplication fonctionne ;
- la conversion devis → facture fonctionne ;
- les templates sont persistants ;
- le responsive est propre ;
- aucune erreur console sérieuse ;
- aucune erreur TypeScript ;
- lint OK ;
- tests critiques OK ;
- README complet ;
- `.env.example` complet ;
- seed dev séparé ;
- migrations DB versionnées ;
- aucun secret commité.

---

## 31. ATTITUDE D'EXÉCUTION

Ne me demande pas de confirmer chaque petite étape. Analyse le projet, prends les décisions techniques cohérentes, réalise les modifications nécessaires et avance jusqu'à obtenir un résultat propre.

N'invente pas un nouveau design. N'efface pas ce qui fonctionne. Ne bâcle pas les états vides, loading, error, responsive ou permissions.

Quand tu hésites entre une implémentation rapide fragile et une implémentation légèrement plus longue mais maintenable, choisis la maintenable.

À la fin, fournis :
1. résumé des travaux ;
2. architecture finale ;
3. schéma DB ;
4. variables d'environnement ;
5. commandes d'installation/migration/seed/dev/build/test ;
6. fonctionnalités terminées ;
7. points restant éventuellement à connecter à un provider externe ;
8. liste des décisions techniques importantes ;
9. checklist de validation finale.

Commence maintenant par auditer le prototype existant et construire le plan de migration concret, puis implémente-le sans modifier la direction artistique.
