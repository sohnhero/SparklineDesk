'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { MobileTableAccordion, MobileTableItem } from '@/components/ui/MobileTableAccordion';
import { useConfirm } from '@/components/ui/ConfirmDialog';

interface SettingsClientViewProps {
  initialCompany: {
    name: string;
    legalName: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    city: string;
    country: string;
  };
  initialDocuments: {
    currency: string;
    taxRate: number;
    quoteValidityDays: number;
    paymentTerms: string;
    autoNumber: boolean;
  };
  users: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export function SettingsClientView({
  initialCompany,
  initialDocuments,
  users,
}: SettingsClientViewProps) {
  const [company, setCompany] = useState(initialCompany);
  const [docSettings, setDocSettings] = useState(initialDocuments);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingDocs, setSavingDocs] = useState(false);
  const [restoringBackup, setRestoringBackup] = useState(false);
  const router = useRouter();
  const { confirm } = useConfirm();

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(company),
      });

      if (!res.ok) throw new Error('Erreur sauvegarde entreprise');
      toast.success('Informations Sparkline enregistrées.');
      router.refresh();
    } catch {
      toast.success('Erreur lors de l’enregistrement.');
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSaveDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDocs(true);
    try {
      const res = await fetch('/api/settings/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docSettings),
      });

      if (!res.ok) throw new Error('Erreur sauvegarde préférences');
      toast.success('Préférences documents enregistrées.');
      router.refresh();
    } catch {
      toast.success('Erreur lors de l’enregistrement.');
    } finally {
      setSavingDocs(false);
    }
  };

  const handleExportJSON = () => {
    window.open('/api/backup/export', '_blank');
  };

  const handleRestoreJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = await confirm({
      title: 'Restaurer une sauvegarde ?',
      description: 'Attention : l’importation de cette sauvegarde va synchroniser et remplacer vos données existantes (documents, clients, paramètres).',
      highlight: file.name,
      confirmText: 'Restaurer les données',
      cancelText: 'Annuler',
      variant: 'warning',
      icon: 'refresh',
    });

    if (!confirmed) {
      e.target.value = '';
      return;
    }

    setRestoringBackup(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de l’importation');
      }

      toast.success('Sauvegarde restaurée avec succès !');
      router.refresh();
    } catch (err: any) {
      toast(err.message || 'Fichier de sauvegarde invalide.');
    } finally {
      setRestoringBackup(false);
      e.target.value = '';
    }
  };

  return (
    <section className="view active" id="view-settings">
      <div className="settings-grid">
        {/* Company Settings */}
        <section className="panel settings-card">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ENTREPRISE</span>
              <h3>Informations Sparkline</h3>
            </div>
          </div>
          <form
            id="companySettingsForm"
            className="form-grid two-cols"
            onSubmit={handleSaveCompany}
          >
            <div className="field">
              <label htmlFor="company-name">Nom commercial</label>
              <input
                id="company-name"
                value={company.name}
                onChange={(e) =>
                  setCompany({ ...company, name: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-legalName">Raison sociale</label>
              <input
                id="company-legalName"
                value={company.legalName}
                onChange={(e) =>
                  setCompany({ ...company, legalName: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-email">E-mail de contact</label>
              <input
                id="company-email"
                type="email"
                value={company.email}
                onChange={(e) =>
                  setCompany({ ...company, email: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-phone">Téléphone</label>
              <input
                id="company-phone"
                value={company.phone}
                onChange={(e) =>
                  setCompany({ ...company, phone: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-website">Site web</label>
              <input
                id="company-website"
                value={company.website}
                onChange={(e) =>
                  setCompany({ ...company, website: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-address">Adresse physique</label>
              <input
                id="company-address"
                value={company.address}
                onChange={(e) =>
                  setCompany({ ...company, address: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-city">Ville</label>
              <input
                id="company-city"
                value={company.city}
                onChange={(e) =>
                  setCompany({ ...company, city: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="company-country">Pays</label>
              <input
                id="company-country"
                value={company.country}
                onChange={(e) =>
                  setCompany({ ...company, country: e.target.value })
                }
              />
            </div>
            <button
              className="btn btn-dark settings-save"
              type="submit"
              disabled={savingCompany}
            >
              {savingCompany ? 'Enregistrement...' : 'Enregistrer l’entreprise'}
            </button>
          </form>
        </section>

        {/* Document Preferences */}
        <section className="panel settings-card">
          <div className="panel-head">
            <div>
              <span className="section-kicker">DOCUMENTS</span>
              <h3>Préférences</h3>
            </div>
          </div>
          <form
            id="documentSettingsForm"
            className="form-grid"
            onSubmit={handleSaveDocuments}
          >
            <div className="field">
              <label htmlFor="setting-currency">Devise</label>
              <input
                id="setting-currency"
                value={docSettings.currency}
                onChange={(e) =>
                  setDocSettings({ ...docSettings, currency: e.target.value })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="setting-taxRate">TVA par défaut (%)</label>
              <input
                id="setting-taxRate"
                type="number"
                min="0"
                step="0.1"
                value={docSettings.taxRate}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    taxRate: Number(e.target.value || 0),
                  })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="setting-validity">Validité d’un devis (jours)</label>
              <input
                id="setting-validity"
                type="number"
                min="1"
                value={docSettings.quoteValidityDays}
                onChange={(e) =>
                  setDocSettings({
                    ...docSettings,
                    quoteValidityDays: Number(e.target.value || 30),
                  })
                }
              />
            </div>
            <div className="field">
              <label htmlFor="setting-paymentTerms">
                Conditions de paiement par défaut
              </label>
              <textarea
                id="setting-paymentTerms"
                value={docSettings.paymentTerms}
                onChange={(e) =>
                  setDocSettings({ ...docSettings, paymentTerms: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="switch-row">
              <div className="switch-copy">
                <strong>Numérotation automatique</strong>
                <span>Générer les références au moment de la création</span>
              </div>
              <button
                type="button"
                className={`toggle ${docSettings.autoNumber ? 'active' : ''}`}
                onClick={() =>
                  setDocSettings({
                    ...docSettings,
                    autoNumber: !docSettings.autoNumber,
                  })
                }
              />
            </div>
            <button
              className="btn btn-dark settings-save"
              type="submit"
              disabled={savingDocs}
            >
              {savingDocs ? 'Enregistrement...' : 'Enregistrer les préférences'}
            </button>
          </form>
        </section>
      </div>

      {/* Backup and Restore Section */}
      <div style={{ marginTop: '14px' }}>
        <section className="panel settings-card">
          <div className="panel-head">
            <div>
              <span className="section-kicker">SAUVEGARDE & DONNÉES</span>
              <h3>Export & Restauration du système</h3>
            </div>
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              padding: '10px 0',
            }}
          >
            <div
              style={{
                border: '1px solid #e6e6e1',
                borderRadius: '12px',
                padding: '16px',
                background: '#fafaf8',
              }}
            >
              <strong style={{ fontSize: '13px', display: 'block' }}>
                Sauvegarde Complète (JSON)
              </strong>
              <p
                style={{
                  fontSize: '11px',
                  color: '#777',
                  margin: '6px 0 14px',
                  lineHeight: 1.5,
                }}
              >
                Téléchargez l'intégralité de vos clients, documents, devis, factures, catalogues et paramètres.
              </p>
              <button
                type="button"
                className="btn btn-dark"
                style={{ fontSize: '11px' }}
                onClick={handleExportJSON}
              >
                ↓ Télécharger la sauvegarde JSON
              </button>
            </div>

            <div
              style={{
                border: '1px solid #e6e6e1',
                borderRadius: '12px',
                padding: '16px',
                background: '#fafaf8',
              }}
            >
              <strong style={{ fontSize: '13px', display: 'block' }}>
                Restaurer une sauvegarde
              </strong>
              <p
                style={{
                  fontSize: '11px',
                  color: '#777',
                  margin: '6px 0 14px',
                  lineHeight: 1.5,
                }}
              >
                Restaurez vos données à partir d'un fichier JSON exporté précédemment depuis Sparkline Desk.
              </p>
              <label
                className="btn btn-outline"
                style={{
                  fontSize: '11px',
                  display: 'inline-flex',
                  cursor: 'pointer',
                }}
              >
                {restoringBackup ? 'Restauration en cours…' : '↑ Sélectionner un fichier .json'}
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleRestoreJSON}
                  disabled={restoringBackup}
                />
              </label>
            </div>
          </div>
        </section>
      </div>

      {/* Team & Members */}
      <div style={{ marginTop: '14px' }}>
        <section className="panel">
          <div className="panel-head">
            <div>
              <span className="section-kicker">ÉQUIPE & RÔLES</span>
              <h3>Membres de l’organisation Sparkline</h3>
            </div>
          </div>
          <div className="responsive-table-desktop">
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>E-mail</th>
                    <th>Rôle</th>
                    <th>Membre depuis</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="status-pill Payé">{u.role}</span>
                      </td>
                      <td className="muted">{u.createdAt.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="responsive-table-mobile">
            <MobileTableAccordion
              items={users.map((u): MobileTableItem => ({
                id: u.id,
                primaryLabel: 'Membre',
                primaryValue: u.name,
                previewBadges: (
                  <span className="status-pill Payé" style={{ fontSize: '10.5px', padding: '2px 7px' }}>
                    {u.role}
                  </span>
                ),
                fields: [
                  { label: 'Nom', value: <strong>{u.name}</strong> },
                  { label: 'E-mail', value: u.email },
                  {
                    label: 'Rôle',
                    value: <span className="status-pill Payé">{u.role}</span>,
                  },
                  { label: 'Inscrit le', value: u.createdAt.slice(0, 10) },
                ],
              }))}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
