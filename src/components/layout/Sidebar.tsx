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
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';

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
      toast.success('Sauvegarde exportée avec succès.');
    } catch {
      toast.error('Erreur lors de l’export des données.');
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

      toast.success('Données importées avec succès ! Rechargement...');
      setTimeout(() => window.location.reload(), 1200);
    } catch (err: any) {
      toast.error(err.message || 'Fichier de sauvegarde invalide.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
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
            className="nav-item group" 
            onClick={() => setIsLogoutModalOpen(true)}
            style={{ color: '#ef4444' }}
          >
            <span className="nav-icon" style={{ display: 'grid', placeItems: 'center', color: '#ef4444' }}>
              <LogOut size={15} strokeWidth={2} className="group-hover:-translate-x-1 transition-transform" />
            </span>
            <span>Se déconnecter</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          SPARKLINE DESK <span>v1.0</span>
        </div>
      </aside>

      {/* CUSTOM PREMIUM LOGOUT MODAL */}
      {isLogoutModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          {/* Backdrop with blur */}
          <div 
            onClick={() => setIsLogoutModalOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: 'fadeIn 0.2s ease-out'
            }}
          />
          
          {/* Modal Card */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            background: 'rgba(15, 15, 17, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05) inset',
            animation: 'slideUpModal 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflow: 'hidden'
          }}>
            {/* Subtle red glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              height: '100px',
              background: 'radial-gradient(ellipse at top, rgba(239, 68, 68, 0.15), transparent 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
                color: '#ef4444'
              }}>
                <LogOut size={24} strokeWidth={2} style={{ transform: 'translateX(-2px)' }} />
              </div>
              
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'white', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
                Fin de session
              </h2>
              <p style={{ color: '#a1a1aa', fontSize: '14px', margin: '0 0 32px 0', lineHeight: 1.5 }}>
                Êtes-vous sûr de vouloir vous déconnecter de votre espace Sparkline Desk ?
              </p>

              <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  disabled={isLoggingOut}
                  style={{
                    flex: 1,
                    background: '#18181b',
                    border: '1px solid #27272a',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#27272a' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#18181b' }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(to right, #ef4444, #dc2626)',
                    border: 'none',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.3)' }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)' }}
                >
                  {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : 'Me déconnecter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
