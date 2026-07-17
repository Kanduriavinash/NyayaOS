"use server";

import { prisma } from '@nyayaos/database';
import { revalidatePath } from 'next/cache';

export async function getCitizens() {
  return prisma.user.findMany({
    where: { role: 'CITIZEN' }
  });
}

export async function getCourts() {
  return prisma.court.findMany();
}

export async function getCases(citizenId: string) {
  return prisma.case.findMany({
    where: { citizenId },
    include: {
      documents: true,
      hearings: true,
      judge: true,
      court: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCase(data: {
  citizenId: string;
  title: string;
  description: string;
  category: string;
  claimAmount: number;
  courtId: string;
}) {
  const caseRecord = await prisma.case.create({
    data: {
      title: data.title,
      description: data.description,
      category: data.category,
      citizenId: data.citizenId,
      courtId: data.courtId,
      status: 'PENDING_INTAKE'
    }
  });

  // Log in AuditLog
  await prisma.auditLog.create({
    data: {
      action: 'CASE_INTENDED',
      details: `Case "${data.title}" filed by citizen. Status set to PENDING_INTAKE.`,
      userId: data.citizenId
    }
  });

  revalidatePath('/');
  return caseRecord;
}

export async function verifyUserIdentity(citizenId: string, idType: string, idNumber: string) {
  // Simulate Identity MCP server verification
  const user = await prisma.user.findUnique({
    where: { id: citizenId }
  });

  if (!user) throw new Error('User not found');

  // Audit Log
  await prisma.auditLog.create({
    data: {
      action: 'IDENTITY_VERIFICATION_STARTED',
      details: `Identity verification initiated using ${idType.toUpperCase()}`,
      userId: citizenId
    }
  });

  // Simulating validation logic
  const isValid = idNumber.length >= 8;
  
  if (isValid) {
    await prisma.auditLog.create({
      data: {
        action: 'IDENTITY_VERIFIED',
        details: `Successfully verified identity of user ${user.name} via ${idType.toUpperCase()}`,
        userId: citizenId
      }
    });

    // Update active cases status
    const activeCases = await prisma.case.findMany({
      where: { citizenId, status: 'PENDING_INTAKE' }
    });

    for (const c of activeCases) {
      await prisma.case.update({
        where: { id: c.id },
        data: { status: 'VERIFYING_IDENTITY' }
      });
    }
  }

  revalidatePath('/');
  return { success: isValid, message: isValid ? 'Identity verified' : 'Invalid ID number format' };
}

export async function uploadMockDocument(caseId: string, name: string, type: string, contentText: string) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId }
  });

  if (!caseRecord) throw new Error('Case not found');

  const document = await prisma.document.create({
    data: {
      caseId,
      name,
      type,
      status: 'PENDING',
      content: contentText
    }
  });

  // Update Case status to document verification
  await prisma.case.update({
    where: { id: caseId },
    data: { status: 'VERIFYING_DOCS' }
  });

  // Simulate Document MCP checking signatures and page counts
  const hasSignature = contentText.toLowerCase().includes('signature') || contentText.length > 50;
  const isComplete = !contentText.toLowerCase().includes('missing');

  const isValid = hasSignature && isComplete;

  await prisma.document.update({
    where: { id: document.id },
    data: { status: isValid ? 'VALID' : 'INVALID' }
  });

  await prisma.auditLog.create({
    data: {
      action: 'DOCUMENT_PROCESSED',
      details: `Document "${name}" processed. Signature: ${hasSignature}, Complete: ${isComplete}. Status set to ${isValid ? 'VALID' : 'INVALID'}.`,
      userId: caseRecord.citizenId
    }
  });

  revalidatePath('/');
  return { success: isValid, document };
}
