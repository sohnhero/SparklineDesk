(() => {
  'use strict';

  const STORAGE_KEY = 'sparklineDesk.v1';
  const TYPE_META = {
    quote: { label: 'Devis', icon: 'DV', prefix: 'DEV', kind: 'financial', description: 'Chiffrage détaillé, validité, conditions et signature.' },
    invoice: { label: 'Facture', icon: 'FA', prefix: 'FAC', kind: 'financial', description: 'Facturation client, échéance et suivi du paiement.' },
    deposit: { label: "Facture d'acompte", icon: 'AC', prefix: 'ACP', kind: 'financial', description: "Demande d'acompte avant démarrage de mission." },
    credit: { label: 'Avoir', icon: 'AV', prefix: 'AVO', kind: 'financial', description: 'Correction ou annulation partielle d’une facture.' },
    proposal: { label: 'Proposition commerciale', icon: 'PC', prefix: 'PROP', kind: 'proposal', description: 'Offre structurée : contexte, objectifs, périmètre, budget.' },
    contract: { label: 'Contrat de prestation', icon: 'CT', prefix: 'CTR', kind: 'proposal', description: 'Cadre de collaboration, obligations et modalités.' },
    nda: { label: 'Accord de confidentialité', icon: 'NC', prefix: 'NDA', kind: 'proposal', description: 'NDA simple pour protéger les informations échangées.' },
    order: { label: 'Bon de commande', icon: 'BC', prefix: 'BDC', kind: 'financial', description: 'Commande formalisée avec lignes et montant total.' },
    delivery: { label: 'Bon de livraison', icon: 'BL', prefix: 'BL', kind: 'financial', description: 'Récapitulatif des livrables remis au client.' },
    report: { label: 'Compte rendu / PV', icon: 'PV', prefix: 'PV', kind: 'proposal', description: 'Décisions, actions, responsables et échéances.' }
  };

  const DEFAULT_COMPANY = {
    name: 'Sparkline',
    legalName: 'Sparkline — Digital Solutions',
    email: 'sparkline221@gmail.com',
    phone: '+221 78 942 24 23',
    website: 'www.sparkline.sn',
    city: 'Dakar',
    country: 'Sénégal',
    address: 'Dakar, Sénégal',
    currency: 'FCFA',
    taxRate: 0,
    paymentTerms: '50% à la signature, solde avant livraison',
    quoteValidity: 30,
    footerNote: 'Concevoir la nouvelle ère du numérique.'
  };

  const seedClients = [
    { id: uid(), name: 'FIDÈLE SARL', sector: 'BTP & Ingénierie', contact: '', email: '', phone: '', address: 'Dakar, Sénégal', notes: 'Client communication & présence digitale.' },
    { id: uid(), name: 'Baraka', sector: 'E-commerce & High-Tech', contact: '', email: '', phone: '', address: 'Dakar, Sénégal', notes: '' },
    { id: uid(), name: 'MBOR Store', sector: 'Retail & Sportswear', contact: '', email: '', phone: '', address: 'Dakar, Sénégal', notes: '' }
  ];

  const fideleId = seedClients[0].id;
  const today = new Date();
  const seedDocuments = [
    {
      id: uid(), type: 'quote', reference: '2026-FIDELE-001', status: 'Envoyé', clientId: fideleId,
      title: 'Communication & Réseaux Sociaux', date: '2026-09-05', dueDate: '', validity: 30,
      intro: 'Prestations proposées pour renforcer la présence digitale de FIDÈLE SARL.',
      items: [
        { id: uid(), name: 'Séance Shooting Professionnel', description: 'Photos professionnelles sur le terrain + 3 vidéos de présentation des services (retouche et édition incluses)', qty: 1, price: 80000 },
        { id: uid(), name: 'Gestion Réseaux Sociaux', description: 'Création pages • Production contenu (12–15 posts) • Stories • Suivi engagement • Rapports mensuels — engagement initial 3 mois', qty: 3, price: 100000 }
      ],
      discount: 0, taxRate: 0, deposit: 0,
      conditions: 'Contrat Réseaux : 3 mois renouvelable par tacite reconduction\nDélai shooting : à convenir conjointement\nLancement réseaux : 5 jours ouvrables après signature\nPaiement : 50% acompte à la signature, solde avant livraison',
      notes: '', updatedAt: '2026-09-05T10:00:00Z', createdAt: '2026-09-05T10:00:00Z', options: { showSignature: true, showTax: false }
    },
    {
      id: uid(), type: 'proposal', reference: 'PROP-2026-FIDELE-001', status: 'Accepté', clientId: fideleId,
      title: 'Offre Défi — Communication & Réseaux Sociaux', date: '2026-09-05', dueDate: '', validity: 30,
      intro: "Fidèle SARL souhaite renforcer sa présence digitale et sa visibilité auprès de ses clients. Cette proposition combine contenu visuel professionnel et stratégie de présence en ligne.",
      sections: [
        { id: uid(), title: 'Objectif', content: 'Créer une présence digitale professionnelle et attractive pour Fidèle SARL : valoriser les réalisations et services terrain, animer les réseaux sociaux de manière stratégique et transformer la visibilité en opportunités commerciales.' },
        { id: uid(), title: 'Offre 1 — Séance Shooting Professionnel', content: '- Shooting photos d’au moins ½ journée sur le terrain\n- Capture des équipes et chantiers en situation réelle\n- Production de 3 vidéos de présentation (30–60 sec)\n- Retouche et édition professionnelle\n- Livraison des fichiers HD prêts pour les réseaux sociaux\n\nBudget : 80 000 FCFA' },
        { id: uid(), title: 'Offre 2 — Gestion Réseaux Sociaux', content: '- Création et configuration des pages professionnelles\n- Identité visuelle cohérente\n- 12–15 posts par mois\n- Stories 3–4 fois par semaine\n- Réponse aux commentaires et messages\n- Analytics, engagement et rapport mensuel\n\nBudget : 100 000 FCFA / mois — engagement initial 3 mois' },
        { id: uid(), title: 'Bonus inclus', content: '- Consultation stratégique initiale\n- Plan de contenu adapté au secteur\n- Support et conseils techniques\n- Accompagnement à la transition du site vers les réseaux' },
        { id: uid(), title: 'Conditions particulières', content: '- Engagement initial de 3 mois renouvelable\n- Résiliation avec préavis écrit\n- Shooting planifié après signature\n- 50% d’acompte à la signature, solde avant livraison' }
      ],
      items: [], discount: 0, taxRate: 0, deposit: 0, conditions: '', notes: 'Nous restons à votre disposition pour tout ajustement.',
      updatedAt: '2026-09-06T09:00:00Z', createdAt: '2026-09-05T09:00:00Z', options: { showSignature: true, coverPage: true }
    },
    {
      id: uid(), type: 'invoice', reference: 'FAC-2026-009', status: 'Payé', clientId: seedClients[1].id,
      title: 'Conception & développement plateforme', date: '2026-09-10', dueDate: '2026-09-20', validity: 0,
      intro: 'Facturation du lot livré et validé.',
      items: [{ id: uid(), name: 'Développement interface web', description: 'Lot UI/UX & intégration front-end', qty: 1, price: 450000 }],
      discount: 0, taxRate: 0, deposit: 0, conditions: 'Paiement par virement ou Wave/Orange Money.', notes: '', updatedAt: '2026-09-20T12:00:00Z', createdAt: '2026-09-10T12:00:00Z', options: { showSignature: false, showTax: false }
    },
    {
      id: uid(), type: 'invoice', reference: 'FAC-2026-010', status: 'Envoyé', clientId: seedClients[2].id,
      title: 'Maintenance & optimisation', date: '2026-09-18', dueDate: '2026-09-30', validity: 0,
      intro: 'Maintenance applicative et optimisation des performances.',
      items: [{ id: uid(), name: 'Forfait maintenance', description: 'Correctifs, suivi et optimisation', qty: 1, price: 250000 }],
      discount: 0, taxRate: 0, deposit: 0, conditions: 'Paiement à réception.', notes: '', updatedAt: '2026-09-18T08:30:00Z', createdAt: '2026-09-18T08:30:00Z', options: { showSignature: false, showTax: false }
    }
  ];

  const defaultState = {
    company: DEFAULT_COMPANY,
    clients: seedClients,
    documents: seedDocuments,
    settings: { autoNumber: true, showLogo: true, defaultStatus: 'Brouillon', dateFormat: 'fr-FR' }
  };

  let state = loadState();
  let activeView = 'dashboard';
  let editingDocument = null;
  let editingClientId = null;
  let editorZoom = .80;
  let editorTab = 'content';
  let saveTimer = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-5); }
  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function esc(value = '') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
  function nl2br(value = '') { return esc(value).replace(/\n/g, '<br>'); }
  function parseDate(value) { if (!value) return null; const d = new Date(value + (value.length === 10 ? 'T12:00:00' : '')); return Number.isNaN(d.getTime()) ? null : d; }
  function formatDate(value) { const d = parseDate(value); return d ? new Intl.DateTimeFormat('fr-FR', { day:'2-digit', month:'2-digit', year:'numeric' }).format(d) : '—'; }
  function formatMoney(value, currency = state.company.currency || 'FCFA') {
    const num = Number(value || 0);
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(num).replace(/\u202f/g,' ') + ' ' + currency;
  }
  function initials(name='') { return name.split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join('').toUpperCase() || 'CL'; }
  function clientById(id) { return state.clients.find(c => c.id === id); }
  function docTotal(doc) {
    const subtotal = (doc.items || []).reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
    const afterDiscount = subtotal * (1 - Number(doc.discount || 0) / 100);
    const tax = afterDiscount * Number(doc.taxRate || 0) / 100;
    return Math.max(0, afterDiscount + tax - Number(doc.deposit || 0));
  }
  function docGross(doc) {
    const subtotal = (doc.items || []).reduce((sum, item) => sum + Number(item.qty || 0) * Number(item.price || 0), 0);
    const afterDiscount = subtotal * (1 - Number(doc.discount || 0) / 100);
    return afterDiscount + afterDiscount * Number(doc.taxRate || 0) / 100;
  }
  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(defaultState);
      const parsed = JSON.parse(raw);
      return { ...clone(defaultState), ...parsed, company: { ...DEFAULT_COMPANY, ...(parsed.company || {}) }, settings: { ...defaultState.settings, ...(parsed.settings || {}) } };
    } catch { return clone(defaultState); }
  }

  function toast(message, type='success') {
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    node.textContent = message;
    $('#toastStack').appendChild(node);
    setTimeout(() => node.remove(), 2800);
  }

  function setView(view) {
    activeView = view;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === `view-${view}`));
    $$('.nav-item[data-view]').forEach(n => n.classList.toggle('active', n.dataset.view === view));
    const labels = {
      dashboard:['ESPACE DE PILOTAGE', "Vue d'ensemble"], documents:['BIBLIOTHÈQUE', 'Documents'], clients:['CRM LÉGER', 'Clients'], templates:['BIBLIOTHÈQUE', 'Modèles'], finance:['SUIVI', 'Finance'], settings:['CONFIGURATION', 'Paramètres']
    };
    $('#pageEyebrow').textContent = labels[view][0]; $('#pageTitle').textContent = labels[view][1];
    document.body.scrollTop = 0; document.documentElement.scrollTop = 0;
    renderCurrentView();
    $('#sidebar').classList.remove('open');
  }

  function renderCurrentView() {
    updateCounts();
    if (activeView === 'dashboard') renderDashboard();
    if (activeView === 'documents') renderDocuments();
    if (activeView === 'clients') renderClients();
    if (activeView === 'templates') renderTemplates();
    if (activeView === 'finance') renderFinance();
    if (activeView === 'settings') renderSettings();
  }

  function updateCounts() {
    $('#documentsCount').textContent = state.documents.length;
    $('#clientsCount').textContent = state.clients.length;
  }

  function renderDashboard() {
    const invoices = state.documents.filter(d => ['invoice','deposit'].includes(d.type));
    const paid = invoices.filter(d => d.status === 'Payé').reduce((s,d)=>s+docGross(d),0);
    const pending = invoices.filter(d => d.status === 'Envoyé').reduce((s,d)=>s+docGross(d),0);
    const accepted = state.documents.filter(d => d.status === 'Accepté').length;
    const stats = [
      ['Documents', state.documents.length, 'Tous formats confondus', '▤', ''],
      ['Clients', state.clients.length, 'Fiches enregistrées', '◉', ''],
      ['Encaissé', formatMoney(paid), 'Factures marquées payées', '↗', 'green'],
      ['À encaisser', formatMoney(pending), `${accepted} proposition(s) acceptée(s)`, '₣', 'orange']
    ];
    $('#statsGrid').innerHTML = stats.map(s => `<article class="stat-card"><div><div class="stat-label">${esc(s[0])}</div><div class="stat-value">${esc(s[1])}</div><div class="stat-sub">${esc(s[2])}</div></div><div class="stat-icon ${s[4]}">${s[3]}</div></article>`).join('');

    const recent = [...state.documents].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).slice(0,6);
    $('#recentDocumentsBody').innerHTML = recent.map(documentRowCompact).join('') || `<tr><td colspan="6" class="muted">Aucun document.</td></tr>`;

    const pendingDocs = invoices.filter(d => d.status !== 'Payé' && d.status !== 'Refusé').sort((a,b)=>(parseDate(a.dueDate)?.getTime()||Infinity)-(parseDate(b.dueDate)?.getTime()||Infinity)).slice(0,4);
    $('#paymentFollowup').innerHTML = pendingDocs.length ? pendingDocs.map(d => {
      const client = clientById(d.clientId);
      return `<div class="followup-item"><div class="followup-top"><span class="followup-name">${esc(client?.name || 'Client')}</span><span class="followup-amount">${formatMoney(docGross(d))}</span></div><div class="followup-meta">${esc(d.reference)} • échéance ${formatDate(d.dueDate)}</div></div>`;
    }).join('') : `<div class="empty-state" style="padding:28px 8px"><div class="empty-icon">✓</div><h3>Tout est à jour</h3><p>Aucun paiement à relancer.</p></div>`;

    $('#quickCreateGrid').innerHTML = Object.entries(TYPE_META).slice(0,6).map(([key,meta]) => `<button class="quick-card" data-create-type="${key}"><div class="q-icon">${meta.icon}</div><strong>${esc(meta.label)}</strong><span>${esc(meta.description)}</span></button>`).join('');
    bindDocumentRows();
    $$('[data-create-type]').forEach(btn => btn.onclick = () => createDocument(btn.dataset.createType));
  }

  function documentRowCompact(d) {
    const client = clientById(d.clientId);
    const amount = TYPE_META[d.type]?.kind === 'financial' ? formatMoney(docGross(d)) : '—';
    return `<tr data-doc-id="${d.id}"><td><div class="doc-main"><div class="doc-icon">${TYPE_META[d.type]?.icon || 'DO'}</div><div><div class="doc-title">${esc(d.title || TYPE_META[d.type]?.label)}</div><div class="doc-sub">${esc(d.reference)}</div></div></div></td><td>${esc(client?.name || '—')}</td><td class="amount-cell">${amount}</td><td><span class="status-pill ${esc(d.status)}">${esc(d.status)}</span></td><td class="muted">${formatDate((d.updatedAt||'').slice(0,10))}</td><td><div class="row-actions"><button class="mini-action" data-edit-doc="${d.id}" title="Ouvrir">↗</button></div></td></tr>`;
  }

  function renderDocuments() {
    const typeSelect = $('#documentTypeFilter');
    if (typeSelect.options.length === 1) typeSelect.insertAdjacentHTML('beforeend', Object.entries(TYPE_META).map(([k,m])=>`<option value="${k}">${esc(m.label)}</option>`).join(''));
    const typeFilter = typeSelect.value;
    const statusFilter = $('#documentStatusFilter').value;
    const q = $('#documentsSearch').value.trim().toLowerCase();
    const docs = [...state.documents].sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt)).filter(d => {
      const client = clientById(d.clientId);
      const text = `${d.reference} ${d.title} ${client?.name||''} ${TYPE_META[d.type]?.label||''}`.toLowerCase();
      return (typeFilter === 'all' || d.type === typeFilter) && (statusFilter === 'all' || d.status === statusFilter) && (!q || text.includes(q));
    });
    $('#documentsBody').innerHTML = docs.map(d => {
      const client = clientById(d.clientId); const meta = TYPE_META[d.type];
      return `<tr><td><div class="doc-main"><div class="doc-icon">${meta?.icon||'DO'}</div><div><div class="doc-title">${esc(d.reference)}</div><div class="doc-sub">${formatDate(d.date)}</div></div></div></td><td>${esc(meta?.label||d.type)}</td><td>${esc(client?.name||'—')}</td><td>${esc(d.title||'—')}</td><td class="amount-cell">${meta?.kind==='financial'?formatMoney(docGross(d)):'—'}</td><td><span class="status-pill ${esc(d.status)}">${esc(d.status)}</span></td><td class="muted">${formatDate((d.updatedAt||'').slice(0,10))}</td><td><div class="row-actions"><button class="mini-action" data-edit-doc="${d.id}" title="Modifier">✎</button><button class="mini-action" data-duplicate-doc="${d.id}" title="Dupliquer">⧉</button><button class="mini-action" data-delete-doc="${d.id}" title="Supprimer">×</button></div></td></tr>`;
    }).join('');
    $('#documentsEmpty').hidden = docs.length > 0;
    bindDocumentRows();
  }

  function bindDocumentRows() {
    $$('[data-edit-doc]').forEach(b => b.onclick = e => { e.stopPropagation(); openDocument(b.dataset.editDoc); });
    $$('[data-duplicate-doc]').forEach(b => b.onclick = e => { e.stopPropagation(); duplicateDocument(b.dataset.duplicateDoc); });
    $$('[data-delete-doc]').forEach(b => b.onclick = e => { e.stopPropagation(); deleteDocument(b.dataset.deleteDoc); });
  }

  function renderClients() {
    const q = $('#clientsSearch').value.trim().toLowerCase();
    const clients = state.clients.filter(c => !q || `${c.name} ${c.sector} ${c.contact} ${c.email}`.toLowerCase().includes(q));
    $('#clientGrid').innerHTML = clients.map(c => {
      const docs = state.documents.filter(d => d.clientId === c.id);
      const turnover = docs.filter(d => d.type === 'invoice' && d.status === 'Payé').reduce((s,d)=>s+docGross(d),0);
      return `<article class="client-card"><div class="client-card-head"><div class="client-avatar">${esc(initials(c.name))}</div><div class="client-menu"><button class="mini-action" data-new-doc-client="${c.id}" title="Créer un document">＋</button><button class="mini-action" data-edit-client="${c.id}" title="Modifier">✎</button><button class="mini-action" data-delete-client="${c.id}" title="Supprimer">×</button></div></div><h3>${esc(c.name)}</h3><div class="client-sector">${esc(c.sector||'Secteur non renseigné')}</div><div class="client-info"><div><strong>Contact</strong> · ${esc(c.contact||'—')}</div><div><strong>E-mail</strong> · ${esc(c.email||'—')}</div><div><strong>Téléphone</strong> · ${esc(c.phone||'—')}</div></div><div class="client-stats"><div class="client-stat"><span>Documents</span><strong>${docs.length}</strong></div><div class="client-stat"><span>Encaissé</span><strong>${formatMoney(turnover)}</strong></div></div></article>`;
    }).join('');
    $('#clientsEmpty').hidden = clients.length > 0;
    $$('[data-edit-client]').forEach(b => b.onclick = () => openClientModal(b.dataset.editClient));
    $$('[data-delete-client]').forEach(b => b.onclick = () => deleteClient(b.dataset.deleteClient));
    $$('[data-new-doc-client]').forEach(b => b.onclick = () => openDocumentTypeModal(b.dataset.newDocClient));
  }

  function renderTemplates() {
    $('#templateGrid').innerHTML = Object.entries(TYPE_META).map(([key,m]) => `<article class="template-card"><div class="template-preview"><div class="template-paper"><div class="tp-logo"></div><div class="tp-title"></div><div class="tp-line"></div><div class="tp-line"></div><div class="tp-line short"></div><div class="tp-box"></div></div></div><div class="template-copy"><div class="template-copy-head"><h3>${esc(m.label)}</h3><span class="template-tag">SPARKLINE</span></div><p>${esc(m.description)}</p><button class="btn btn-dark" data-create-type="${key}">Utiliser ce modèle</button></div></article>`).join('');
    $$('[data-create-type]').forEach(btn => btn.onclick = () => createDocument(btn.dataset.createType));
  }

  function renderFinance() {
    const invoices = state.documents.filter(d => ['invoice','deposit'].includes(d.type));
    const issued = invoices.reduce((s,d)=>s+docGross(d),0);
    const paid = invoices.filter(d=>d.status==='Payé').reduce((s,d)=>s+docGross(d),0);
    const pending = invoices.filter(d=>d.status==='Envoyé').reduce((s,d)=>s+docGross(d),0);
    const overdue = invoices.filter(d=>d.status!=='Payé' && parseDate(d.dueDate) && parseDate(d.dueDate) < new Date()).reduce((s,d)=>s+docGross(d),0);
    const cards = [['Facturé',issued,'Total des factures'],['Encaissé',paid,'Paiements reçus'],['À encaisser',pending,'Factures envoyées'],['En retard',overdue,'Échéances dépassées']];
    $('#financeSummary').innerHTML = cards.map((c,i)=>`<article class="stat-card"><div><div class="stat-label">${c[0]}</div><div class="stat-value">${formatMoney(c[1])}</div><div class="stat-sub">${c[2]}</div></div><div class="stat-icon ${i===1?'green':i>=2?'orange':''}">₣</div></article>`).join('');

    const monthMap = new Map();
    invoices.forEach(d=>{ const dt=parseDate(d.date); if(!dt)return; const key=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`; monthMap.set(key,(monthMap.get(key)||0)+docGross(d)); });
    const months = [...monthMap.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-8);
    const max = Math.max(...months.map(x=>x[1]),1);
    $('#revenueChart').innerHTML = months.length ? months.map(([key,val],i)=>{ const d=new Date(`${key}-01T12:00:00`); const label=new Intl.DateTimeFormat('fr-FR',{month:'short'}).format(d).replace('.',''); return `<div class="bar-item"><span class="bar-value">${formatMoney(val).replace(' FCFA','')}</span><div class="bar ${i===months.length-1?'orange':''}" style="height:${Math.max(3,val/max*78)}%"></div><span class="bar-label">${label}</span></div>`; }).join('') : `<div class="empty-state"><p>Aucune donnée de facturation.</p></div>`;

    const statuses = ['Payé','Envoyé','Brouillon','Refusé','Expiré']; const totalCount=Math.max(invoices.length,1);
    $('#financeStatusList').innerHTML = statuses.map(s=>{ const count=invoices.filter(d=>d.status===s).length; return `<div class="status-row"><label>${s}</label><div class="status-track"><div class="status-fill" style="width:${count/totalCount*100}%"></div></div><strong>${count}</strong></div>`; }).join('');
    $('#invoiceTrackingBody').innerHTML = invoices.sort((a,b)=>new Date(b.date)-new Date(a.date)).map(d=>`<tr><td><strong>${esc(d.reference)}</strong><div class="doc-sub">${formatDate(d.date)}</div></td><td>${esc(clientById(d.clientId)?.name||'—')}</td><td class="amount-cell">${formatMoney(docGross(d))}</td><td>${formatDate(d.dueDate)}</td><td><span class="status-pill ${esc(d.status)}">${esc(d.status)}</span></td><td><div class="row-actions"><button class="mini-action" data-edit-doc="${d.id}">↗</button>${d.status!=='Payé'?`<button class="mini-action" data-mark-paid="${d.id}" title="Marquer payé">✓</button>`:''}</div></td></tr>`).join('');
    bindDocumentRows();
    $$('[data-mark-paid]').forEach(b=>b.onclick=()=>{ const d=state.documents.find(x=>x.id===b.dataset.markPaid); if(d){d.status='Payé';d.updatedAt=new Date().toISOString();saveState();renderFinance();toast('Facture marquée comme payée.');}});
  }

  function renderSettings() {
    const c = state.company;
    $('#companySettingsForm').innerHTML = [
      field('Nom commercial','company-name',c.name), field('Raison sociale / signature','company-legalName',c.legalName), field('E-mail','company-email',c.email,'email'), field('Téléphone','company-phone',c.phone), field('Site web','company-website',c.website), field('Adresse','company-address',c.address), field('Ville','company-city',c.city), field('Pays','company-country',c.country),
      `<div class="field full"><button class="btn btn-dark settings-save" type="submit">Enregistrer l'entreprise</button></div>`
    ].join('');
    $('#documentSettingsForm').innerHTML = `
      ${field('Devise','setting-currency',c.currency)}
      ${field('TVA par défaut (%)','setting-taxRate',c.taxRate,'number')}
      ${field('Validité d’un devis (jours)','setting-validity',c.quoteValidity,'number')}
      ${textareaField('Conditions de paiement par défaut','setting-paymentTerms',c.paymentTerms)}
      <div class="switch-row"><div class="switch-copy"><strong>Numérotation automatique</strong><span>Générer les références au moment de la création</span></div><button class="toggle ${state.settings.autoNumber?'active':''}" type="button" id="autoNumberToggle"></button></div>
      <button class="btn btn-dark settings-save" type="submit">Enregistrer les préférences</button>`;
    $('#companySettingsForm').onsubmit = e => {e.preventDefault(); ['name','legalName','email','phone','website','address','city','country'].forEach(k=>state.company[k]=$(`#company-${k}`).value.trim()); saveState(); toast('Informations Sparkline enregistrées.');};
    $('#documentSettingsForm').onsubmit = e => {e.preventDefault(); state.company.currency=$('#setting-currency').value.trim()||'FCFA';state.company.taxRate=Number($('#setting-taxRate').value||0);state.company.quoteValidity=Number($('#setting-validity').value||30);state.company.paymentTerms=$('#setting-paymentTerms').value.trim();saveState();toast('Préférences enregistrées.');};
    $('#autoNumberToggle').onclick = e => { state.settings.autoNumber=!state.settings.autoNumber; e.currentTarget.classList.toggle('active',state.settings.autoNumber); saveState(); };
  }

  function field(label,id,value,type='text',full=false,placeholder='') { return `<div class="field ${full?'full':''}"><label for="${id}">${esc(label)}</label><input id="${id}" type="${type}" value="${esc(value??'')}" placeholder="${esc(placeholder)}" /></div>`; }
  function textareaField(label,id,value,full=false) { return `<div class="field ${full?'full':''}"><label for="${id}">${esc(label)}</label><textarea id="${id}">${esc(value??'')}</textarea></div>`; }

  function openModal(id) { $('#modalBackdrop').hidden=false; $(id).hidden=false; document.body.style.overflow='hidden'; }
  function closeModals() { $('#modalBackdrop').hidden=true; $$('.modal').forEach(m=>m.hidden=true); if($('#documentEditor').hidden) document.body.style.overflow=''; }

  function openDocumentTypeModal(clientId='') {
    $('#documentTypeGrid').innerHTML = Object.entries(TYPE_META).map(([key,m])=>`<button class="doc-type-card" data-type="${key}"><div class="doc-type-icon">${m.icon}</div><h3>${esc(m.label)}</h3><p>${esc(m.description)}</p></button>`).join('');
    $$('#documentTypeGrid [data-type]').forEach(b=>b.onclick=()=>{closeModals();createDocument(b.dataset.type,clientId||null);});
    openModal('#documentTypeModal');
  }

  function createDocument(type, clientId=null) {
    const meta=TYPE_META[type]; if(!meta)return;
    const now = new Date(); const date=now.toISOString().slice(0,10);
    const doc={ id:uid(), type, reference:generateReference(type), status:state.settings.defaultStatus||'Brouillon', clientId:clientId||state.clients[0]?.id||'', title:defaultTitle(type), date, dueDate:type==='invoice'||type==='deposit'?addDays(date,15):'', validity:type==='quote'?state.company.quoteValidity:30, intro:defaultIntro(type), items:meta.kind==='financial'?[{id:uid(),name:'Prestation',description:'Description de la prestation ou du livrable',qty:1,price:0}]:[], sections:meta.kind==='proposal'?defaultSections(type):[], discount:0,taxRate:Number(state.company.taxRate||0),deposit:0,conditions:state.company.paymentTerms||'',notes:'',createdAt:now.toISOString(),updatedAt:now.toISOString(),options:{showSignature:true,showTax:Number(state.company.taxRate||0)>0,coverPage:type==='proposal'}};
    editingDocument=doc;
    openEditor(doc,true);
  }

  function defaultTitle(type){ const map={quote:'Proposition de services',invoice:'Facture de prestations',deposit:"Acompte de démarrage",credit:'Avoir sur facture',proposal:'Proposition commerciale',contract:'Contrat de prestation de services',nda:'Accord de confidentialité',order:'Bon de commande',delivery:'Bon de livraison',report:'Compte rendu de réunion'}; return map[type]||TYPE_META[type].label; }
  function defaultIntro(type){ const map={quote:'Nous vous proposons les prestations suivantes, adaptées à vos objectifs et à votre contexte.',invoice:'Veuillez trouver ci-dessous le détail des prestations facturées.',proposal:'Une proposition conçue pour répondre à vos enjeux avec une approche claire, structurée et orientée impact.',contract:'Le présent document définit le cadre de la collaboration entre Sparkline et le client.',nda:'Le présent accord définit les règles de confidentialité applicables aux informations partagées.',report:'Ce document synthétise les échanges, décisions et prochaines actions.'}; return map[type]||''; }
  function defaultSections(type){
    if(type==='contract') return [{id:uid(),title:'Objet du contrat',content:'Décrire la mission, son périmètre et les livrables attendus.'},{id:uid(),title:'Modalités d’exécution',content:'- Calendrier et jalons\n- Responsabilités des parties\n- Processus de validation'},{id:uid(),title:'Conditions financières',content:'Préciser le montant, les échéances et le mode de paiement.'},{id:uid(),title:'Propriété & confidentialité',content:'Préciser les règles applicables aux livrables, données et actifs transmis.'}];
    if(type==='nda') return [{id:uid(),title:'Informations confidentielles',content:'Définir les informations couvertes par le présent accord.'},{id:uid(),title:'Obligations des parties',content:'- Ne pas divulguer les informations confidentielles\n- Limiter les accès aux seules personnes autorisées\n- Protéger les documents et données reçus'},{id:uid(),title:'Durée',content:'Préciser la durée de l’obligation de confidentialité.'}];
    if(type==='report') return [{id:uid(),title:'Contexte & participants',content:'Date, objet de la réunion et personnes présentes.'},{id:uid(),title:'Points abordés',content:'- Point 1\n- Point 2\n- Point 3'},{id:uid(),title:'Décisions',content:'- Décision 1\n- Décision 2'},{id:uid(),title:'Plan d’action',content:'- Action — Responsable — Échéance'}];
    return [{id:uid(),title:'Contexte',content:'Décrivez ici le contexte du client, le besoin exprimé et l’opportunité.'},{id:uid(),title:'Objectifs',content:'- Objectif principal\n- Résultat attendu\n- Indicateur de réussite'},{id:uid(),title:'Approche & périmètre',content:'Présentez votre approche, les étapes et les livrables.'},{id:uid(),title:'Budget & modalités',content:'Précisez l’investissement, le calendrier et les conditions de paiement.'},{id:uid(),title:'Prochaines étapes',content:'Validation de la proposition, lancement et cadrage opérationnel.'}];
  }
  function addDays(dateStr,days){ const d=new Date(dateStr+'T12:00:00'); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
  function generateReference(type){ const meta=TYPE_META[type]; const year=new Date().getFullYear(); const seq=state.documents.filter(d=>d.type===type && String(d.reference).includes(String(year))).length+1; return `${meta.prefix}-${year}-${String(seq).padStart(3,'0')}`; }

  function openDocument(id) { const doc=state.documents.find(d=>d.id===id); if(!doc)return; editingDocument=clone(doc); openEditor(editingDocument,false); }
  function openEditor(doc,isNew) {
    $('#documentEditor').hidden=false; document.body.style.overflow='hidden';
    $('#editorTypeBadge').textContent=TYPE_META[doc.type].label.toUpperCase(); $('#editorReference').textContent=doc.reference;
    editorTab='content'; $$('.editor-tab').forEach(t=>t.classList.toggle('active',t.dataset.editorTab==='content'));
    renderEditorForm(); renderDocumentPreview(); setEditorZoom(.80);
    $('#saveDocBtn').dataset.isNew=isNew?'1':'0';
  }
  function closeEditor() { $('#documentEditor').hidden=true; document.body.style.overflow=''; editingDocument=null; renderCurrentView(); }

  function renderEditorForm() {
    if(!editingDocument)return; const d=editingDocument; const meta=TYPE_META[d.type];
    if(editorTab==='style') { renderEditorOptions(); return; }
    const clientsOptions=state.clients.map(c=>`<option value="${c.id}" ${c.id===d.clientId?'selected':''}>${esc(c.name)}</option>`).join('');
    let html=`
      <section class="form-section"><div class="form-section-head"><h3>Document</h3></div>
        <div class="form-grid">
          <div class="field"><label>Client</label><select data-doc-field="clientId"><option value="">— Sélectionner —</option>${clientsOptions}</select></div>
          ${fieldEditor('Référence','reference',d.reference)}
          ${fieldEditor('Objet / titre','title',d.title)}
          <div class="inline-row">${fieldEditor('Date','date',d.date,'date')}${meta.kind==='financial'&&['invoice','deposit'].includes(d.type)?fieldEditor('Échéance','dueDate',d.dueDate,'date'):fieldEditor('Validité (jours)','validity',d.validity,'number')}</div>
          ${textareaEditor('Introduction','intro',d.intro)}
        </div>
      </section>`;
    if(meta.kind==='financial') html+=financialEditor(d); else html+=proposalEditor(d);
    html+=`<section class="form-section"><div class="form-section-head"><h3>Finalisation</h3></div><div class="form-grid">${textareaEditor('Conditions / modalités','conditions',d.conditions)}${textareaEditor('Note finale','notes',d.notes)}<div class="field"><label>Statut</label><select data-doc-field="status">${['Brouillon','Envoyé','Accepté','Payé','Refusé','Expiré'].map(s=>`<option ${s===d.status?'selected':''}>${s}</option>`).join('')}</select></div></div></section>`;
    $('#documentForm').innerHTML=html; bindEditorForm();
  }

  function fieldEditor(label,key,value,type='text'){return `<div class="field"><label>${esc(label)}</label><input type="${type}" data-doc-field="${key}" value="${esc(value??'')}"></div>`;}
  function textareaEditor(label,key,value){return `<div class="field"><label>${esc(label)}</label><textarea data-doc-field="${key}">${esc(value??'')}</textarea></div>`;}

  function financialEditor(d){
    return `<section class="form-section"><div class="form-section-head"><h3>Lignes</h3><button type="button" class="text-button" id="addLineBtn">＋ Ajouter</button></div><div class="line-items" id="lineItemsEditor">${(d.items||[]).map((item,i)=>lineEditor(item,i)).join('')}</div></section>
    <section class="form-section"><div class="form-section-head"><h3>Calcul</h3></div><div class="inline-row">${fieldEditor('Remise (%)','discount',d.discount,'number')}${fieldEditor('TVA (%)','taxRate',d.taxRate,'number')}</div><div class="inline-row" style="margin-top:10px">${fieldEditor('Acompte déjà payé','deposit',d.deposit,'number')}<div class="field"><label>Total actuel</label><input value="${formatMoney(docTotal(d))}" disabled></div></div></section>`;
  }
  function lineEditor(item,i){ return `<div class="line-item" data-line-index="${i}"><div class="line-item-grid"><div class="field"><label>Prestation</label><input data-item-field="name" value="${esc(item.name||'')}"></div><div class="field"><label>Qté</label><input type="number" min="0" step="0.01" data-item-field="qty" value="${Number(item.qty??1)}"></div><div class="field"><label>Prix unitaire</label><input type="number" min="0" step="1" data-item-field="price" value="${Number(item.price??0)}"></div><button type="button" class="remove-line" data-remove-line="${i}" title="Supprimer">×</button></div><div class="line-item-grid description-row" style="margin-top:7px"><div class="field"><label>Description</label><textarea data-item-field="description">${esc(item.description||'')}</textarea></div></div></div>`; }

  function proposalEditor(d){return `<section class="form-section"><div class="form-section-head"><h3>Sections</h3><button type="button" class="text-button" id="addSectionBtn">＋ Ajouter</button></div><div class="section-list" id="sectionEditor">${(d.sections||[]).map((s,i)=>sectionEditor(s,i)).join('')}</div></section>`;}
  function sectionEditor(s,i){return `<div class="proposal-section-editor" data-section-index="${i}"><div class="proposal-section-head"><span class="drag-handle">⋮⋮</span><input data-section-field="title" value="${esc(s.title||'')}"><button type="button" class="remove-line" data-remove-section="${i}">×</button></div><div class="field"><textarea data-section-field="content">${esc(s.content||'')}</textarea></div><div style="display:flex;gap:5px;margin-top:6px"><button type="button" class="mini-action" data-section-up="${i}" title="Monter">↑</button><button type="button" class="mini-action" data-section-down="${i}" title="Descendre">↓</button></div></div>`;}

  function renderEditorOptions(){
    const d=editingDocument; const meta=TYPE_META[d.type];
    $('#documentForm').innerHTML=`<section class="form-section"><div class="form-section-head"><h3>Affichage</h3></div>
      <div class="switch-row"><div class="switch-copy"><strong>Bloc signature</strong><span>Afficher la zone de signature en bas du document</span></div><button type="button" class="toggle ${d.options?.showSignature!==false?'active':''}" data-option-toggle="showSignature"></button></div>
      ${meta.kind==='financial'?`<div class="switch-row"><div class="switch-copy"><strong>Détail de TVA</strong><span>Afficher le sous-total et le calcul de TVA</span></div><button type="button" class="toggle ${d.options?.showTax?'active':''}" data-option-toggle="showTax"></button></div>`:''}
      ${d.type==='proposal'?`<div class="switch-row"><div class="switch-copy"><strong>Couverture éditoriale</strong><span>Utiliser une page d’ouverture plus visuelle</span></div><button type="button" class="toggle ${d.options?.coverPage!==false?'active':''}" data-option-toggle="coverPage"></button></div>`:''}
      </section><section class="form-section"><div class="form-section-head"><h3>Conseils</h3></div><p class="muted" style="font-size:11px;line-height:1.65">Le rendu reprend la direction visuelle Sparkline : noir, blanc, orange, composition éditoriale et hiérarchie forte. Utilisez des titres courts, des descriptions orientées bénéfices et des conditions explicites.</p></section>`;
    $$('[data-option-toggle]').forEach(b=>b.onclick=()=>{d.options=d.options||{};const key=b.dataset.optionToggle;d.options[key]=!d.options[key];b.classList.toggle('active',!!d.options[key]);markDirty();renderDocumentPreview();});
  }

  function bindEditorForm(){
    $$('[data-doc-field]').forEach(el=>{ el.addEventListener('input',()=>{ let v=el.value; if(['validity','discount','taxRate','deposit'].includes(el.dataset.docField))v=Number(v||0); editingDocument[el.dataset.docField]=v; if(el.dataset.docField==='reference')$('#editorReference').textContent=v; markDirty(); renderDocumentPreview(); }); });
    $$('.line-item').forEach(box=>{ const idx=Number(box.dataset.lineIndex); $$('[data-item-field]',box).forEach(el=>el.addEventListener('input',()=>{let v=el.value;if(['qty','price'].includes(el.dataset.itemField))v=Number(v||0);editingDocument.items[idx][el.dataset.itemField]=v;markDirty();renderDocumentPreview();})); });
    $$('[data-remove-line]').forEach(b=>b.onclick=()=>{editingDocument.items.splice(Number(b.dataset.removeLine),1);renderEditorForm();markDirty();renderDocumentPreview();});
    if($('#addLineBtn')) $('#addLineBtn').onclick=()=>{editingDocument.items.push({id:uid(),name:'Nouvelle prestation',description:'',qty:1,price:0});renderEditorForm();markDirty();renderDocumentPreview();};
    $$('.proposal-section-editor').forEach(box=>{const idx=Number(box.dataset.sectionIndex);$$('[data-section-field]',box).forEach(el=>el.addEventListener('input',()=>{editingDocument.sections[idx][el.dataset.sectionField]=el.value;markDirty();renderDocumentPreview();}));});
    $$('[data-remove-section]').forEach(b=>b.onclick=()=>{editingDocument.sections.splice(Number(b.dataset.removeSection),1);renderEditorForm();markDirty();renderDocumentPreview();});
    if($('#addSectionBtn'))$('#addSectionBtn').onclick=()=>{editingDocument.sections.push({id:uid(),title:'Nouvelle section',content:'Décrivez cette section.'});renderEditorForm();markDirty();renderDocumentPreview();};
    $$('[data-section-up]').forEach(b=>b.onclick=()=>moveSection(Number(b.dataset.sectionUp),-1));
    $$('[data-section-down]').forEach(b=>b.onclick=()=>moveSection(Number(b.dataset.sectionDown),1));
  }

  function moveSection(i,delta){const j=i+delta;if(j<0||j>=editingDocument.sections.length)return;[editingDocument.sections[i],editingDocument.sections[j]]=[editingDocument.sections[j],editingDocument.sections[i]];renderEditorForm();markDirty();renderDocumentPreview();}
  function markDirty(){ $('#autosaveIndicator').textContent='● Modifications';$('#autosaveIndicator').classList.add('saving');clearTimeout(saveTimer);saveTimer=setTimeout(()=>{$('#autosaveIndicator').textContent='● Prêt à enregistrer';},650); }

  function renderDocumentPreview(){ if(!editingDocument)return; const d=editingDocument; $('#documentPreview').innerHTML=TYPE_META[d.type].kind==='financial'?renderFinancialPreview(d):renderProposalPreview(d); }

  function renderFinancialPreview(d){
    const c=clientById(d.clientId)||{}; const meta=TYPE_META[d.type];
    const subtotal=(d.items||[]).reduce((s,i)=>s+Number(i.qty||0)*Number(i.price||0),0);const discount=subtotal*Number(d.discount||0)/100;const net=subtotal-discount;const tax=net*Number(d.taxRate||0)/100;const gross=net+tax;const total=Math.max(0,gross-Number(d.deposit||0));
    const rows=(d.items||[]).map(i=>`<tr><td><div class="item-name">${esc(i.name)}</div><div class="item-desc">${esc(i.description)}</div></td><td>${Number(i.qty||0)}</td><td>${formatMoney(i.price)}</td><td>${formatMoney(Number(i.qty||0)*Number(i.price||0))}</td></tr>`).join('');
    const conditions = (d.conditions||'').split('\n').filter(Boolean).map(x=>`<li>${esc(x.replace(/^[-•]\s*/,''))}</li>`).join('');
    return `<div class="doc-sheet"><header class="doc-sheet-header"><img class="doc-sheet-logo" src="assets/sparkline-logo-dark.svg" alt="Sparkline"><div class="doc-meta"><div class="doc-label">${esc(meta.label.toUpperCase())}</div><h1 class="${d.type==='invoice'?'invoice-title':''}">${esc(d.reference)}</h1><p>Date : ${formatDate(d.date)}</p>${d.dueDate?`<p>Échéance : ${formatDate(d.dueDate)}</p>`:''}${d.validity?`<p>Validité : ${Number(d.validity)} jours</p>`:''}${d.status==='Payé'?'<span class="paid-stamp">PAYÉ</span>':''}</div></header>
    <div class="doc-hero-title"><div class="accent-line"></div><h2>${esc(d.title||meta.label)}</h2><p>${esc(d.intro||'')}</p></div>
    <div class="client-strip"><div><small>À L’ATTENTION DE</small><strong>${esc(c.name||'Client à renseigner')}</strong><div class="doc-sub">${esc(c.sector||'')}</div></div><div><small>COORDONNÉES</small><strong>${esc(c.contact||c.email||'—')}</strong><div class="doc-sub">${esc(c.address||'')}</div></div></div>
    <section class="doc-section"><div class="doc-section-title"><span class="num">01</span><h3>Détail des prestations</h3></div><table class="doc-table"><thead><tr><th>Prestation</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>${rows||'<tr><td colspan="4">Aucune ligne.</td></tr>'}</tbody></table>
    <div class="doc-total-box"><div class="total-row"><span>Sous-total</span><strong>${formatMoney(subtotal)}</strong></div>${Number(d.discount)>0?`<div class="total-row"><span>Remise (${Number(d.discount)}%)</span><strong>− ${formatMoney(discount)}</strong></div>`:''}${(d.options?.showTax||Number(d.taxRate)>0)?`<div class="total-row"><span>TVA (${Number(d.taxRate||0)}%)</span><strong>${formatMoney(tax)}</strong></div>`:''}${Number(d.deposit)>0?`<div class="total-row"><span>Acompte</span><strong>− ${formatMoney(d.deposit)}</strong></div>`:''}<div class="total-row grand"><span>Total</span><strong>${formatMoney(total)}</strong></div></div></section>
    ${conditions?`<section class="doc-section"><div class="doc-section-title"><span class="num">02</span><h3>Conditions particulières</h3></div><ul>${conditions}</ul></section>`:''}
    ${d.notes?`<div class="doc-callout"><small>NOTE</small><h3>Pour la suite</h3><p>${nl2br(d.notes)}</p></div>`:''}
    <footer class="doc-footer"><div class="signature-block">${d.options?.showSignature!==false?`<div class="signature-line">Signature représentant SPARKLINE</div>`:''}</div><div class="footer-contact"><p><strong>${esc(state.company.legalName)}</strong></p><p>${esc(state.company.address)} · ${esc(state.company.phone)}</p><p>${esc(state.company.email)} · ${esc(state.company.website)}</p></div></footer></div>`;
  }

  function renderProposalPreview(d){
    const c=clientById(d.clientId)||{}; const meta=TYPE_META[d.type];
    const sections=(d.sections||[]).map((s,i)=>renderProposalSection(s,i)).join('');
    const cover=d.type==='proposal'&&d.options?.coverPage!==false?`<div class="proposal-cover"><img class="proposal-cover-logo" src="assets/sparkline-logo-dark.svg" alt="Sparkline"><div class="proposal-cover-main"><div class="overline">PROPOSITION POUR ${esc((c.name||'VOTRE CLIENT').toUpperCase())}</div><h1>${esc(d.title||meta.label).replace(/—/g,'<br><span>—</span>')}</h1><p>${esc(d.intro||'')}</p></div><div class="proposal-cover-footer"><div><strong>${esc(d.reference)}</strong><br>${formatDate(d.date)}</div><div>${esc(state.company.website)}<br>${esc(state.company.email)}</div></div></div><div class="page-break-label">PAGE 2 — PROPOSITION DÉTAILLÉE</div>`:'';
    return `${cover}<div class="proposal-body"><header class="doc-sheet-header"><img class="doc-sheet-logo" src="assets/sparkline-logo-dark.svg" alt="Sparkline"><div class="doc-meta"><div class="doc-label">${esc(meta.label.toUpperCase())}</div><h1>${esc(d.reference)}</h1><p>${formatDate(d.date)}</p></div></header>${!(d.type==='proposal'&&d.options?.coverPage!==false)?`<div class="doc-hero-title"><div class="accent-line"></div><h2>${esc(d.title)}</h2><p>${esc(d.intro||'')}</p></div>`:''}<div class="client-strip"><div><small>CLIENT</small><strong>${esc(c.name||'Client à renseigner')}</strong><div class="doc-sub">${esc(c.sector||'')}</div></div><div><small>PRÉPARÉ PAR</small><strong>${esc(state.company.legalName)}</strong><div class="doc-sub">${esc(state.company.address)}</div></div></div>${sections}${d.conditions?`<div class="doc-callout"><small>MODALITÉS</small><h3>Conditions de collaboration</h3><p>${nl2br(d.conditions)}</p></div>`:''}${d.notes?`<section class="proposal-section"><h2>Conclusion</h2><p>${nl2br(d.notes)}</p></section>`:''}<footer class="doc-footer"><div class="signature-block">${d.options?.showSignature!==false?`<div class="signature-line">Signature & validation</div>`:''}</div><div class="footer-contact"><p><strong>${esc(state.company.legalName)}</strong></p><p>${esc(state.company.phone)} · ${esc(state.company.email)}</p><p>${esc(state.company.website)}</p></div></footer></div>`;
  }

  function renderProposalSection(s,i){
    const lines=(s.content||'').split('\n'); let out=''; let inList=false;
    for(const line of lines){ if(/^[-•]\s+/.test(line)){ if(!inList){out+='<ul>';inList=true;}out+=`<li>${esc(line.replace(/^[-•]\s+/,''))}</li>`;} else { if(inList){out+='</ul>';inList=false;} if(line.trim()) out+=`<p>${esc(line)}</p>`; } }
    if(inList)out+='</ul>';
    return `<section class="proposal-section"><div class="index">${String(i+1).padStart(2,'0')}</div><h2>${esc(s.title)}</h2>${out}</section>`;
  }

  function saveDocument() {
    if(!editingDocument)return;
    if(!editingDocument.clientId){toast('Sélectionnez un client avant d’enregistrer.','error');return;}
    editingDocument.updatedAt=new Date().toISOString();
    const existing=state.documents.findIndex(d=>d.id===editingDocument.id);
    if(existing>=0)state.documents[existing]=clone(editingDocument); else state.documents.unshift(clone(editingDocument));
    saveState(); $('#saveDocBtn').dataset.isNew='0'; $('#autosaveIndicator').textContent='● Enregistré';$('#autosaveIndicator').classList.remove('saving'); toast('Document enregistré.'); updateCounts();
  }

  function duplicateDocument(id){const src=state.documents.find(d=>d.id===id);if(!src)return;const d=clone(src);d.id=uid();d.reference=generateReference(d.type);d.status='Brouillon';d.title=`${d.title} — copie`;d.createdAt=new Date().toISOString();d.updatedAt=d.createdAt;(d.items||[]).forEach(i=>i.id=uid());(d.sections||[]).forEach(s=>s.id=uid());state.documents.unshift(d);saveState();renderCurrentView();toast('Document dupliqué.');}
  function deleteDocument(id){const d=state.documents.find(x=>x.id===id);if(!d)return;if(!confirm(`Supprimer ${d.reference} ?`))return;state.documents=state.documents.filter(x=>x.id!==id);saveState();renderCurrentView();toast('Document supprimé.');}

  function openClientModal(id=null){editingClientId=id;const c=id?state.clients.find(x=>x.id===id):{name:'',sector:'',contact:'',email:'',phone:'',address:'Dakar, Sénégal',notes:''};$('#clientModalTitle').textContent=id?'Modifier le client':'Nouveau client';$('#clientForm').innerHTML=`${field('Entreprise','client-name',c.name)}${field('Secteur','client-sector',c.sector)}${field('Contact principal','client-contact',c.contact)}${field('E-mail','client-email',c.email,'email')}${field('Téléphone','client-phone',c.phone)}${field('Adresse','client-address',c.address)}${textareaField('Notes','client-notes',c.notes,true)}<div class="field full"><button class="btn btn-dark" type="submit">${id?'Enregistrer':'Ajouter le client'}</button></div>`;$('#clientForm').onsubmit=saveClient;openModal('#clientModal');}
  function saveClient(e){e.preventDefault();const payload={name:$('#client-name').value.trim(),sector:$('#client-sector').value.trim(),contact:$('#client-contact').value.trim(),email:$('#client-email').value.trim(),phone:$('#client-phone').value.trim(),address:$('#client-address').value.trim(),notes:$('#client-notes').value.trim()};if(!payload.name){toast('Le nom du client est obligatoire.','error');return;}if(editingClientId){const idx=state.clients.findIndex(c=>c.id===editingClientId);state.clients[idx]={...state.clients[idx],...payload};}else state.clients.unshift({id:uid(),...payload});saveState();closeModals();renderCurrentView();toast(editingClientId?'Client mis à jour.':'Client ajouté.');}
  function deleteClient(id){const client=state.clients.find(c=>c.id===id);if(!client)return;const used=state.documents.some(d=>d.clientId===id);if(used){toast('Ce client est lié à des documents. Supprimez ou réaffectez-les d’abord.','error');return;}if(!confirm(`Supprimer ${client.name} ?`))return;state.clients=state.clients.filter(c=>c.id!==id);saveState();renderClients();toast('Client supprimé.');}

  function exportBackup(){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`sparkline-desk-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);toast('Sauvegarde exportée.');}
  function importBackup(file){if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!Array.isArray(data.documents)||!Array.isArray(data.clients))throw new Error('Format invalide');state={...clone(defaultState),...data,company:{...DEFAULT_COMPANY,...(data.company||{})},settings:{...defaultState.settings,...(data.settings||{})}};saveState();renderCurrentView();toast('Données importées.');}catch{toast('Fichier de sauvegarde invalide.','error');}};reader.readAsText(file);}

  function setEditorZoom(value){editorZoom=Math.min(1.15,Math.max(.55,value));$('#documentPreview').style.transform=`scale(${editorZoom})`;$('#zoomLabel').textContent=`${Math.round(editorZoom*100)}%`;}

  function globalSearch(q){q=q.trim().toLowerCase();if(!q)return;const doc=state.documents.find(d=>`${d.reference} ${d.title} ${clientById(d.clientId)?.name||''}`.toLowerCase().includes(q));if(doc){openDocument(doc.id);$('#globalSearch').value='';return;}const client=state.clients.find(c=>`${c.name} ${c.sector} ${c.contact}`.toLowerCase().includes(q));if(client){setView('clients');$('#clientsSearch').value=q;renderClients();$('#globalSearch').value='';return;}toast('Aucun résultat correspondant.','error');}

  function bindStaticEvents(){
    $$('.nav-item[data-view]').forEach(b=>b.onclick=()=>setView(b.dataset.view));
    $$('[data-view-target]').forEach(b=>b.onclick=()=>setView(b.dataset.viewTarget));
    ['newDocumentBtn','heroNewDoc','documentsNewBtn','emptyNewDoc'].forEach(id=>{const el=$('#'+id);if(el)el.onclick=()=>openDocumentTypeModal();});
    $('#quickNewClientBtn').onclick=()=>openClientModal(); $('#newClientBtn').onclick=()=>openClientModal();
    $('#documentTypeFilter').onchange=renderDocuments; $('#documentStatusFilter').onchange=renderDocuments; $('#documentsSearch').oninput=renderDocuments; $('#clientsSearch').oninput=renderClients;
    $('#menuButton').onclick=()=>$('#sidebar').classList.add('open');$('#sidebarClose').onclick=()=>$('#sidebar').classList.remove('open');
    $('#modalBackdrop').onclick=closeModals; $$('[data-close-modal]').forEach(b=>b.onclick=closeModals);
    $('#closeEditorBtn').onclick=()=>{if(editingDocument && $('#autosaveIndicator').classList.contains('saving')){ if(confirm('Fermer sans enregistrer les dernières modifications ?'))closeEditor(); }else closeEditor();};
    $('#saveDocBtn').onclick=saveDocument; $('#duplicateDocBtn').onclick=()=>{ if(!editingDocument)return; saveDocument(); duplicateDocument(editingDocument.id); closeEditor(); };
    $('#printDocBtn').onclick=()=>window.print();
    $('#zoomInBtn').onclick=()=>setEditorZoom(editorZoom+.05); $('#zoomOutBtn').onclick=()=>setEditorZoom(editorZoom-.05);
    $$('.editor-tab').forEach(t=>t.onclick=()=>{editorTab=t.dataset.editorTab;$$('.editor-tab').forEach(x=>x.classList.toggle('active',x===t));renderEditorForm();});
    $('#exportBackupBtn').onclick=exportBackup; $('#importBackupInput').onchange=e=>{importBackup(e.target.files[0]);e.target.value='';};
    $('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter')globalSearch(e.target.value);});
    document.addEventListener('keydown',e=>{ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus();} if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='s'&&!$('#documentEditor').hidden){e.preventDefault();saveDocument();} if(e.key==='Escape'){if(!$('#documentEditor').hidden)closeEditor();else closeModals();} });
  }

  bindStaticEvents();
  renderCurrentView();
})();
