import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import {
  generateLineItemsAI,
  enhanceTextAI,
  generateConditionsAI,
} from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { action, subject, text, context, docType, clientId, totalAmount } = body;

    const [client, org] = await Promise.all([
      clientId
        ? prisma.client.findFirst({
            where: { id: clientId, organizationId: user.organizationId },
          })
        : null,
      prisma.organization.findUnique({
        where: { id: user.organizationId },
      }),
    ]);

    const currency = org?.currency || 'FCFA';

    if (action === 'lines') {
      const lines = await generateLineItemsAI({
        subject: subject || 'Prestations de services et conseil',
        clientName: client?.name,
        clientSector: client?.sector || undefined,
        currency,
        count: body.count || 3,
      });
      return NextResponse.json({ success: true, lines });
    }

    if (action === 'conditions') {
      const conditions = await generateConditionsAI({
        docType: docType || 'quote',
        totalAmount,
        currency,
        clientName: client?.name,
      });
      return NextResponse.json({ success: true, conditions });
    }

    if (action === 'enhance') {
      if (!text) {
        return NextResponse.json({ error: 'Texte requis' }, { status: 400 });
      }
      const enhanced = await enhanceTextAI({
        text,
        context: context || 'Document commercial B2B Sparkline Desk',
        instruction: body.instruction,
      });
      return NextResponse.json({ success: true, enhanced });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/ai/autocomplete] Error:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Erreur lors de l'autocomplétion IA. Veuillez réessayer dans quelques instants.",
      },
      { status: 500 }
    );
  }
}
