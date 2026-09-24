'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2, Wand2 } from 'lucide-react';
import { Modal } from './Modal';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { toast } from 'react-toastify';

interface ClientOption {
  id: string;
  name: string;
  sector?: string;
  contactName?: string;
}

interface DocumentTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType?: (type: DocTypeKey, clientId?: string, title?: string) => void;
  initialType?: DocTypeKey;
  initialClientId?: string;
}

type CategoryFilter = 'all' | 'billing' | 'legal' | 'ops';

function getDefaultTitleForType(type: DocTypeKey): string {
  const map: Record<DocTypeKey, string> = {
    quote: 'Proposition de services',
    invoice: 'Facture de prestations',
    deposit: "Facture d'acompte",
    credit: 'Avoir sur facture',
    proposal: 'Proposition commerciale',
    contract: 'Contrat de prestation de services',
    nda: 'Accord de confidentialité (NDA)',
    order: 'Bon de commande',
    delivery: 'Bon de livraison',
    report: 'Compte rendu de réunion',
  };
  return map[type] || TYPE_META[type]?.label || 'Nouveau document';
}

function getCategoryForType(type: DocTypeKey): 'billing' | 'legal' | 'ops' {
  if (type === 'quote' || type === 'invoice' || type === 'deposit' || type === 'credit') {
    return 'billing';
  }
  if (type === 'proposal' || type === 'contract' || type === 'nda') {
    return 'legal';
  }
  return 'ops';
}

