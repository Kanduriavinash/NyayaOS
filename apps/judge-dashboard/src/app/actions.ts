"use server";

import { prisma } from '@nyayaos/database';
import { revalidatePath } from 'next/cache';

export async function getJudges() {
  return prisma.user.findMany({
    where: { role: 'JUDGE' }
  });
}

export async function getJudgeCases(judgeId: string) {
  return prisma.case.findMany({
    where: {
      OR: [
        { judgeId },
        { judgeId: null, status: 'APPROVED' }
      ]
    },
    include: {
      citizen: true,
      lawyer: true,
      documents: true,
      hearings: true,
      orders: true
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function allocateHearing(data: {
  caseId: string;
  judgeId: string;
  dateStr: string;
  room: string;
}) {
  // Convert date string to Date
  const date = new Date(data.dateStr);

  // Assign judge if not already assigned
  await prisma.case.update({
    where: { id: data.caseId },
    data: { 
      judgeId: data.judgeId,
      status: 'SCHEDULED'
    }
  });

  const hearing = await prisma.hearing.create({
    data: {
      caseId: data.caseId,
      judgeId: data.judgeId,
      date,
      room: data.room,
      status: 'SCHEDULED'
    }
  });

  const judge = await prisma.user.findUnique({ where: { id: data.judgeId } });

  await prisma.auditLog.create({
    data: {
      action: 'HEARING_SCHEDULED',
      details: `Hearing scheduled for courtroom ${data.room} on ${date.toLocaleString()} by ${judge?.name || 'Unknown'}. Status set to SCHEDULED.`,
      userId: data.judgeId
    }
  });

  revalidatePath('/');
  return hearing;
}

export async function issueCourtOrder(data: {
  caseId: string;
  judgeId: string;
  title: string;
  content: string;
}) {
  const order = await prisma.order.create({
    data: {
      caseId: data.caseId,
      judgeId: data.judgeId,
      title: data.title,
      content: data.content,
      status: 'ACTIVE'
    }
  });

  const judge = await prisma.user.findUnique({ where: { id: data.judgeId } });

  await prisma.auditLog.create({
    data: {
      action: 'ORDER_ISSUED',
      details: `Court Order "${data.title}" issued by ${judge?.name || 'Unknown'}.`,
      userId: data.judgeId
    }
  });

  revalidatePath('/');
  return order;
}
