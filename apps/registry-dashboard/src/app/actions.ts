"use server";

import { prisma } from '@nyayaos/database';
import { revalidatePath } from 'next/cache';

export async function getRegistryCases() {
  return prisma.case.findMany({
    where: {
      status: {
        in: ['PENDING_REGISTRY', 'APPROVED', 'REJECTED']
      }
    },
    include: {
      citizen: true,
      lawyer: true,
      documents: true
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function approveFiling(caseId: string, officerId: string) {
  const caseRecord = await prisma.case.update({
    where: { id: caseId },
    data: { status: 'APPROVED' }
  });

  const officer = await prisma.user.findUnique({ where: { id: officerId } });

  await prisma.auditLog.create({
    data: {
      action: 'REGISTRY_APPROVED',
      details: `Case filing approved by officer ${officer?.name || 'Unknown'}. Moved to APPROVED.`,
      userId: officerId
    }
  });

  revalidatePath('/');
  return caseRecord;
}

export async function rejectFiling(caseId: string, officerId: string, reason: string) {
  const caseRecord = await prisma.case.update({
    where: { id: caseId },
    data: { status: 'REJECTED' }
  });

  // Create a record of the rejection reason
  await prisma.document.create({
    data: {
      caseId,
      name: 'rejection_notice.txt',
      type: 'OTHER',
      status: 'INVALID',
      content: `REJECTION NOTICE FROM COURT REGISTRY\nRejection Reason: ${reason}`
    }
  });

  const officer = await prisma.user.findUnique({ where: { id: officerId } });

  await prisma.auditLog.create({
    data: {
      action: 'REGISTRY_REJECTED',
      details: `Case filing rejected by officer ${officer?.name || 'Unknown'}. Reason: ${reason}. Moved to REJECTED.`,
      userId: officerId
    }
  });

  revalidatePath('/');
  return caseRecord;
}
