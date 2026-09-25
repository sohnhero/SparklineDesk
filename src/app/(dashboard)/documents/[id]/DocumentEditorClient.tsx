'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, BookOpen, UserPlus, Wand2, Loader2, CheckCircle2, Bot } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { TYPE_META, DocTypeKey } from '@/domains/documents/types';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { toast } from 'react-toastify';
import { calculateDocumentTotals } from '@/lib/utils/calculations';
import { formatMoney, uid } from '@/lib/utils/format';
import { useConfirm } from '@/components/ui/ConfirmDialog';

interface ClientItem {
  id: string;
  name: string;
  sector?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
}

interface DocumentEditorClientProps {
  initialDoc: any;
  clients: ClientItem[];
  catalog: CatalogItem[];
  company: any;
}

const COMMON_CONDITIONS = [
  '50% à la signature, solde à la livraison',
  'Paiement à réception sous 15 jours',
  'Acompte de 30% à la commande',
  'Paiement comptant à la livraison',
  'Règlement par Wave, Orange Money ou Virement',
];

const UNIT_OPTIONS = [
  { value: 'prestation', label: 'prestation' },
  { value: 'jour', label: 'jour(s)' },
  { value: 'heure', label: 'heure(s)' },
  { value: 'forfait', label: 'forfait' },
  { value: 'mois', label: 'mois' },
  { value: 'u', label: 'unité' },
];

