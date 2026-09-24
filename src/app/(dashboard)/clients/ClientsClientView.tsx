'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Plus, Download, Edit2, FileText } from 'lucide-react';
import { ClientModal, ClientFormData } from '@/components/ui/ClientModal';
import { DocumentTypeModal } from '@/components/ui/DocumentTypeModal';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatMoney, initials } from '@/lib/utils/format';
import { STATUS_MAP } from '@/domains/documents/types';

export interface ClientDocItem {
  id: string;
  reference: string;
  title: string;
  type: string;
  status: string;
  date: string;
  amount?: number;
}

export interface ClientViewData {
  id: string;
  name: string;
  sector: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  docCount: number;
  turnover: number;
  documents?: ClientDocItem[];
}

interface ClientsClientViewProps {
  initialClients: ClientViewData[];
  currency: string;
}

export function ClientsClientView({
  initialClients,
  currency,
}: ClientsClientViewProps) {
  const [clients, setClients] = useState<ClientViewData[]>(initialClients);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientFormData | null>(null);
  const [detailClient, setDetailClient] = useState<ClientViewData | null>(null);
  const [docTypeModalOpen, setDocTypeModalOpen] = useState(false);
  const [targetClientId, setTargetClientId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const filteredClients = clients.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${c.name} ${c.sector} ${c.contactName} ${c.email} ${c.phone}`
      .toLowerCase()
      .includes(q);
  });

  const handleSaveClient = async (data: ClientFormData) => {
    try {
      if (data.id) {
        // Edit
        const res = await fetch(`/api/clients/${data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur mise à jour');
        }
        const updated = await res.json();
        setClients((prev) =>
          prev.map((c) =>
            c.id === data.id
              ? {
                  ...c,
                  name: updated.client.name,
                  sector: updated.client.sector || '',
                  contactName: updated.client.contactName || '',
                  email: updated.client.email || '',
                  phone: updated.client.phone || '',
                  address: updated.client.address || '',
                  notes: updated.client.notes || '',
                }
              : c
          )
        );
        toast('Client mis à jour.');
      } else {
        // Create
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur création');
        }
        const created = await res.json();
        setClients((prev) => [
          {
            id: created.client.id,
            name: created.client.name,
            sector: created.client.sector || '',
            contactName: created.client.contactName || '',
            email: created.client.email || '',
            phone: created.client.phone || '',
            address: created.client.address || '',
            notes: created.client.notes || '',
            docCount: 0,
            turnover: 0,
            documents: [],
          },
          ...prev,
        ]);
        toast('Client créé avec succès.');
      }
      setModalOpen(false);
      setEditingClient(null);
      router.refresh();
    } catch (err: any) {
      toast(err.message || 'Une erreur est survenue', 'error');
    }
  };

  const handleDeleteClient = async (client: ClientViewData) => {
    if (!confirm(`Supprimer le client « ${client.name} » ? Ses documents resteront archivés.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur suppression');
      }

      setClients((prev) => prev.filter((c) => c.id !== client.id));
      if (detailClient?.id === client.id) {
        setDetailClient(null);
      }
      toast('Client supprimé.');
      router.refresh();
    } catch (err: any) {
      toast(err.message || 'Impossible de supprimer ce client', 'error');
    }
  };

  const handleOpenDocTypeForClient = (clientId: string) => {
    setTargetClientId(clientId);
    setDocTypeModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Secteur', 'Contact', 'Email', 'Téléphone', 'Adresse', 'Documents', 'Total Encaissé'];
    const rows = filteredClients.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.sector.replace(/"/g, '""')}"`,
      `"${c.contactName.replace(/"/g, '""')}"`,
      `"${c.email.replace(/"/g, '""')}"`,
      `"${c.phone.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.docCount,
      c.turnover,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sparkline-clients-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Export CSV généré.');
  };

  return (
    <section className="view active" id="view-clients">
      <div className="view-toolbar">
        <div className="list-search wide">
          <span>⌕</span>
          <input
            id="clientsSearch"
            type="search"
            placeholder="Rechercher une entreprise ou un contact…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            title="Exporter la liste des clients"
          >
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-dark"
            id="newClientBtn"
            onClick={() => {
              setEditingClient(null);
              setModalOpen(true);
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} strokeWidth={2.2} />
            <span>Nouveau client</span>
          </button>
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="empty-state panel" id="clientsEmpty">
          <div className="empty-icon" style={{ display: 'grid', placeItems: 'center' }}>
            <Users size={26} strokeWidth={1.8} />
          </div>
          <h3>Aucun client</h3>
          <p>Ajoutez vos clients pour préremplir tous vos futurs documents.</p>
        </div>
      ) : (
        <div className="client-grid" id="clientGrid">
          {filteredClients.map((c) => (
            <article
              key={c.id}
              className="client-card"
              style={{ cursor: 'pointer' }}
              onClick={() => setDetailClient(c)}
            >
              <div className="client-card-head">
                <div className="client-avatar">{initials(c.name)}</div>
                <div
                  className="client-menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="mini-action"
                    title="Créer un document pour ce client"
                    onClick={() => handleOpenDocTypeForClient(c.id)}
                    style={{ display: 'grid', placeItems: 'center' }}
                  >
                    <Plus size={13} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    className="mini-action"
                    title="Modifier ce client"
                    onClick={() => {
                      setEditingClient(c);
                      setModalOpen(true);
                    }}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="mini-action"
                    title="Supprimer ce client"
                    onClick={() => handleDeleteClient(c)}
                  >
                    ×
                  </button>
                </div>
              </div>
              <h3 style={{ marginTop: '8px' }}>{c.name}</h3>
              <div className="client-sector">
                {c.sector || 'Secteur non renseigné'}
              </div>
              <div className="client-info">
                <div>
                  <strong>Contact</strong> · {c.contactName || '—'}
                </div>
                <div>
                  <strong>E-mail</strong> · {c.email || '—'}
                </div>
                <div>
                  <strong>Téléphone</strong> · {c.phone || '—'}
                </div>
              </div>
              <div className="client-stats">
                <div className="client-stat">
                  <span>Documents</span>
                  <strong>{c.docCount}</strong>
                </div>
                <div className="client-stat">
                  <span>Encaissé</span>
                  <strong>{formatMoney(c.turnover, currency)}</strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      {detailClient && (
        <Modal
          isOpen={true}
          onClose={() => setDetailClient(null)}
          kicker="FICHE CLIENT"
          title={detailClient.name}
          intro={detailClient.sector || 'Entreprise cliente de Sparkline'}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="panel" style={{ padding: '14px', background: '#fafaf8' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 800 }}>
                  Contact principal
                </div>
                <strong style={{ fontSize: '13px', display: 'block', marginTop: '4px' }}>
                  {detailClient.contactName || '—'}
                </strong>
                <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '2px' }}>
                  {detailClient.email || detailClient.phone || 'Pas de coordonnées'}
                </span>
              </div>

              <div className="panel" style={{ padding: '14px', background: '#fafaf8' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 800 }}>
                  Documents créés
                </div>
                <strong style={{ fontSize: '18px', display: 'block', marginTop: '4px' }}>
                  {detailClient.docCount}
                </strong>
                <span style={{ fontSize: '11px', color: '#666' }}>devis, factures, etc.</span>
              </div>

              <div className="panel" style={{ padding: '14px', background: '#fafaf8' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', fontWeight: 800 }}>
                  Total Encaissé
                </div>
                <strong style={{ fontSize: '18px', display: 'block', marginTop: '4px', color: '#1a7f37' }}>
                  {formatMoney(detailClient.turnover, currency)}
                </strong>
                <span style={{ fontSize: '11px', color: '#666' }}>règlements validés</span>
              </div>
            </div>

            {/* Address & Notes */}
            <div style={{ fontSize: '12px', color: '#555', background: '#fff', border: '1px solid #efefec', borderRadius: '10px', padding: '14px' }}>
              <div><strong>Adresse :</strong> {detailClient.address || 'Non renseignée'}</div>
              {detailClient.notes && (
                <div style={{ marginTop: '8px' }}>
                  <strong>Notes :</strong> {detailClient.notes}
                </div>
              )}
            </div>

            {/* Client Documents History */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Historique des documents ({detailClient.documents?.length || 0})
                </h4>
                <button
                  type="button"
                  className="btn btn-dark"
                  style={{
                    fontSize: '11px',
                    padding: '6px 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                  onClick={() => {
                    handleOpenDocTypeForClient(detailClient.id);
                  }}
                >
                  <Plus size={13} strokeWidth={2.2} />
                  <span>Nouveau document</span>
                </button>
              </div>

              {!detailClient.documents || detailClient.documents.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '12px', background: '#fafaf8', borderRadius: '10px' }}>
                  Aucun document pour ce client pour le moment.
                </div>
              ) : (
                <div className="table-wrap" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Réf</th>
                        <th>Titre</th>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailClient.documents.map((d) => (
                        <tr key={d.id}>
                          <td><strong>{d.reference}</strong></td>
                          <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.title}
                          </td>
                          <td className="muted">{d.date}</td>
                          <td>
                            {d.amount !== undefined ? formatMoney(d.amount, currency) : '—'}
                          </td>
                          <td>
                            <span className={`status-pill ${STATUS_MAP[d.status] || d.status}`}>
                              {STATUS_MAP[d.status] || d.status}
                            </span>
                          </td>
                          <td>
                            <Link
                              href={`/documents/${d.id}`}
                              className="btn btn-outline"
                              style={{ padding: '3px 8px', fontSize: '10px' }}
                            >
                              Ouvrir →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #efefec', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditingClient(detailClient);
                  setModalOpen(true);
                  setDetailClient(null);
                }}
              >
                ✎ Modifier le client
              </button>
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setDetailClient(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit/Create Client Modal */}
      <ClientModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingClient(null);
        }}
        onSave={handleSaveClient}
        initialData={editingClient}
      />

      {/* Document Creation Wizard */}
      <DocumentTypeModal
        isOpen={docTypeModalOpen}
        onClose={() => {
          setDocTypeModalOpen(false);
          setTargetClientId(null);
        }}
        initialClientId={targetClientId || undefined}
      />
    </section>
  );
}
