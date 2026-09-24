import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { generateDocumentAI } from '@/lib/ai/gemini';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.organizationId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { docType, brief, clientId } = body;

    if (!docType) {
      return NextResponse.json({ error: 'Type de document requis' }, { status: 400 });
    }

    // Fetch client & organization info for contextual generation
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

    const generated = await generateDocumentAI({
      docType,
      brief: brief || '',
      clientName: client?.name || 'Client',
      clientSector: client?.sector || 'Entreprise',
      currency: org?.currency || 'FCFA',
      companyName: org?.legalName || org?.name || 'Sparkline Desk',
    });

    return NextResponse.json({
      success: true,
      document: generated,
    });
  } catch (error: any) {
    console.error('[API /api/ai/document] Error:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Erreur lors de la génération avec l'IA. Veuillez réessayer dans quelques instants.",
      },
      { status: 500 }
    );
  }
}