export function DocumentEditorClient({
  initialDoc,
  clients: initialClients,
  catalog,
  company,
}: DocumentEditorClientProps) {
  const [doc, setDoc] = useState(initialDoc);
  const [clients, setClients] = useState<ClientItem[]>(initialClients);
  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content');
  const [mobileView, setMobileView] = useState<'form' | 'preview'>('form');
  const [zoom, setZoom] = useState(0.8);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const router = useRouter();
  const { confirm } = useConfirm();
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('all');

  // Inline Client Creation in Editor
  const [showInlineClientForm, setShowInlineClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [savingClient, setSavingClient] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const meta = TYPE_META[doc.type as DocTypeKey] || TYPE_META.quote;
  const isFinancial = meta.kind === 'financial';
  const selectedClient = clients.find((c) => c.id === doc.clientId);

  const markDirty = useCallback(() => {
    setSaveStatus('dirty');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    // Autosave debounced by 2.5 seconds
    saveTimeoutRef.current = setTimeout(() => {
      handleSave(false);
    }, 2500);
  }, [doc]);

  // AI Copilot States
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState(doc.title || '');
  const [aiTargetAction, setAiTargetAction] = useState<'all' | 'lines' | 'intro' | 'conditions'>('all');
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingAiField, setLoadingAiField] = useState<string | null>(null);

  // 1. Suggest Lines with AI
  const handleAiSuggestLines = async (customBrief?: string) => {
    setLoadingAi(true);
    setLoadingAiField('lines');
    try {
      const subject = customBrief || doc.title || 'Prestations de services professionnelles';
      const res = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'lines',
          subject,
          clientId: doc.clientId,
          count: 3,
        }),
      });
      if (!res.ok) throw new Error('Erreur génération lignes');
      const data = await res.json();
      if (data.lines && data.lines.length > 0) {
        const formatted = data.lines.map((l: any, i: number) => ({
          id: uid(),
          name: l.name,
          description: l.description,
          qty: Number(l.qty) || 1,
          price: Number(l.price) || 0,
          unit: 'prestation',
          position: (doc.lines?.length || 0) + i,
        }));

        const isCurrentEmpty =
          doc.lines.length === 1 &&
          (!doc.lines[0].name || doc.lines[0].name === 'Prestation') &&
          Number(doc.lines[0].price) === 0;

        const newLines = isCurrentEmpty ? formatted : [...(doc.lines || []), ...formatted];
        setDoc((prev: any) => ({ ...prev, lines: newLines }));
        markDirty();
        toast.success(`${formatted.length} prestations générées par l’IA Gemini Pro !`);
      }
    } catch {
      toast.success('Impossible de générer les prestations avec l’IA.');
    } finally {
      setLoadingAi(false);
      setLoadingAiField(null);
    }
  };

  // 2. Generate or Enhance Intro with AI
  const handleAiGenerateIntro = async () => {
    setLoadingAi(true);
    setLoadingAiField('intro');
    try {
      if (doc.intro && doc.intro.trim().length > 10) {
        const res = await fetch('/api/ai/autocomplete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'enhance',
            text: doc.intro,
            context: `Introduction pour le document ${doc.title} destiné à ${selectedClient?.name || 'le client'}`,
          }),
        });
        if (!res.ok) throw new Error('Erreur amélioration');
        const data = await res.json();
        if (data.enhanced) {
          setDoc((prev: any) => ({ ...prev, intro: data.enhanced }));
          markDirty();
          toast.success('Introduction améliorée avec l’IA !');
        }
      } else {
        const res = await fetch('/api/ai/document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            docType: doc.type,
            brief: doc.title,
            clientId: doc.clientId,
          }),
        });
        if (!res.ok) throw new Error('Erreur génération');
        const data = await res.json();
        if (data.document?.intro) {
          setDoc((prev: any) => ({ ...prev, intro: data.document.intro }));
          markDirty();
          toast.success('Introduction rédigée par l’IA Gemini Pro !');
        }
      }
    } catch {
      toast.success('Impossible de rédiger l’introduction avec l’IA.');
    } finally {
      setLoadingAi(false);
      setLoadingAiField(null);
    }
  };

  // 3. Generate Conditions with AI
  const handleAiGenerateConditions = async () => {
    setLoadingAi(true);
    setLoadingAiField('conditions');
    try {
      const res = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'conditions',
          docType: doc.type,
          clientId: doc.clientId,
        }),
      });
      if (!res.ok) throw new Error('Erreur conditions');
      const data = await res.json();
      if (data.conditions) {
        setDoc((prev: any) => ({ ...prev, conditions: data.conditions }));
        markDirty();
        toast.success('Conditions de règlement rédigées avec l’IA !');
      }
    } catch {
      toast.success('Impossible de générer les conditions avec l’IA.');
    } finally {
      setLoadingAi(false);
      setLoadingAiField(null);
    }
  };

  // 4. Generate Section for Proposals/Contracts with AI
  const handleAiWriteSection = async (sectionIdx: number) => {
    const sec = doc.sections[sectionIdx];
    if (!sec) return;
    setLoadingAi(true);
    setLoadingAiField(`section-${sectionIdx}`);
    try {
      const res = await fetch('/api/ai/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance',
          text: sec.content || sec.title,
          context: `Section "${sec.title}" pour le document ${doc.title} (${doc.type}) destiné à ${selectedClient?.name || 'le client'}`,
          instruction: 'Rédiger une section complète, détaillée et structurée avec puces (-) ou paragraphes professionnels',
        }),
      });
      if (!res.ok) throw new Error('Erreur section');
      const data = await res.json();
      if (data.enhanced) {
        updateSection(sectionIdx, 'content', data.enhanced);
        toast.success(`Section "${sec.title}" rédigée avec l’IA !`);
      }
    } catch {
      toast.success('Impossible de rédiger la section avec l’IA.');
    } finally {
      setLoadingAi(false);
      setLoadingAiField(null);
    }
  };

  // 5. Full Document Generation from modal
  const handleAiFullModalSubmit = async () => {
    if (!aiCustomPrompt.trim()) {
      toast.success('Veuillez décrire le besoin ou le sujet de la mission.');
      return;
    }
    setLoadingAi(true);
    try {
      if (aiTargetAction === 'lines') {
        await handleAiSuggestLines(aiCustomPrompt);
        setShowAiModal(false);
        return;
      }

      const res = await fetch('/api/ai/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType: doc.type,
          brief: aiCustomPrompt,
          clientId: doc.clientId,
        }),
      });
      if (!res.ok) throw new Error('Erreur IA');
      const data = await res.json();
      if (data.document) {
        const d = data.document;
        setDoc((prev: any) => {
          const updated: any = { ...prev };
          if (d.title) updated.title = d.title;
          if (d.intro) updated.intro = d.intro;
          if (d.conditions) updated.conditions = d.conditions;
          if (d.notes) updated.notes = d.notes;

          if (isFinancial && d.lines && d.lines.length > 0) {
            updated.lines = d.lines.map((l: any, idx: number) => ({
              id: uid(),
              name: l.name,
              description: l.description,
              qty: Number(l.qty) || 1,
              price: Number(l.price) || 0,
              unit: 'prestation',
              position: idx,
            }));
          } else if (!isFinancial && d.sections && d.sections.length > 0) {
            updated.sections = d.sections.map((s: any, idx: number) => ({
              id: uid(),
              title: s.title,
              content: s.content,
              sectionType: s.sectionType || 'standard',
              position: idx,
            }));
          }
          return updated;
        });
        markDirty();
        toast.success('Document entièrement complété par l’IA Gemini Pro !');
        setShowAiModal(false);
      }
    } catch {
      toast.success('Impossible de générer le document avec l’IA.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSave = async (showNotification = true) => {
    if (!doc.clientId) {
      if (showNotification) toast.success('Veuillez sélectionner un client.');
      return;
    }

    setSaveStatus('saving');
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });

      if (!res.ok) throw new Error('Erreur de sauvegarde');
      setSaveStatus('saved');
      if (showNotification) toast.success('Document enregistré.');
    } catch {
      setSaveStatus('dirty');
      if (showNotification) toast.success('Erreur lors de la sauvegarde.');
    }
  };

  const handleDuplicate = async () => {
    await handleSave(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Échec duplication');
      const data = await res.json();
      toast.success('Document dupliqué avec succès.');
      router.push(`/documents/${data.document.id}`);
    } catch {
      toast.success('Erreur lors de la duplication');
    }
  };

  const handleConvertToInvoice = async () => {
    await handleSave(false);
    try {
      const res = await fetch(`/api/documents/${doc.id}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType: 'invoice' }),
      });
      if (!res.ok) throw new Error('Échec conversion');
      const data = await res.json();
      toast.success('Devis converti en Facture avec succès !');
      router.push(`/documents/${data.document.id}`);
    } catch {
      toast.success('Erreur lors de la conversion');
    }
  };

  const handleExportPDF = () => {
    window.open(`/api/pdf/${doc.id}`, '_blank');
  };

  const handlePrint = () => {
    const previewEl = document.getElementById('documentPreview');
    if (!previewEl) return;

    // Clone and strip the zoom transform
    const clone = previewEl.cloneNode(true) as HTMLElement;
    clone.style.transform = 'none';
    clone.style.webkitTransform = 'none';
    clone.style.width = '210mm';
    clone.style.minHeight = 'auto';
    clone.style.boxShadow = 'none';
    clone.style.margin = '0';
    clone.style.padding = '0';

    // Create a wrapper injected directly as body child
    const wrapper = document.createElement('div');
    wrapper.id = '__sparkline_print__';
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    window.print();

    // Cleanup immediately after (synchronous in most browsers)
    document.body.removeChild(wrapper);
  };

  const handleClose = async () => {
    if (saveStatus === 'dirty') {
      const confirmed = await confirm({
        title: 'Modifications non enregistrées',
        description: 'Voulez-vous vraiment quitter l’éditeur sans enregistrer vos modifications récentes ?',
        highlight: doc.reference,
        confirmText: 'Quitter sans enregistrer',
        cancelText: 'Continuer l’édition',
        variant: 'warning',
        icon: 'warning',
      });
      if (!confirmed) return;
    }
    router.push('/documents');
  };

  // Keyboard shortcut Cmd/Ctrl + S and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave(true);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc, saveStatus]);

  // Financial line mutations
  const updateLine = (idx: number, field: string, value: any) => {
    const lines = [...doc.lines];
    lines[idx] = { ...lines[idx], [field]: value };
    setDoc({ ...doc, lines });
    markDirty();
  };

  const addLine = () => {
    setDoc({
      ...doc,
      lines: [
        ...doc.lines,
        { id: uid(), name: 'Nouvelle prestation', description: '', qty: 1, price: 0, unit: 'prestation' },
      ],
    });
    markDirty();
  };

  const removeLine = (idx: number) => {
    const lines = doc.lines.filter((_: any, i: number) => i !== idx);
    setDoc({ ...doc, lines });
    markDirty();
  };

  const duplicateLine = (idx: number) => {
    const lineToCopy = doc.lines[idx];
    const lines = [...doc.lines];
    lines.splice(idx + 1, 0, {
      ...lineToCopy,
      id: uid(),
      name: `${lineToCopy.name} (copie)`,
    });
    setDoc({ ...doc, lines });
    markDirty();
    toast.success('Ligne dupliquée.');
  };

  const moveLine = (idx: number, delta: number) => {
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= doc.lines.length) return;
    const lines = [...doc.lines];
    const temp = lines[idx];
    lines[idx] = lines[targetIdx];
    lines[targetIdx] = temp;
    setDoc({ ...doc, lines });
    markDirty();
  };

  const addCatalogItemToLines = (item: CatalogItem) => {
    setDoc({
      ...doc,
      lines: [
        ...doc.lines,
        {
          id: uid(),
          name: item.name,
          description: item.description,
          qty: 1,
          price: item.price,
          unit: item.unit || 'prestation',
        },
      ],
    });
    setShowCatalogModal(false);
    markDirty();
    toast.success(`« ${item.name} » ajouté.`);
  };

  // Section mutations for proposals
  const updateSection = (idx: number, field: string, value: any) => {
    const sections = [...doc.sections];
    sections[idx] = { ...sections[idx], [field]: value };
    setDoc({ ...doc, sections });
    markDirty();
  };

  const addSection = () => {
    setDoc({
      ...doc,
      sections: [
        ...doc.sections,
        { id: uid(), title: 'Nouvelle section', content: 'Contenu de la section...' },
      ],
    });
    markDirty();
  };

  const removeSection = (idx: number) => {
    const sections = doc.sections.filter((_: any, i: number) => i !== idx);
    setDoc({ ...doc, sections });
    markDirty();
  };

  const moveSection = (idx: number, delta: number) => {
    const targetIdx = idx + delta;
    if (targetIdx < 0 || targetIdx >= doc.sections.length) return;
    const sections = [...doc.sections];
    const temp = sections[idx];
    sections[idx] = sections[targetIdx];
    sections[targetIdx] = temp;
    setDoc({ ...doc, sections });
    markDirty();
  };

  // Inline client creation handler
  const handleSaveInlineClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.success('Le nom du client est obligatoire.');
      return;
    }
    setSavingClient(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName.trim(),
          contactName: newClientContact.trim() || undefined,
          email: newClientEmail.trim() || undefined,
          phone: newClientPhone.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error('Erreur création client');
      const data = await res.json();
      setClients((prev) => [data.client, ...prev]);
      setDoc({ ...doc, clientId: data.client.id });
      setShowInlineClientForm(false);
      setNewClientName('');
      setNewClientContact('');
      setNewClientEmail('');
      setNewClientPhone('');
      markDirty();
      toast.success(`Client « ${data.client.name} » créé.`);
    } catch {
      toast.success('Impossible de créer le client.');
    } finally {
      setSavingClient(false);
    }
  };

  const totals = isFinancial
    ? calculateDocumentTotals({
        items: doc.lines,
        discount: doc.discountPercent,
        taxRate: doc.taxRate,
        deposit: doc.depositAmount,
      })
    : null;

  // Filter catalog
  const catalogCategories = Array.from(new Set(catalog.map((i) => i.category)));
  const filteredCatalog = catalog.filter((item) => {
    if (catalogCategory !== 'all' && item.category !== catalogCategory) return false;
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <section className="editor-shell" id="documentEditor">
      {/* Topbar */}
      <header className="editor-topbar">
        <div className="editor-topbar-left">
          <button
            type="button"
            className="icon-button"
            id="closeEditorBtn"
            onClick={handleClose}
            title="Retour aux documents"
          >
            ←
          </button>
          <div>
            <span className="editor-badge" id="editorTypeBadge">
              {meta.label.toUpperCase()}
            </span>
            <strong id="editorReference">{doc.reference}</strong>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="editor-view-toggle">
          <button
            type="button"
            className={mobileView === 'form' ? 'active' : ''}
            onClick={() => setMobileView('form')}
          >
            Formulaire
          </button>
          <button
            type="button"
            className={mobileView === 'preview' ? 'active' : ''}
            onClick={() => setMobileView('preview')}
          >
            Aperçu A4
          </button>
        </div>

        {/* Editor Actions */}
        <div className="editor-actions">
          <span
            className={`autosave ${saveStatus === 'saving' || saveStatus === 'dirty' ? 'saving' : ''}`}
            id="autosaveIndicator"
          >
            {saveStatus === 'saving'
              ? '● Enregistrement…'
              : saveStatus === 'dirty'
              ? '● Prêt à enregistrer (⌘S)'
              : '● Enregistré'}
          </span>

          {doc.type === 'quote' && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleConvertToInvoice}
              title="Créer une facture à partir de ce devis"
              style={{ borderColor: 'var(--orange)', color: '#b76718' }}
            >
              Convertir en facture →
            </button>
          )}

          <button
            type="button"
            className="btn btn-ai-copilot"
            onClick={() => {
              setAiCustomPrompt(doc.title || '');
              setShowAiModal(true);
            }}
            title="Assistant IA Gemini Pro pour compléter et rédiger votre document"
          >
            <Bot size={13} strokeWidth={2.2} />
            <span>Assistant IA</span>
          </button>

          <button
            type="button"
            className="btn btn-outline"
            id="duplicateDocBtn"
            onClick={handleDuplicate}
          >
            Dupliquer
          </button>
          <button
            type="button"
            className="btn btn-outline"
            id="printDocBtn"
            onClick={handlePrint}
          >
            Imprimer / PDF
          </button>
          <button
            type="button"
            className="btn btn-dark"
            id="saveDocBtn"
            onClick={() => handleSave(true)}
          >
            Enregistrer
          </button>
        </div>
      </header>

      {/* Editor Body */}
      <div className={`editor-layout ${mobileView === 'preview' ? 'show-mobile-preview' : ''}`}>
        {/* Left Form Pane (Now with guaranteed scroll) */}
        <aside className="editor-form-pane">
          <div className="editor-tabs">
            <button
              type="button"
              className={`editor-tab ${activeTab === 'content' ? 'active' : ''}`}
              onClick={() => setActiveTab('content')}
            >
              Contenu
            </button>
            <button
              type="button"
              className={`editor-tab ${activeTab === 'style' ? 'active' : ''}`}
              onClick={() => setActiveTab('style')}
            >
              Options
            </button>
          </div>

          <form id="documentForm" onSubmit={(e) => e.preventDefault()}>
            {activeTab === 'content' ? (
              <>
                {/* Document Information Section */}
                <section className="form-section">
                  <div className="form-section-head">
                    <h3>Document</h3>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ margin: 0 }}>Client *</label>
                        <button
                          type="button"
                          className="text-button"
                          style={{ fontSize: '10px', color: 'var(--orange)', fontWeight: 700 }}
                          onClick={() => setShowInlineClientForm(!showInlineClientForm)}
                        >
                          {showInlineClientForm ? (
                            'Annuler'
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserPlus size={12} strokeWidth={2.2} /> Nouveau client
                            </span>
                          )}
                        </button>
                      </div>

                      {!showInlineClientForm ? (
                        <select
                          value={doc.clientId}
                          onChange={(e) => {
                            setDoc({ ...doc, clientId: e.target.value });
                            markDirty();
                          }}
                        >
                          <option value="">— Sélectionner un client —</option>
                          {clients.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name} {c.sector ? `(${c.sector})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          style={{
                            background: '#fafaf8',
                            border: '1px solid #e0e0dc',
                            borderRadius: '8px',
                            padding: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px',
                            marginTop: '6px',
                          }}
                        >
                          <input
                            placeholder="Nom de l'entreprise *"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            style={{ fontSize: '11px' }}
                          />
                          <div className="inline-row">
                            <input
                              placeholder="Contact"
                              value={newClientContact}
                              onChange={(e) => setNewClientContact(e.target.value)}
                              style={{ fontSize: '11px' }}
                            />
                            <input
                              placeholder="E-mail"
                              value={newClientEmail}
                              onChange={(e) => setNewClientEmail(e.target.value)}
                              style={{ fontSize: '11px' }}
                            />
                          </div>
                          <button
                            type="button"
                            className="btn btn-dark"
                            style={{ padding: '6px 10px', fontSize: '10px' }}
                            onClick={handleSaveInlineClient}
                            disabled={savingClient}
                          >
                            {savingClient ? 'Création…' : 'Créer et sélectionner'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="field">
                      <label>Référence</label>
                      <input
                        value={doc.reference}
                        onChange={(e) => {
                          setDoc({ ...doc, reference: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>

                    <div className="field">
                      <label>Objet / Titre</label>
                      <input
                        value={doc.title}
                        onChange={(e) => {
                          setDoc({ ...doc, title: e.target.value });
                          markDirty();
                        }}
                      />
                    </div>

                    <div className="inline-row">
                      <div className="field">
                        <label>Date</label>
                        <input
                          type="date"
                          value={doc.issueDate}
                          onChange={(e) => {
                            setDoc({ ...doc, issueDate: e.target.value });
                            markDirty();
                          }}
                        />
                      </div>

                      {doc.type === 'quote' ? (
                        <div className="field">
                          <label>Validité (jours)</label>
                          <input
                            type="number"
                            min="1"
                            value={doc.validityDays || 30}
                            onChange={(e) => {
                              setDoc({
                                ...doc,
                                validityDays: Number(e.target.value || 30),
                              });
                              markDirty();
                            }}
                          />
                        </div>
                      ) : isFinancial && ['invoice', 'deposit'].includes(doc.type) ? (
                        <div className="field">
                          <label>Échéance</label>
                          <input
                            type="date"
                            value={doc.dueDate || ''}
                            onChange={(e) => {
                              setDoc({ ...doc, dueDate: e.target.value });
                              markDirty();
                            }}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <label style={{ margin: 0 }}>Introduction</label>
                        <button
                          type="button"
                          className="ai-inline-btn"
                          onClick={handleAiGenerateIntro}
                          disabled={loadingAi}
                          title="Rédiger ou améliorer l'introduction avec l'IA Gemini Pro"
                        >
                          {loadingAiField === 'intro' ? (
                            <Loader2 size={11} className="spin" />
                          ) : (
                            <Wand2 size={11} strokeWidth={2.2} />
                          )}
                          <span>{doc.intro ? 'Améliorer avec l’IA' : 'Rédiger avec l’IA'}</span>
                        </button>
                      </div>
                      <textarea
                        value={doc.intro || ''}
                        onChange={(e) => {
                          setDoc({ ...doc, intro: e.target.value });
                          markDirty();
                        }}
                        placeholder="Texte d'introduction présentant l'objet de la prestation au client…"
                        rows={3}
                      />
                    </div>
                  </div>
                </section>

                {/* Financial Lines or Editorial Sections */}
                {isFinancial ? (
                  <>
                    <section className="form-section">
                      <div className="form-section-head">
                        <h3>Lignes ({doc.lines.length})</h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="ai-inline-btn"
                            onClick={() => handleAiSuggestLines()}
                            disabled={loadingAi}
                            title="Générer automatiquement des prestations avec l'IA Gemini Pro"
                          >
                            {loadingAiField === 'lines' ? (
                              <Loader2 size={11} className="spin" />
                            ) : (
                              <Wand2 size={11} strokeWidth={2.2} />
                            )}
                            <span>Suggérer avec l’IA</span>
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={() => setShowCatalogModal(true)}
                            title="Choisir parmi les prestations Sparkline"
                            style={{
                              color: 'var(--orange)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <BookOpen size={12} strokeWidth={2.2} />
                            <span>Catalogue</span>
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            onClick={addLine}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Plus size={13} strokeWidth={2.2} />
                            <span>Ajouter</span>
                          </button>
                        </div>
                      </div>

                      <div className="line-items" id="lineItemsEditor">
                        {doc.lines.map((line: any, idx: number) => {
                          const rowTotal = Number(line.qty || 0) * Number(line.price || 0);
                          return (
                            <div key={line.id || idx} className="line-item">
                              <div className="line-item-header">
                                <span className="line-item-num">#{idx + 1}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span className="line-item-row-total">
                                    {formatMoney(rowTotal, doc.currency || company.currency)}
                                  </span>
                                  <div className="line-controls">
                                    <button
                                      type="button"
                                      className="line-ctrl-btn"
                                      title="Monter"
                                      onClick={() => moveLine(idx, -1)}
                                      disabled={idx === 0}
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      className="line-ctrl-btn"
                                      title="Descendre"
                                      onClick={() => moveLine(idx, 1)}
                                      disabled={idx === doc.lines.length - 1}
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      className="line-ctrl-btn"
                                      title="Dupliquer la ligne"
                                      onClick={() => duplicateLine(idx)}
                                    >
                                      ⎘
                                    </button>
                                    <button
                                      type="button"
                                      className="remove-line"
                                      onClick={() => removeLine(idx)}
                                      title="Supprimer la ligne"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="line-item-grid">
                                <div className="field">
                                  <label>Prestation</label>
                                  <input
                                    value={line.name}
                                    onChange={(e) => updateLine(idx, 'name', e.target.value)}
                                  />
                                </div>

                                <div className="field">
                                  <label>Qté</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={line.qty}
                                    onChange={(e) =>
                                      updateLine(idx, 'qty', Number(e.target.value || 0))
                                    }
                                  />
                                </div>

                                <div className="field">
                                  <label>Prix unitaire ({doc.currency || company.currency})</label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={line.price}
                                    onChange={(e) =>
                                      updateLine(idx, 'price', Number(e.target.value || 0))
                                    }
                                  />
                                </div>
                              </div>

                              <div className="line-item-grid description-row" style={{ marginTop: '7px' }}>
                                <div className="field">
                                  <label>Description</label>
                                  <textarea
                                    value={line.description || ''}
                                    placeholder="Détail du livrable, spécifications ou périmètre…"
                                    onChange={(e) =>
                                      updateLine(idx, 'description', e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        className="add-line"
                        style={{
                          marginTop: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                        onClick={addLine}
                      >
                        <Plus size={14} strokeWidth={2.2} />
                        <span>Ajouter une nouvelle ligne</span>
                      </button>
                    </section>

                    {/* Calculation Section & Recap Card */}
                    <section className="form-section">
                      <div className="form-section-head">
                        <h3>Calcul & Totaux</h3>
                      </div>
                      <div className="inline-row">
                        <div className="field">
                          <label>Remise (%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={doc.discountPercent}
                            onChange={(e) => {
                              setDoc({
                                ...doc,
                                discountPercent: Number(e.target.value || 0),
                              });
                              markDirty();
                            }}
                          />
                        </div>
                        <div className="field">
                          <label>TVA (%)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={doc.taxRate}
                            onChange={(e) => {
                              setDoc({
                                ...doc,
                                taxRate: Number(e.target.value || 0),
                              });
                              markDirty();
                            }}
                          />
                        </div>
                      </div>

                      <div className="inline-row" style={{ marginTop: '10px' }}>
                        <div className="field">
                          <label>Acompte déjà versé ({doc.currency || company.currency})</label>
                          <input
                            type="number"
                            min="0"
                            value={doc.depositAmount}
                            onChange={(e) => {
                              setDoc({
                                ...doc,
                                depositAmount: Number(e.target.value || 0),
                              });
                              markDirty();
                            }}
                          />
                        </div>
                        <div className="field">
                          <label>Devise</label>
                          <input
                            value={doc.currency || company.currency}
                            onChange={(e) => {
                              setDoc({ ...doc, currency: e.target.value });
                              markDirty();
                            }}
                          />
                        </div>
                      </div>

                      {/* Recap Card */}
                      {totals && (
                        <div className="recap-card">
                          <div className="recap-row">
                            <span>Sous-total HT</span>
                            <strong>{formatMoney(totals.subtotal, company.currency)}</strong>
                          </div>
                          {totals.discountAmount > 0 && (
                            <div className="recap-row" style={{ color: '#ff8a7a' }}>
                              <span>Remise ({doc.discountPercent}%)</span>
                              <strong>-{formatMoney(totals.discountAmount, company.currency)}</strong>
                            </div>
                          )}
                          {doc.discountPercent > 0 && (
                            <div className="recap-row">
                              <span>Total HT remisé</span>
                              <span>{formatMoney(totals.netBeforeTax, company.currency)}</span>
                            </div>
                          )}
                          {totals.taxAmount > 0 && (
                            <div className="recap-row">
                              <span>TVA ({doc.taxRate}%)</span>
                              <span>+{formatMoney(totals.taxAmount, company.currency)}</span>
                            </div>
                          )}
                          {totals.depositAmount > 0 && (
                            <div className="recap-row" style={{ color: '#7ad9ff' }}>
                              <span>Acompte déduit</span>
                              <span>-{formatMoney(totals.depositAmount, company.currency)}</span>
                            </div>
                          )}
                          <div className="recap-row net">
                            <span>Total net à payer</span>
                            <span>{formatMoney(totals.totalToPay, company.currency)}</span>
                          </div>
                        </div>
                      )}
                    </section>
                  </>
                ) : (
                  /* Editorial Sections (Proposal, Contract, NDA) */
                  <section className="form-section">
                    <div className="form-section-head">
                      <h3>Sections ({doc.sections.length})</h3>
                      <button
                        type="button"
                        className="text-button"
                        onClick={addSection}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Plus size={13} strokeWidth={2.2} />
                        <span>Ajouter</span>
                      </button>
                    </div>
                    <div className="section-list" id="sectionEditor">
                      {doc.sections.map((section: any, idx: number) => (
                        <div key={section.id || idx} className="proposal-section-editor">
                          <div className="proposal-section-head">
                            <span className="drag-handle">⋮⋮</span>
                            <input
                              value={section.title}
                              onChange={(e) =>
                                updateSection(idx, 'title', e.target.value)
                              }
                            />
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <button
                                type="button"
                                className="ai-inline-btn"
                                onClick={() => handleAiWriteSection(idx)}
                                disabled={loadingAi}
                                title="Rédiger cette section avec l’IA Gemini Pro"
                                style={{ fontSize: '10px', padding: '2px 7px' }}
                              >
                                {loadingAiField === `section-${idx}` ? (
                                  <Loader2 size={10} className="spin" />
                                ) : (
                                  <Wand2 size={10} strokeWidth={2.2} />
                                )}
                                <span>Rédiger avec l’IA</span>
                              </button>
                              <button
                                type="button"
                                className="line-ctrl-btn"
                                title="Monter"
                                onClick={() => moveSection(idx, -1)}
                                disabled={idx === 0}
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                className="line-ctrl-btn"
                                title="Descendre"
                                onClick={() => moveSection(idx, 1)}
                                disabled={idx === doc.sections.length - 1}
                              >
                                ↓
                              </button>
                              <button
                                type="button"
                                className="remove-line"
                                onClick={() => removeSection(idx)}
                                title="Supprimer la section"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                          <div className="field">
                            <textarea
                              value={section.content}
                              onChange={(e) =>
                                updateSection(idx, 'content', e.target.value)
                              }
                              placeholder="Texte de la section (utilisez '- ' pour créer des listes à puces)"
                              rows={5}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Finalisation Section */}
                <section className="form-section">
                  <div className="form-section-head">
                    <h3>Finalisation</h3>
                  </div>
                  <div className="form-grid">
                    <div className="field">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ margin: 0 }}>Conditions & Modalités</label>
                        <button
                          type="button"
                          className="ai-inline-btn"
                          onClick={handleAiGenerateConditions}
                          disabled={loadingAi}
                          title="Générer des conditions idéales avec l’IA Gemini Pro"
                        >
                          {loadingAiField === 'conditions' ? (
                            <Loader2 size={11} className="spin" />
                          ) : (
                            <Wand2 size={11} strokeWidth={2.2} />
                          )}
                          <span>Rédiger avec l’IA</span>
                        </button>
                      </div>
                      <div className="chip-group">
                        {COMMON_CONDITIONS.map((chip, i) => (
                          <button
                            key={i}
                            type="button"
                            className="condition-chip"
                            onClick={() => {
                              const newCond = doc.conditions
                                ? `${doc.conditions}\n• ${chip}`
                                : `• ${chip}`;
                              setDoc({ ...doc, conditions: newCond });
                              markDirty();
                            }}
                          >
                            + {chip}
                          </button>
                        ))}
                      </div>
                      <textarea
                        value={doc.conditions || ''}
                        onChange={(e) => {
                          setDoc({ ...doc, conditions: e.target.value });
                          markDirty();
                        }}
                        placeholder="Ex : 50% à la commande, solde à la livraison…"
                        rows={3}
                      />
                    </div>

                    <div className="field">
                      <label>Note finale / Mentions</label>
                      <textarea
                        value={doc.notes || ''}
                        onChange={(e) => {
                          setDoc({ ...doc, notes: e.target.value });
                          markDirty();
                        }}
                        placeholder="Ex : Remerciements, coordonnées bancaires IBAN…"
                        rows={2}
                      />
                    </div>

                    <div className="field">
                      <label>Statut</label>
                      <select
                        value={doc.status}
                        onChange={(e) => {
                          setDoc({ ...doc, status: e.target.value });
                          markDirty();
                        }}
                        style={{ fontWeight: 700 }}
                      >
                        {['Brouillon', 'Envoyé', 'Accepté', 'Payé', 'Refusé', 'Expiré'].map(
                          (s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              /* Options Tab */
              <section className="form-section">
                <div className="form-section-head">
                  <h3>Affichage & Options</h3>
                </div>
                <div className="switch-row">
                  <div className="switch-copy">
                    <strong>Bloc signature</strong>
                    <span>Afficher la zone de signature en bas du document</span>
                  </div>
                  <button
                    type="button"
                    className={`toggle ${doc.options?.showSignature !== false ? 'active' : ''}`}
                    onClick={() => {
                      const opts = {
                        ...doc.options,
                        showSignature: doc.options?.showSignature === false,
                      };
                      setDoc({ ...doc, options: opts });
                      markDirty();
                    }}
                  />
                </div>

                {isFinancial && (
                  <div className="switch-row">
                    <div className="switch-copy">
                      <strong>Détail de TVA</strong>
                      <span>Afficher le sous-total et le calcul de TVA</span>
                    </div>
                    <button
                      type="button"
                      className={`toggle ${doc.options?.showTax ? 'active' : ''}`}
                      onClick={() => {
                        const opts = { ...doc.options, showTax: !doc.options?.showTax };
                        setDoc({ ...doc, options: opts });
                        markDirty();
                      }}
                    />
                  </div>
                )}

                {doc.type === 'proposal' && (
                  <div className="switch-row">
                    <div className="switch-copy">
                      <strong>Couverture éditoriale</strong>
                      <span>Utiliser une page d’ouverture plus visuelle</span>
                    </div>
                    <button
                      type="button"
                      className={`toggle ${doc.options?.coverPage !== false ? 'active' : ''}`}
                      onClick={() => {
                        const opts = {
                          ...doc.options,
                          coverPage: doc.options?.coverPage === false,
                        };
                        setDoc({ ...doc, options: opts });
                        markDirty();
                      }}
                    />
                  </div>
                )}

                <div style={{ marginTop: '24px' }}>
                  <div className="form-section-head">
                    <h3>Conseils Sparkline</h3>
                  </div>
                  <p className="muted" style={{ fontSize: '11px', lineHeight: 1.65 }}>
                    Le rendu reprend la direction visuelle Sparkline : noir, blanc,
                    orange, composition éditoriale et hiérarchie forte. Utilisez des
                    titres courts, des descriptions orientées bénéfices et des
                    conditions explicites.
                  </p>
                </div>
              </section>
            )}
          </form>

          {/* Sticky Bottom Save Bar for easy access without scrolling back */}
          <div className="editor-bottom-bar">
            <div>
              {totals ? (
                <span style={{ fontSize: '11px', fontWeight: 800 }}>
                  Net : <strong style={{ color: 'var(--orange)', fontSize: '13px' }}>{formatMoney(totals.totalToPay, company.currency)}</strong>
                </span>
              ) : (
                <span style={{ fontSize: '11px', color: '#777' }}>
                  {doc.title || 'Document'}
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-dark"
              style={{ padding: '8px 16px', fontSize: '11px' }}
              onClick={() => handleSave(true)}
            >
              Enregistrer (⌘S)
            </button>
          </div>
        </aside>

        {/* Right Preview Pane */}
        <main className="editor-preview-pane">
          <div className="preview-toolbar">
            <div className="zoom-group">
              <button
                type="button"
                className="icon-button small"
                id="zoomOutBtn"
                onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.05))}
                title="Zoom arrière"
                style={{ display: 'grid', placeItems: 'center' }}
              >
                <Minus size={13} strokeWidth={2.2} />
              </button>
              <span id="zoomLabel">{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="icon-button small"
                id="zoomInBtn"
                onClick={() => setZoom((prev) => Math.min(1.2, prev + 0.05))}
                title="Zoom avant"
                style={{ display: 'grid', placeItems: 'center' }}
              >
                <Plus size={13} strokeWidth={2.2} />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ height: '26px', padding: '0 8px', fontSize: '9px', marginLeft: '6px' }}
                onClick={() => setZoom(0.8)}
              >
                80%
              </button>
              <button
                type="button"
                className="btn btn-outline"
                style={{ height: '26px', padding: '0 8px', fontSize: '9px' }}
                onClick={() => setZoom(1.0)}
              >
                100%
              </button>
            </div>
            <span className="preview-hint">Aperçu A4 • mise à jour en direct</span>
          </div>

          <div className="preview-scroll">
            <DocumentPreview
              document={doc}
              client={selectedClient}
              company={company}
              zoom={zoom}
            />
          </div>
        </main>
      </div>

      {/* Catalog Insertion Modal */}
      {showCatalogModal && (
        <>
          <div
            className="modal-backdrop"
            onClick={() => setShowCatalogModal(false)}
          />
          <section className="modal compact-modal" aria-modal="true" role="dialog">
            <div className="modal-head">
              <div>
                <span className="section-kicker">CATALOGUE DE SERVICES</span>
                <h2>Insérer une prestation</h2>
              </div>
              <button
                type="button"
                className="icon-button modal-close"
                onClick={() => setShowCatalogModal(false)}
              >
                ×
              </button>
            </div>
            <p className="modal-intro">
              Sélectionnez une prestation du catalogue pour l’ajouter instantanément
              à ce document.
            </p>

            {/* Catalog Search & Category Filters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              <input
                type="search"
                placeholder="Rechercher une prestation…"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e0e0dc' }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`wizard-cat-tab ${catalogCategory === 'all' ? 'active' : ''}`}
                  onClick={() => setCatalogCategory('all')}
                >
                  Tous ({catalog.length})
                </button>
                {catalogCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`wizard-cat-tab ${catalogCategory === cat ? 'active' : ''}`}
                    onClick={() => setCatalogCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '8px',
                maxHeight: '360px',
                overflowY: 'auto',
              }}
            >
              {filteredCatalog.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
                  Aucune prestation trouvée.
                </div>
              ) : (
                filteredCatalog.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addCatalogItemToLines(item)}
                    style={{
                      border: '1px solid #e6e6e1',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                      background: '#fafaf8',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      transition: '0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.borderColor = '#111';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fafaf8';
                      e.currentTarget.style.borderColor = '#e6e6e1';
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          color: '#999',
                          fontWeight: 800,
                        }}
                      >
                        {item.category}
                      </span>
                      <strong
                        style={{ display: 'block', fontSize: '13px', marginTop: '2px' }}
                      >
                        {item.name}
                      </strong>
                      {item.description && (
                        <p
                          style={{
                            fontSize: '11px',
                            color: '#777',
                            margin: '4px 0 0 0',
                            lineHeight: 1.4,
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <strong style={{ fontSize: '13px', color: 'var(--orange)' }}>
                        {formatMoney(item.price, company.currency)}
                      </strong>
                      <span
                        style={{
                          display: 'block',
                          fontSize: '9px',
                          color: '#aaa',
                          marginTop: '2px',
                        }}
                      >
                        par {item.unit}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}

      {/* AI Assistant Modal (Gemini Pro) */}
      {showAiModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAiModal(false)}
          kicker="INTELLIGENCE ARTIFICIELLE GEMINI PRO"
          title="Assistant IA Sparkline Copilot"
          intro="Générez automatiquement des prestations réalistes, rédigez vos clauses ou complétez l'intégralité du document en quelques secondes."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="field">
              <label style={{ fontWeight: 700 }}>Que souhaitez-vous générer ?</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button
                  type="button"
                  className={`wizard-cat-tab ${aiTargetAction === 'all' ? 'active' : ''}`}
                  onClick={() => setAiTargetAction('all')}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  ✨ Tout le document
                </button>
                <button
                  type="button"
                  className={`wizard-cat-tab ${aiTargetAction === 'lines' ? 'active' : ''}`}
                  onClick={() => setAiTargetAction('lines')}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                >
                  📋 Prestations chiffrées
                </button>
              </div>
            </div>

            <div className="field">
              <label style={{ fontWeight: 700 }}>Contexte ou sujet de la mission *</label>
              <textarea
                value={aiCustomPrompt}
                onChange={(e) => setAiCustomPrompt(e.target.value)}
                placeholder="Ex : Refonte application mobile iOS/Android, intégration paiement Wave et formation de l'équipe…"
                rows={3}
                disabled={loadingAi}
                style={{ padding: '10px 12px', fontSize: '13px' }}
              />
              <span style={{ fontSize: '11px', color: '#71717a', marginTop: '4px' }}>
                Client sélectionné : <strong>{selectedClient?.name || 'Client à définir'}</strong> (Devise : {doc.currency || company.currency})
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAiModal(false)}
                disabled={loadingAi}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleAiFullModalSubmit}
                disabled={loadingAi || !aiCustomPrompt.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {loadingAi ? (
                  <>
                    <Loader2 size={13} className="spin" />
                    <span>Génération avec Gemini Pro…</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={13} strokeWidth={2} />
                    <span>{aiTargetAction === 'lines' ? 'Générer les prestations' : 'Générer le document'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
