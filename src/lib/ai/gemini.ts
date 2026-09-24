/**
 * Sparkline Desk — Gemini Pro AI Integration
 * Resilient client with automatic fallback across Gemini models.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const FALLBACK_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-2.5-pro',
];

interface GeminiCallConfig {
  systemInstruction?: string;
  responseMimeType?: 'application/json' | 'text/plain';
  temperature?: number;
}

/**
 * Call Gemini API with automatic model fallback and JSON parsing if requested.
 */
export async function callGemini(
  prompt: string,
  config: GeminiCallConfig = {}
): Promise<string> {
  const { responseMimeType = 'application/json', temperature = 0.4 } = config;

  let lastError: Error | null = null;

  for (const model of FALLBACK_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const payload: any = {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature,
          ...(responseMimeType ? { responseMimeType } : {}),
        },
      };

      if (config.systemInstruction) {
        payload.systemInstruction = {
          parts: [{ text: config.systemInstruction }],
        };
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Gemini AI] Model ${model} returned ${res.status}:`, errorText);
        lastError = new Error(`Gemini API ${res.status}: ${errorText}`);
        continue; // Try next fallback model
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        lastError = new Error(`Empty response from ${model}`);
        continue;
      }

      return rawText;
    } catch (err: any) {
      console.warn(`[Gemini AI] Error calling ${model}:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed');
}

/**
 * Clean & Parse JSON returned by Gemini safely
 */
export function parseGeminiJson<T>(rawText: string): T {
  try {
    // Direct JSON parse
    return JSON.parse(rawText) as T;
  } catch {
    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/g, '')
      .trim();
    return JSON.parse(cleaned) as T;
  }
}

/**
 * Generate a complete document based on context and brief
 */