export function DocumentTypeModal({
  isOpen,
  onClose,
  onSelectType,
  initialType,
  initialClientId,
}: DocumentTypeModalProps) {
  const [step, setStep] = useState<1 | 2>(initialType ? 2 : 1);
  const [selectedType, setSelectedType] = useState<DocTypeKey>(initialType || 'quote');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchFormat, setSearchFormat] = useState('');

  // Step 2 Form States
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || '');
  const [docTitle, setDocTitle] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [validityDays, setValidityDays] = useState(30);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  });
  const [creating, setCreating] = useState(false);

  // Inline Client Creation State
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientSector, setNewClientSector] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [savingNewClient, setSavingNewClient] = useState(false);

  // AI Copilot States
  const [aiBrief, setAiBrief] = useState('');
  const [generatingWithAi, setGeneratingWithAi] = useState(false);
  const [aiGeneratedData, setAiGeneratedData] = useState<any>(null);

  const router = useRouter();
  
  const handleGenerateWithAi = async () => {
    if (!aiBrief.trim()) {
      toast.success('Décrivez en quelques mots la mission ou le besoin pour l’IA.');
      return;
    }
    setGeneratingWithAi(true);
    try {
      const res = await fetch('/api/ai/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: selectedType,
          brief: aiBrief.trim(),
          clientId: selectedClientId || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la génération IA');
      }

      const data = await res.json();
      if (data.document) {
        setAiGeneratedData(data.document);
        if (data.document.title) {
          setDocTitle(data.document.title);
        }
        toast.success('Document prérempli avec l’IA Gemini Pro !');
      }
    } catch (err: any) {
      toast(err.message || 'Impossible de générer le document avec l’IA');
    } finally {
      setGeneratingWithAi(false);
    }
  };

  // Reset or setup when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialType) {
        setSelectedType(initialType);
        setDocTitle(getDefaultTitleForType(initialType));
        setStep(2);
      } else {
        setStep(1);
        setSelectedType('quote');
        setDocTitle(getDefaultTitleForType('quote'));
      }

      if (initialClientId) {
        setSelectedClientId(initialClientId);
      }

      // Fetch clients list
      setLoadingClients(true);
      fetch('/api/clients')
        .then((res) => res.json())
        .then((data) => {
          if (data.clients) {
            setClients(
              data.clients.map((c: any) => ({
                id: c.id,
                name: c.name,
                sector: c.sector || '',
                contactName: c.contactName || '',
              }))
            );
            if (!initialClientId && data.clients.length > 0) {
              setSelectedClientId(data.clients[0].id);
            }
          }
        })
        .catch(() => {
          // silently fail fallback
        })
        .finally(() => setLoadingClients(false));
    }
  }, [isOpen, initialType, initialClientId]);

  // Handle format selection in Step 1
  const handleSelectFormatCard = (key: DocTypeKey) => {
    setSelectedType(key);
    setDocTitle(getDefaultTitleForType(key));
    setStep(2);
  };

  // Inline client creation
  const handleCreateInlineClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.success('Le nom du client est requis.');
      return;
    }

    setSavingNewClient(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName.trim(),
          sector: newClientSector.trim() || undefined,
          contactName: newClientContact.trim() || undefined,
          email: newClientEmail.trim() || undefined,
          phone: newClientPhone.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur création client');
      }

      const { client } = await res.json();
      setClients((prev) => [client, ...prev]);
      setSelectedClientId(client.id);
      setShowNewClientForm(false);
      setNewClientName('');
      setNewClientSector('');
      setNewClientContact('');
      setNewClientEmail('');
      setNewClientPhone('');
      toast.success(`Client « ${client.name} » créé et sélectionné !`);
    } catch (err: any) {
      toast(err.message || 'Impossible de créer le client');
    } finally {
      setSavingNewClient(false);
    }
  };

  // Submit document creation
  const handleCreateDocument = async () => {
    if (!selectedClientId) {
      toast.success('Veuillez sélectionner ou créer un client.');
      return;
    }

    setCreating(true);
    try {
      const meta = TYPE_META[selectedType] || TYPE_META.quote;
      const isFinancial = meta.kind === 'financial';

      const payload = {
        type: selectedType,
        clientId: selectedClientId,
        title: docTitle.trim() || getDefaultTitleForType(selectedType),
        intro: aiGeneratedData?.intro || undefined,
        date: issueDate,
        validity: selectedType === 'quote' ? validityDays : undefined,
        dueDate: selectedType === 'invoice' || selectedType === 'deposit' ? dueDate : undefined,
        conditions: aiGeneratedData?.conditions || undefined,
        notes: aiGeneratedData?.notes || undefined,
        items: isFinancial
          ? (aiGeneratedData?.lines && aiGeneratedData.lines.length > 0
              ? aiGeneratedData.lines.map((l: any) => ({
                  name: l.name || 'Prestation',
                  description: l.description || null,
                  qty: Number(l.qty) || 1,
                  price: Number(l.price) || 0,
                }))
              : [
                  {
                    name: 'Prestation',
                    description: 'Description de la prestation ou du livrable',
                    qty: 1,
                    price: 0,
                  },
                ])
          : [],
        sections: aiGeneratedData?.sections || [],
      };

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur lors de la création');
      }

      const data = await res.json();
      toast.success('Document créé avec succès !');
      onClose();
      router.push(`/documents/${data.document.id}`);
      router.refresh();
    } catch (err: any) {
      toast(err.message || 'Impossible de créer le document');
      setCreating(false);
    }
  };

  const filteredTypes = (
    Object.entries(TYPE_META) as [DocTypeKey, typeof TYPE_META[DocTypeKey]][]
  ).filter(([key, meta]) => {
    if (categoryFilter !== 'all') {
      const cat = getCategoryForType(key);
      if (cat !== categoryFilter) return false;
    }
    if (!searchFormat.trim()) return true;
    const q = searchFormat.toLowerCase().trim();
    return (
      meta.label.toLowerCase().includes(q) ||
      meta.description.toLowerCase().includes(q) ||
      meta.prefix.toLowerCase().includes(q)
    );
  });

  const selectedMeta = TYPE_META[selectedType] || TYPE_META.quote;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      kicker="NOUVEAU DOCUMENT SPARKLINE"
      title={step === 1 ? 'Choisir un format' : 'Configurer le document'}
      intro={
        step === 1
          ? 'Sélectionnez le type de document adapté à votre besoin commercial ou contractuel.'
          : 'Définissez le client destinataire et les informations clés avant d’ouvrir l’éditeur.'
      }
    >
      <div className="creation-wizard">
        {/* Step Indicator Bar */}
        <div className="wizard-steps-bar">
          <button
            type="button"
            className={`wizard-step-badge ${step === 1 ? 'active' : 'done'}`}
            onClick={() => setStep(1)}
          >
            <span>1</span>
            <span>Format & Type</span>
          </button>
          <span style={{ color: '#ccc' }}>→</span>
          <button
            type="button"
            className={`wizard-step-badge ${step === 2 ? 'active' : ''}`}
            onClick={() => setStep(2)}
          >
            <span>2</span>
            <span>Client & Détails</span>
          </button>
        </div>

        {step === 1 ? (
          <>
            {/* Category Filter Pills & Search */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                marginBottom: '14px',
              }}
            >
              <div className="wizard-category-tabs">
                <button
                  type="button"
                  className={`wizard-cat-tab ${categoryFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('all')}
                >
                  Tous ({Object.keys(TYPE_META).length})
                </button>
                <button
                  type="button"
                  className={`wizard-cat-tab ${categoryFilter === 'billing' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('billing')}
                >
                  Facturation & Vente
                </button>
                <button
                  type="button"
                  className={`wizard-cat-tab ${categoryFilter === 'legal' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('legal')}
                >
                  Juridique & Accords
                </button>
                <button
                  type="button"
                  className={`wizard-cat-tab ${categoryFilter === 'ops' ? 'active' : ''}`}
                  onClick={() => setCategoryFilter('ops')}
                >
                  Opérations & PV
                </button>
              </div>

              <div style={{ position: 'relative', width: '200px' }}>
                <input
                  type="search"
                  placeholder="Filtrer…"
                  value={searchFormat}
                  onChange={(e) => setSearchFormat(e.target.value)}
                  style={{
                    fontSize: '11px',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0db',
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Formats Grid */}
            <div className="doc-type-grid">
              {filteredTypes.map(([key, meta]) => {
                const isSelected = selectedType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`doc-type-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectFormatCard(key)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="doc-type-icon">{meta.icon}</div>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          background: meta.kind === 'financial' ? '#fff1e5' : '#f0f0ed',
                          color: meta.kind === 'financial' ? 'var(--orange)' : '#444',
                          borderRadius: '4px',
                        }}
                      >
                        {meta.prefix}
                      </span>
                    </div>
                    <h3>{meta.label}</h3>
                    <p>{meta.description}</p>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          /* Step 2: Configuration & Client */
          <div className="wizard-step2-box">
            {/* Format Recap Header */}
            <div className="wizard-type-summary">
              <div className="wizard-type-summary-left">
                <div className="doc-type-icon">{selectedMeta.icon}</div>
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: 'var(--orange)', textTransform: 'uppercase' }}>
                    Type sélectionné : {selectedMeta.prefix}
                  </div>
                  <strong style={{ fontSize: '14px' }}>{selectedMeta.label}</strong>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '11px' }}
                onClick={() => setStep(1)}
              >
                ← Changer de format
              </button>
            </div>

            {/* Client Picker */}
            <div className="field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0, fontWeight: 700 }}>Client destinataire *</label>
                <button
                  type="button"
                  className="text-button"
                  style={{ fontSize: '11px', color: 'var(--orange)', fontWeight: 700 }}
                  onClick={() => setShowNewClientForm(!showNewClientForm)}
                >
                  {showNewClientForm ? 'Annuler' : '＋ Nouveau client'}
                </button>
              </div>

              {!showNewClientForm ? (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  disabled={loadingClients}
                  style={{ padding: '10px 12px', fontSize: '13px', background: '#fff' }}
                >
                  {loadingClients ? (
                    <option value="">Chargement des clients…</option>
                  ) : clients.length === 0 ? (
                    <option value="">Aucun client trouvé — veuillez en créer un</option>
                  ) : (
                    <>
                      <option value="">— Sélectionner un client —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.sector ? `(${c.sector})` : ''} {c.contactName ? `• ${c.contactName}` : ''}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              ) : (
                /* Inline Quick Client Creation Sub-Form */
                <form
                  onSubmit={handleCreateInlineClient}
                  style={{
                    background: '#fff',
                    border: '1px solid #e0e0dc',
                    borderRadius: '10px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    marginTop: '6px',
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#111' }}>
                    Créer rapidement un nouveau client :
                  </div>
                  <div className="inline-row">
                    <input
                      placeholder="Nom de l'entreprise / Client *"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                      style={{ fontSize: '12px' }}
                    />
                    <input
                      placeholder="Secteur d'activité (ex: Fintech, BTP)"
                      value={newClientSector}
                      onChange={(e) => setNewClientSector(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="inline-row">
                    <input
                      placeholder="Nom du contact"
                      value={newClientContact}
                      onChange={(e) => setNewClientContact(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                    <input
                      placeholder="E-mail"
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                  </div>
                  <div className="inline-row">
                    <input
                      placeholder="Téléphone"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      style={{ fontSize: '12px' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-dark"
                      disabled={savingNewClient}
                      style={{ height: '36px', fontSize: '11px' }}
                    >
                      {savingNewClient ? 'Création…' : 'Enregistrer et utiliser'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* AI Copilot Smart Generation Box */}
            <div className="ai-assistant-card">
              <div className="ai-assistant-header">
                <div className="ai-badge">
                  <Sparkles size={11} strokeWidth={2.2} />
                  <span>Copilote IA Gemini Pro</span>
                </div>
                <span className="ai-hint">Génération automatique des prestations, titre et conditions</span>
              </div>
              <div className="ai-input-row">
                <input
                  type="text"
                  placeholder="Décrivez votre projet (ex: Refonte UI/UX, dev mobile Flutter et support 3 mois)…"
                  value={aiBrief}
                  onChange={(e) => setAiBrief(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleGenerateWithAi();
                    }
                  }}
                  disabled={generatingWithAi}
                />
                <button
                  type="button"
                  className="btn btn-dark ai-generate-btn"
                  onClick={handleGenerateWithAi}
                  disabled={generatingWithAi}
                >
                  {generatingWithAi ? (
                    <>
                      <Loader2 size={13} className="spin" />
                      <span>Génération…</span>
                    </>
                  ) : (
                    <>
                      <Wand2 size={13} strokeWidth={2} />
                      <span>Remplir avec l’IA</span>
                    </>
                  )}
                </button>
              </div>
              {aiGeneratedData && (
                <div className="ai-success-note">
                  <CheckCircle2 size={13} strokeWidth={2.2} />
                  <span>
                    Prêt : {aiGeneratedData.lines?.length || aiGeneratedData.sections?.length || 0} prestations & conditions préremplies selon votre brief.
                  </span>
                </div>
              )}
            </div>

            {/* Document Title / Subject */}
            <div className="field">
              <label style={{ fontWeight: 700 }}>Objet / Titre du document *</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="ex : Proposition de services — Refonte digitale 2026"
                style={{ padding: '10px 12px', fontSize: '13px', background: '#fff' }}
              />
              <span style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>
                Ce titre apparaîtra en haut de la page A4 et dans vos listes de documents.
              </span>
            </div>

            {/* Dates row */}
            <div className="inline-row">
              <div className="field">
                <label style={{ fontWeight: 700 }}>Date d’émission</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  style={{ background: '#fff' }}
                />
              </div>

              {selectedType === 'quote' ? (
                <div className="field">
                  <label style={{ fontWeight: 700 }}>Validité de l’offre (jours)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value || 30))}
                    style={{ background: '#fff' }}
                  />
                </div>
              ) : selectedType === 'invoice' || selectedType === 'deposit' ? (
                <div className="field">
                  <label style={{ fontWeight: 700 }}>Date d’échéance</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{ background: '#fff' }}
                  />
                </div>
              ) : null}
            </div>

            {/* Wizard Actions */}
            <div className="wizard-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setStep(1)}
                disabled={creating}
              >
                ← Retour
              </button>
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleCreateDocument}
                disabled={creating || !selectedClientId}
                style={{ minWidth: '180px' }}
              >
                {creating ? 'Création en cours…' : 'Créer et ouvrir l’éditeur →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
