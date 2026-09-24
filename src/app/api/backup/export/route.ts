import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const org = await prisma.organization.findUnique({
      where: { id: user.organizationId },
      include: {
        clients: { where: { archivedAt: null } },
        documents: {
          include: {
            lines: true,
            sections: true,
            payments: true,
          },
        },
        templates: true,
        catalogItems: true,
      },
    });

    if (!org) return NextResponse.json({ error: 'Organisation non trouvée' }, { status: 404 });

    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      organization: {
        name: org.name,
        legalName: org.legalName,
        email: org.email,
        phone: org.phone,
        website: org.website,
        address: org.address,
        city: org.city,
        country: org.country,
        currency: org.currency,
        taxRate: Number(org.taxRate),
        quoteValidityDays: org.quoteValidityDays,
        paymentTerms: org.paymentTerms,
      },
      clients: org.clients.map((c) => ({
        id: c.id,
        name: c.name,
        sector: c.sector,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        notes: c.notes,
      })),
      documents: org.documents.map((d) => ({
        id: d.id,
        clientId: d.clientId,
        type: d.type,
        reference: d.reference,
        title: d.title,
        intro: d.intro,
        status: d.status,
        issueDate: d.issueDate.toISOString(),
        dueDate: d.dueDate ? d.dueDate.toISOString() : null,
        validityDays: d.validityDays,
        discountPercent: Number(d.discountPercent),
        taxRate: Number(d.taxRate),
        depositAmount: Number(d.depositAmount),
        conditions: d.conditions,
        notes: d.notes,
        options: d.options,
        lines: d.lines.map((l) => ({
          name: l.name,
          description: l.description,
          qty: Number(l.quantity),
          price: Number(l.unitPrice),
        })),
        sections: d.sections.map((s) => ({
          title: s.title,
          content: s.content,
          sectionType: s.sectionType,
        })),
      })),
      templates: org.templates,
      catalog: org.catalogItems,
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="sparkline-desk-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Backup export error:', error);
    return NextResponse.json({ error: 'Erreur lors de l’export' }, { status: 500 });
  }
}
