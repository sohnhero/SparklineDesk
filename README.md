# Sparkline Desk — Next.js Application Production

Application SaaS B2B interne de **Sparkline** pour centraliser et automatiser tout le cycle documentaire commercial, administratif et financier :
- Devis & propositions commerciales
- Factures, acomptes & avoirs
- Contrats de prestation, accords de confidentialité (NDA), bons de commande/livraison, comptes rendus & PV
- CRM clients léger
- Suivi financier, CA mensuel & encaissements
- Moteur d'exportation PDF serveur & boîte de dialogue d'impression A4
- Système de modèles prêts à l'emploi
- Catalogue de services & prestations Sparkline
- Authentification multi-utilisateurs & permissions (OWNER, ADMIN, MEMBER, VIEWER).

---

## 1. Démarrage Rapide

### Prérequis
- Node.js >= 18 (testé avec Node v23)
- PostgreSQL local ou distant (ex: Neon)

### Installation & Lancement

1. **Installer les dépendances** :
   ```bash
   npm install
   ```

2. **Configurer l'environnement** :
   Copier `.env.example` vers `.env` et ajuster si nécessaire l'URL de votre base PostgreSQL :
   ```bash
   cp .env.example .env
   ```

3. **Appliquer les migrations et initialiser les données** :
   ```bash
   # Synchronise le schéma Prisma vers PostgreSQL
   npm run db:push

   # Initialise l'organisation Sparkline, le compte admin, les données FIDÈLE SARL, les templates et le catalogue
   npm run db:seed
   ```

4. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```
   L'application est disponible sur : [http://localhost:3000](http://localhost:3000)

5. **Exécuter les tests unitaires** :
   ```bash
   npm test
   ```

6. **Construire pour la production** :
   ```bash
   npm run build
   npm run start
   ```

---

## 2. Identifiants de Démonstration (Seed)

| Rôle | E-mail | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur / Owner** | `admin@sparkline.sn` | `password123` |

---

## 3. Architecture Technique

```text
sparkline_desk_html/
├── assets/                     # Assets originaux (SVG/PNG)
├── public/
│   └── assets/                 # Logos & symboles servis par Next.js
├── prisma/
│   ├── schema.prisma           # Schéma relationnel PostgreSQL normalisé
│   └── seed.ts                 # Script de seed (FIDÈLE SARL, catalogue, templates)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/          # Page de connexion sécurisée
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx      # AppShell global (Sidebar, Topbar, Modales)
│   │   │   ├── dashboard/      # Vue d'ensemble avec Hero, stats et encaissements
│   │   │   ├── documents/      # Bibliothèque de documents et DataTable
│   │   │   │   ├── new/        # Initialisation instantanée de document
│   │   │   │   └── [id]/       # Éditeur interactif scindé & aperçu A4 live
│   │   │   ├── clients/        # CRM clients avec cartes, CA et actions
│   │   │   ├── templates/      # Bibliothèque des modèles Sparkline
│   │   │   ├── finance/        # CA mensuel, graphiques et suivi des paiements
│   │   │   └── settings/       # Configuration entreprise, préférences et équipe
│   │   └── api/
│   │       ├── auth/           # Login / Logout
│   │       ├── clients/        # CRUD Clients
│   │       ├── documents/      # CRUD Documents, duplication, conversion
│   │       ├── finance/pay/    # Enregistrement des paiements & activité
│   │       ├── pdf/[id]/       # Générateur PDF serveur téléchargeable
│   │       ├── search/         # Recherche globale multi-entités (⌘K)
│   │       ├── backup/         # Export et import JSON sécurisés
│   │       └── settings/       # Paramètres entreprise et devises
│   ├── components/
│   │   ├── layout/             # Sidebar, Topbar, AppShell
│   │   ├── ui/                 # Modal, Toast, SearchPalette, ClientModal
│   │   └── preview/            # Moteur A4 : DocumentSheet & ProposalSheet
│   ├── domains/
│   │   └── documents/          # Métadonnées des 10 types, statuts, mapping
│   ├── lib/
│   │   ├── db/prisma.ts        # Singleton Prisma client
│   │   ├── auth/session.ts     # Sessions cookies, hachage bcrypt, RBAC
│   │   ├── mail/               # Provider mail (dev console + SMTP/Resend)
│   │   ├── storage/            # Abstraction de stockage local / cloud
│   │   └── utils/              # Calculs de montants, devises, dates fr-FR
│   └── styles/
│       └── globals.css         # Tokens et règles CSS fidèles au prototype
```

---

## 4. Fonctionnalités Réalisées

1. **Respect strict de la règle n°0 (Non-redesign)** :
   - Palette Sparkline : noir `#0b0b0c`, blanc `#ffffff`, gris `#f4f4f1`, orange `#ff7a00`.
   - Dimensions, espacements, typographie Inter et micro-interactions 100% conservés.
2. **10 Types de Documents gérés** :
   - Devis (`DEV`)
   - Facture (`FAC`)
   - Facture d'acompte (`ACP`)
   - Avoir (`AVO`)
   - Proposition commerciale (`PROP`)
   - Contrat de prestation (`CTR`)
   - Accord de confidentialité (`NDA`)
   - Bon de commande (`BDC`)
   - Bon de livraison (`BL`)
   - Compte rendu / PV réunion (`PV`)
3. **Éditeur dynamique scindé** :
   - Panneau de formulaire avec autosave débouncé (`● Enregistré`).
   - Insertion instantanée depuis le catalogue de prestations Sparkline.
   - Aperçu A4 en direct avec zoom interactif (`-`, `+`, `80%`).
   - Calculs financiers stricts : sous-total, remise %, TVA %, acompte, total net.
   - Sections éditoriales réordonnables (haut/bas) pour les propositions/contrats.
4. **Exportation & Impression** :
   - Téléchargement PDF direct via `/api/pdf/[id]`.
   - Rendu d'impression navigateur natif ultra-précis via `@media print`.
5. **CRM Clients** :
   - Création, édition, suppression sécurisée (protection si documents liés).
   - Monogrammes, calcul automatique du CA encaissé par client, bouton de création rapide de document.
6. **Finance & Encaissements** :
   - Graphique mensuel de facturation sur 8 mois.
   - Répartition par statut avec barres de suivi.
   - Action rapide "Marquer payé" avec méthode de paiement (Wave, Virement, etc.).
7. **Recherche Globale & Raccourcis** :
   - Palette de commande activable par `Cmd/Ctrl + K`.
   - Sauvegarde rapide par `Cmd/Ctrl + S`.
   - Raccourci `Échap` pour fermer les modales.
8. **Sauvegarde & Migration** :
   - Exportation complète en un clic au format JSON.
   - Importation transactionnelle sécurisée avec validation Zod.
