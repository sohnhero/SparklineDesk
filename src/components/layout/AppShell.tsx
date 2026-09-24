'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { ClientModal, ClientFormData } from '@/components/ui/ClientModal';
import { SearchPalette } from '@/components/ui/SearchPalette';
import { toast } from 'react-toastify';
import { DocTypeKey } from '@/domains/documents/types';

interface AppShellProps {
  children: React.ReactNode;
  initialCounts?: {
    documents: number;
    clients: number;
  };
  userInitials?: string;
}

function ShellInner({
  children,
  initialCounts = { documents: 0, clients: 0 },
  userInitials = 'SL',
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [newDocModalOpen, setNewDocModalOpen] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [counts, setCounts] = useState(initialCounts);
  const router = useRouter();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectType = (type: DocTypeKey) => {
    router.push(`/documents/new?type=${type}`);
  };

  const handleSaveClient = async (clientData: ClientFormData) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la création');
      }

      toast.success('Client créé avec succès !');
      setCounts((prev) => ({ ...prev, clients: prev.clients + 1 }));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de créer le client');
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenNewDoc={() => setNewDocModalOpen(true)}
        documentsCount={counts.documents}
        clientsCount={counts.clients}
      />

      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="main-area">
        <Topbar
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNewClient={() => setNewClientModalOpen(true)}
          userInitials={userInitials}
        />
        <main className="content" id="content">
          {children}
        </main>
      </div>

      <DocumentTypeModal
        isOpen={newDocModalOpen}
        onClose={() => setNewDocModalOpen(false)}
      />

      <ClientModal
        isOpen={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        onSave={handleSaveClient}
      />

      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return <ShellInner {...props} />;
}
