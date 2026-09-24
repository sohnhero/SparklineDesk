import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { TYPE_META, ENUM_TO_KEY, DocTypeKey } from '@/domains/documents/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';

    if (!q) {
      return NextResponse.json({ results: [] });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [clients, documents] = await Promise.all([
      prisma.client.findMany({
        where: {
          organizationId: user.organizationId,
          archivedAt: null,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { sector: { contains: q, mode: 'insensitive' } },
            { contactName: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: 5,
      }),
      prisma.document.findMany({
        where: {
          organizationId: user.organizationId,
          OR: [
            { reference: { contains: q, mode: 'insensitive' } },
            { title: { contains: q, mode: 'insensitive' } },
            { client: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
        include: { client: true },
        take: 8,
      }),
    ]);

    const results = [
      ...documents.map((d) => {
        const typeKey = (ENUM_TO_KEY[d.type] || 'quote') as DocTypeKey;
        return {
          id: d.id,
          type: 'document' as const,
          title: d.title || d.reference,
          sub: `${d.reference} • ${d.client?.name || 'Client'}`,
          url: `/documents/${d.id}`,
          icon: TYPE_META[typeKey]?.icon || 'DO',
        };
      }),
      ...clients.map((c) => ({
        id: c.id,
        type: 'client' as const,
        title: c.name,
        sub: `${c.sector || 'Secteur'} • ${c.contactName || c.email || 'Dakar'}`,
        url: `/clients?q=${encodeURIComponent(c.name)}`,
        icon: '◉',
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Erreur recherche' }, { status: 500 });
  }
}
