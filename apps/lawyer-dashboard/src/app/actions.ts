"use server";

import { prisma } from '@nyayaos/database';
import { revalidatePath } from 'next/cache';

export async function getLawyers() {
  return prisma.user.findMany({
    where: { role: 'LAWYER' }
  });
}

export async function getLawyerCases(lawyerId: string) {
  // Return cases where lawyerId matches or cases without a lawyer that are PENDING_INTAKE/VERIFYING
  return prisma.case.findMany({
    where: {
      OR: [
        { lawyerId },
        { lawyerId: null }
      ]
    },
    include: {
      citizen: true,
      documents: true,
      court: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function claimCase(caseId: string, lawyerId: string) {
  const caseRecord = await prisma.case.update({
    where: { id: caseId },
    data: { lawyerId }
  });

  const lawyer = await prisma.user.findUnique({ where: { id: lawyerId } });

  await prisma.auditLog.create({
    data: {
      action: 'LAWYER_ASSIGNED',
      details: `Lawyer ${lawyer?.name || 'Unknown'} claimed case: ${caseRecord.title}`,
      userId: lawyerId
    }
  });

  revalidatePath('/');
  return caseRecord;
}

export async function draftAIPetition(caseId: string) {
  const caseRecord = await prisma.case.findUnique({
    where: { id: caseId }
  });

  if (!caseRecord) throw new Error('Case not found');

  // Simple template generation
  let plaintTitle = '';
  let plaintContent = '';

  if (caseRecord.category === 'PROPERTY_DISPUTE') {
    plaintTitle = `PLAINT FOR RECOVERY OF POSSESSION OF IMMOVABLE PROPERTY`;
    plaintContent = 
      `IN THE COURT OF CIVIL JURISDICTION\n` +
      `Suit No. _____ of 2026\n\n` +
      `In the Matter of: Citizen vs Respondent\n\n` +
      `The Plaintiff states as follows:\n` +
      `1. The Plaintiff is the lawful owner of the scheduled property by virtue of a registered Sale Deed.\n` +
      `2. On or about ________, the Defendant unauthorizedly encroached upon the scheduled land.\n` +
      `3. Dispute Facts: ${caseRecord.description}\n` +
      `4. Boundary Details: North by Survey 440, South by Road, East by Survey 443, West by Wall.\n` +
      `5. The cause of action arose within territorial jurisdiction of this Hon'ble Court.\n\n` +
      `RELIEFS SOUGHT:\n` +
      `- Declaration of title and possession restoration.\n` +
      `- Permanent injunction against Defendant.\n\n` +
      `Verification: Verified that facts are true to my knowledge.\n` +
      `Signature: Present.`;
  } else {
    plaintTitle = `COMPLAINT FOR DEFICIENCY OF SERVICE UNDER CONSUMER ACT`;
    plaintContent = 
      `BEFORE THE DISTRICT CONSUMER COMMISSION\n` +
      `Complaint No. _____ of 2026\n\n` +
      `The Complainant states as follows:\n` +
      `1. The Complainant purchased goods/services for consideration.\n` +
      `2. Facts: ${caseRecord.description}\n` +
      `3. The Respondent provided defective services and failed to repair under warranty.\n\n` +
      `RELIEFS SOUGHT:\n` +
      `- Full refund of purchase price.\n` +
      `- INR 20,000 compensation for mental harassment.\n\n` +
      `Verification: Verified true and correct.\n` +
      `Signature: Present.`;
  }

  // Update Case status
  await prisma.case.update({
    where: { id: caseId },
    data: { status: 'PENDING_PETITION' }
  });

  revalidatePath('/');
  return { title: plaintTitle, content: plaintContent };
}

export async function submitPetition(caseId: string, title: string, content: string, lawyerId: string) {
  // Create petition document
  await prisma.document.create({
    data: {
      caseId,
      name: 'drafted_petition.pdf',
      type: 'PETITION',
      status: 'PENDING',
      content: `${title}\n\n${content}`
    }
  });

  // Update case status to pending registry validation
  const caseRecord = await prisma.case.update({
    where: { id: caseId },
    data: { status: 'PENDING_REGISTRY' }
  });

  await prisma.auditLog.create({
    data: {
      action: 'PETITION_SUBMITTED',
      details: `Petition submitted by lawyer for case: ${caseRecord.title}. Moved to PENDING_REGISTRY.`,
      userId: lawyerId
    }
  });

  revalidatePath('/');
  return caseRecord;
}
