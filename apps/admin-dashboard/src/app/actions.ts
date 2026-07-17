"use server";

import { prisma } from '@nyayaos/database';
import { revalidatePath } from 'next/cache';

export async function getAdminStats() {
  const caseCounts = await prisma.case.groupBy({
    by: ['status'],
    _count: true
  });

  const userCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });

  const totalCases = await prisma.case.count();
  const totalUsers = await prisma.user.count();

  return {
    casesByStatus: caseCounts.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>),
    usersByRole: userCounts.reduce((acc, curr) => {
      acc[curr.role] = curr._count;
      return acc;
    }, {} as Record<string, number>),
    totalCases,
    totalUsers
  };
}

export async function getAuditLogs() {
  return prisma.auditLog.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { role: 'asc' }
  });
}
