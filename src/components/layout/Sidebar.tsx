'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  LayoutTemplate,
  Wallet,
  Settings,
  Download,
  Upload,
  Plus,
  X,
  LogOut,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Modal } from '@/components/ui/Modal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewDoc: () => void;
  documentsCount?: number;
  clientsCount?: number;
}

export function Sidebar({
  isOpen,
  onClose,
  onOpenNewDoc,
  documentsCount = 0,
  clientsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleExport = async () => {
    try {
      const res = await fetch('/api/backup/export');
      if (!res.ok) throw new Error('Échec de l’export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sparkline-desk-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Sauvegarde exportée avec succès.');
    } catch {
      toast('Erreur lors de l’export des données.', 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: text,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur d’importation');
      }

      toast('Données importées avec succès ! Rechargement...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      toast(err.message || 'Fichier de sauvegarde invalide.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      // Force reload to clear client state and redirect to login
      window.location.href = '/login';
    } catch (error) {
      toast('Erreur lors de la déconnexion', 'error');
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { href: '/dashboard', label: "Vue d'ensemble", icon: <LayoutDashboard size={16} strokeWidth={2} /> },
    { href: '/documents', label: 'Documents', icon: <FileText size={16} strokeWidth={2} />, count: documentsCount },
    { href: '/clients', label: 'Clients', icon: <Users size={16} strokeWidth={2} />, count: clientsCount },
    { href: '/templates', label: 'Modèles', icon: <LayoutTemplate size={16} strokeWidth={2} /> },
    { href: '/finance', label: 'Finance', icon: <Wallet size={16} strokeWidth={2} /> },
  ];

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="brand-wrap">
          <Link href="/dashboard">
            <img
              src="/assets/sparkline-logo-white.svg"
              alt="Sparkline"
              className="brand-logo"
            />
          </Link>
          <button
            className="icon-button sidebar-close"
            id="sidebarClose"
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <button
          type="button"
          className="primary-action"
          onClick={() => {
            onOpenNewDoc();
            onClose();
          }}
        >
          <span className="plus" style={{ display: 'grid', placeItems: 'center' }}>
            <Plus size={15} strokeWidth={2.5} />
          </span>
          <span>Nouveau document</span>
        </button>

        <nav className="main-nav" aria-label="Navigation principale">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon" style={{ display: 'grid', placeItems: 'center' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {typeof item.count === 'number' && (
                  <span className="nav-count">{item.count}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="workspace-card">
          <div className="workspace-symbol">
            <img src="/assets/sparkline-symbol.svg" alt="" />
          </div>
          <div>
            <div className="workspace-name">Sparkline Studio</div>
            <div className="workspace-meta">Espace interne</div>
          </div>
          <span className="workspace-dot" />
        </div>

        <nav className="secondary-nav">
          <Link
            href="/settings"
            className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}
            onClick={onClose}
          >
            <span className="nav-icon" style={{ display: 'grid', placeItems: 'center' }}>
              <Settings size={15} strokeWidth={2} />
            </span>
            <span>Paramètres</span>
          </Link>
          <button type="button" className="nav-item" onClick={handleExport}>
            <span className="nav-icon" style={{ display: 'grid', placeItems: 'center' }}>
              <Download size={15} strokeWidth={2} />
            </span>
            <span>Exporter les données</span>
          </button>
          <label className="nav-item file-label">
            <span className="nav-icon" style={{ display: 'grid', placeItems: 'center' }}>
              <Upload size={15} strokeWidth={2} />
            </span>
            <span>Importer les données</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              hidden
            />
          </label>
          <button 
            type="button" 
            className="nav-item" 
            onClick={() => setIsLogoutModalOpen(true)}
            style={{ color: '#ef4444' }}
          >
            <span className="nav-icon" style={{ display: 'grid', placeItems: 'center', color: '#ef4444' }}>
              <LogOut size={15} strokeWidth={2} />
            </span>
            <span>Se déconnecter</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          SPARKLINE DESK <span>v1.0</span>
        </div>
      </aside>

      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Se déconnecter"
        kicker="Session"
        compact
      >
        <p style={{ color: '#a1a1aa', fontSize: '14px', marginBottom: '24px' }}>
          Êtes-vous sûr de vouloir vous déconnecter de votre session Sparkline Desk ?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="secondary-action"
            onClick={() => setIsLogoutModalOpen(false)}
            disabled={isLoggingOut}
          >
            Annuler
          </button>
          <button
            type="button"
            className="primary-action"
            onClick={handleLogout}
            disabled={isLoggingOut}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ef4444', color: 'white' }}
          >
            {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : 'Me déconnecter'}
          </button>
        </div>
      </Modal>
    </>
  );
}