export async function generateDocumentAI(params: {
  docType: string;
  brief: string;
  clientName: string;
  clientSector?: string;
  currency?: string;
  companyName?: string;
}) {
  const {
    docType,
    brief,
    clientName,
    clientSector = 'Entreprise / B2B',
    currency = 'FCFA',
    companyName = 'Sparkline Desk',
  } = params;

  const isFinancial = ['quote', 'invoice', 'deposit', 'credit', 'order', 'delivery'].includes(
    docType.toLowerCase()
  );

  const prompt = `Tu es l'assistant d'élite de ${companyName}, spécialisé dans la gestion commerciale, la facturation et la rédaction de documents B2B.

L'utilisateur souhaite créer un document de type: "${docType.toUpperCase()}".
Client: "${clientName}" (Secteur: ${clientSector})
Brief / Contexte de la mission: "${brief || 'Prestation de services standard et accompagnement'}"
Monnaie de travail: "${currency}"

Génère une proposition complète, ultra professionnelle et directement utilisable pour ce document.
IMPORTANT: Les prix doivent être réalistes pour ce type de prestation et cohérents avec la monnaie ${currency} (ex: en FCFA, les montants sont en centaines de milliers ou millions : 250000, 750000, 1500000, etc. Ne mets pas de symboles de monnaie dans le champ price, seulement un nombre entier).

Réponds UNIQUEMENT en JSON valide respectant cette structure exacte:
{
  "title": "Titre explicite et valorisant du document",
  "intro": "Paragraphe d'introduction courtois et professionnel présentant l'objet de ce document à l'attention du client ${clientName}.",
  "lines": [
    {
      "name": "Nom de la prestation ou livrable",
      "description": "Description détaillée de la prestation et des livrables inclus",
      "qty": 1,
      "price": 500000
    }
  ],
  "sections": [
    {
      "title": "01. Contexte & Enjeux",
      "content": "Texte détaillé sur les enjeux du client...",
      "sectionType": "standard"
    },
    {
      "title": "02. Périmètre & Livrables",
      "content": "• Livrable 1\\n• Livrable 2\\n• Livrable 3",
      "sectionType": "standard"
    }
  ],
  "conditions": "Conditions de règlement et délais (ex: 50% à la commande, 50% à la livraison...)",
  "notes": "Remarques ou mentions utiles pour le client"
}

Règles:
- Pour un document financier (quote, invoice, deposit, credit, order, delivery), fournis entre 2 et 4 lignes réalistes dans "lines".
- Pour un document éditorial ou contractuel (proposal, contract, nda, report), fournis 3 ou 4 sections riches et bien rédigées dans "sections", et éventuellement des lignes si besoin.
- Pas de blabla avant ou après le JSON.`;

  const rawJson = await callGemini(prompt, {
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  return parseGeminiJson<{
    title: string;
    intro: string;
    lines: Array<{
      name: string;
      description: string;
      qty: number;
      price: number;
    }>;
    sections: Array<{
      title: string;
      content: string;
      sectionType?: string;
    }>;
    conditions: string;
    notes: string;
  }>(rawJson);
}

/**
 * Generate suggestions for Line Items (financial services)
 */
export async function generateLineItemsAI(params: {
  subject: string;
  clientName?: string;
  clientSector?: string;
  currency?: string;
  count?: number;
}) {
  const {
    subject,
    clientName = 'Client',
    clientSector = 'Général',
    currency = 'FCFA',
    count = 3,
  } = params;

  const prompt = `Génère ${count} prestations commerciales réalistes et détaillées pour une facture ou un devis.
Objet de la mission: "${subject}"
Client: "${clientName}" (Secteur: ${clientSector})
Monnaie: "${currency}"

IMPORTANT: Les prix doivent être des nombres entiers sans symbole de monnaie, adaptés à la valeur économique de la monnaie ${currency} (ex: 350000, 700000, 1200000 pour FCFA).

Retourne UNIQUEMENT un JSON valide au format:
{
  "lines": [
    {
      "name": "Intitulé concis de la prestation",
      "description": "Description claire et professionnelle des travaux inclus",
      "qty": 1,
      "price": 450000
    }
  ]
}`;

  const rawJson = await callGemini(prompt, {
    responseMimeType: 'application/json',
    temperature: 0.3,
  });

  return parseGeminiJson<{
    lines: Array<{
      name: string;
      description: string;
      qty: number;
      price: number;
    }>;
  }>(rawJson).lines;
}

/**
 * Enhance or rewrite text into polished French B2B standard
 */
export async function enhanceTextAI(params: {
  text: string;
  context?: string;
  instruction?: string;
}) {
  const {
    text,
    context = 'Document commercial et administratif',
    instruction = 'Rendre le texte plus professionnel, élégant, clair et percutant',
  } = params;

  const prompt = `Tu es un rédacteur d'élite en communication B2B.
Contexte: ${context}
Instruction: ${instruction}

Texte d'origine:
"""
${text}
"""

Réécris ce texte en français soigné, clair et professionnel.
Retourne UNIQUEMENT le texte amélioré, sans guillemets, sans explications, sans mise en forme superflue.`;

  const raw = await callGemini(prompt, {
    responseMimeType: 'text/plain',
    temperature: 0.2,
  });

  return raw.trim();
}

/**
 * Generate tailored conditions and payment terms
 */
export async function generateConditionsAI(params: {
  docType: string;
  totalAmount?: number;
  currency?: string;
  clientName?: string;
}) {
  const {
    docType,
    totalAmount,
    currency = 'FCFA',
    clientName = 'le client',
  } = params;

  const prompt = `Rédige les conditions de règlement et d'exécution idéales pour un document de type "${docType}".
Client: ${clientName}
${totalAmount ? `Montant indicatif: ${totalAmount} ${currency}` : ''}

Retourne UNIQUEMENT 3 à 5 conditions concises, séparées par des retours à la ligne, sans puces superflues ni numéros.
Exemples:
50% d'acompte à la signature du devis avant démarrage
Solde à réception de la facture sous 15 jours
Règlement par virement bancaire ou mobile money
Tout retard de règlement entraînera des pénalités légales`;

  const raw = await callGemini(prompt, {
    responseMimeType: 'text/plain',
    temperature: 0.3,
  });

  return raw.trim();
}
