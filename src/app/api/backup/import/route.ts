import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { DocumentType, DocumentStatus, ClientType } from '@prisma/client';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const backupSchema = z.object({
  organization: z.any().optional(),
  clients: z.array(z.any()).optional(),
  documents: z.array(z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const json = await request.json();
    const data = backupSchema.parse(json);

    if (!Array.isArray(data.clients) && !Array.isArray(data.documents)) {
      return NextResponse.json(
        { error: 'Format de fichier de sauvegarde invalide.' },
        { status: 400 }
      );
    }

    const clientIdMap = new Map<string, string>();

    await prisma.$transaction(async (tx) => {
      // 1. Update company settings if provided
      if (data.organization) {
        await tx.organization.update({
          where: { id: user.organizationId },
          data: {
            name: data.organization.name || undefined,
            legalName: data.organization.legalName || undefined,
            email: data.organization.email || undefined,
            phone: data.organization.phone || undefined,
            website: data.organization.website || undefined,
            address: data.organization.address || undefined,
            city: data.organization.city || undefined,
            country: data.organization.country || undefined,
            currency: data.organization.currency || undefined,
            taxRate: data.organization.taxRate !== undefined ? Number(data.organization.taxRate) : undefined,
            paymentTerms: data.organization.paymentTerms || undefined,
          },
        });
      }

      // 2. Import clients
      if (Array.isArray(data.clients)) {
        for (const c of data.clients) {
          if (!c.name) continue;
          const existing = await tx.client.findFirst({
            where: { organizationId: user.organizationId, name: c.name },
          });

          if (existing) {
            clientIdMap.set(c.id, existing.id);
          } else {
            const created = await tx.client.create({
              data: {
                organizationId: user.organizationId,
                name: c.name,
                sector: c.sector || null,
                contactName: c.contactName || null,
                email: c.email || null,
                phone: c.phone || null,
                address: c.address || 'Dakar, Sénégal',
                notes: c.notes || null,
                type: ClientType.CLIENT,
              },
            });
            clientIdMap.set(c.id, created.id);
          }
        }
      }

      // 3. Import documents
      if (Array.isArray(data.documents)) {
        for (const d of data.documents) {
          if (!d.reference) continue;
          const targetClientId = clientIdMap.get(d.clientId) || d.clientId;
          const clientExists = await tx.client.findUnique({
            where: { id: targetClientId },
          });
          if (!clientExists) continue;

          const existingDoc = await tx.document.findUnique({
            where: {
              organizationId_reference: {
                organizationId: user.organizationId,
                reference: d.reference,
              },
            },
          });

          if (existingDoc) continue; // Don't overwrite existing reference

          const enumType = (d.type?.toUpperCase() || 'QUOTE') as DocumentType;
          const enumStatus = (d.status?.toUpperCase() || 'DRAFT') as DocumentStatus;

          await tx.document.create({
            data: {
              organizationId: user.organizationId,
              clientId: targetClientId,
              type: enumType,
              reference: d.reference,
              title: d.title || d.reference,
              intro: d.intro || null,
              status: enumStatus,
              issueDate: d.issueDate ? new Date(d.issueDate) : new Date(),
              dueDate: d.dueDate ? new Date(d.dueDate) : null,
              validityDays: d.validityDays ? Number(d.validityDays) : 30,
              currency: d.currency || 'FCFA',
              discountPercent: Number(d.discountPercent || 0),
              taxRate: Number(d.taxRate || 0),
              depositAmount: Number(d.depositAmount || 0),
              conditions: d.conditions || null,
              notes: d.notes || null,
              options: d.options || {},
              createdById: user.id,
              lines: {
                create: (d.lines || []).map((l: any, idx: number) => ({
                  position: idx,
                  name: l.name || 'Prestation',
                  description: l.description || null,
                  quantity: Number(l.qty ?? l.quantity ?? 1),
                  unitPrice: Number(l.price ?? l.unitPrice ?? 0),
                })),
              },
              sections: {
                create: (d.sections || []).map((s: any, idx: number) => ({
                  position: idx,
                  title: s.title || 'Section',
                  content: s.content || '',
                  sectionType: s.sectionType || 'standard',
                })),
              },
            },
          });
        }
      }

      // Log import activity
      await tx.activityLog.create({
        data: {
          organizationId: user.organizationId,
          actorId: user.id,
          entityType: 'Organization',
          entityId: user.organizationId,
          action: 'DATA_IMPORTED',
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Backup import error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l’importation' },
      { status: 400 }
    );
  }
}
