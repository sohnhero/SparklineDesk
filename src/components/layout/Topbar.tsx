'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, Plus } from 'lucide-react';

interface TopbarProps {
  onOpenSidebar: () => void;
  onOpenSearch: () => void;
  onOpenNewClient: () => void;
  userInitials?: string;
}

const VIEW_TITLES: Record<string, [string, string]> = {
  '/dashboard': ['ESPACE DE PILOTAGE', "Vue d'ensemble"],
  '/documents': ['BIBLIOTHÈQUE', 'Documents'],
  '/clients': ['CRM LÉGER', 'Clients'],
  '/templates': ['BIBLIOTHÈQUE', 'Modèles'],
  '/finance': ['SUIVI', 'Finance'],
  '/settings': ['CONFIGURATION', 'Paramètres'],
};

export function Topbar({
  onOpenSidebar,
  onOpenSearch,
  onOpenNewClient,
  userInitials = 'SL',
}: TopbarProps) {
  const pathname = usePathname();

  let [eyebrow, title] = ['ESPACE DE PILOTAGE', "Vue d'ensemble"];
  if (VIEW_TITLES[pathname]) {
    [eyebrow, title] = VIEW_TITLES[pathname];
  } else if (pathname.startsWith('/documents/')) {
    [eyebrow, title] = ['ÉDITEUR', 'Document'];
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-button menu-button"
          id="menuButton"
          onClick={onOpenSidebar}
          aria-label="Ouvrir le menu"
        >
          <Menu size={16} strokeWidth={2} />
        </button>
        <div>
          <p className="eyebrow" id="pageEyebrow">
            {eyebrow}
          </p>
          <h1 id="pageTitle">{title}</h1>
        </div>
      </div>
      <div className="topbar-actions">
        <div
          className="global-search"
          onClick={onOpenSearch}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ display: 'grid', placeItems: 'center' }}>
            <Search size={14} strokeWidth={2} />
          </span>
          <input
            id="globalSearch"
            type="search"
            placeholder="Rechercher un client, un document…"
            readOnly
          />
          <kbd>⌘ K</kbd>
        </div>
        <button
          type="button"
          className="icon-button mobile-search-button"
          id="mobileSearchBtn"
          title="Rechercher"
          onClick={onOpenSearch}
          aria-label="Rechercher"
          style={{ display: 'none' }}
        >
          <Search size={16} strokeWidth={2} />
        </button>
        <button
          type="button"
          className="icon-button quick-new-client-btn"
          id="quickNewClientBtn"
          title="Nouveau client"
          onClick={onOpenNewClient}
          style={{ display: 'grid', placeItems: 'center' }}
        >
          <Plus size={16} strokeWidth={2.2} />
        </button>
        <button
          type="button"
          className="avatar-button"
          id="profileButton"
          aria-label="Profil"
          title="Sparkline Studio"
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
