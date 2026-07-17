import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { prisma } from '@nyayaos/database';

export class SchedulingTools {
  @Tool({
    name: 'hearing_allocation',
    description: 'Allocate hearing room and scheduled date for a civil case. Assigns a judge to the case.',
    inputSchema: z.object({
      caseId: z.string().describe('The database case ID'),
      courtId: z.string().describe('The database court ID where the hearing will occur'),
      daysOffset: z.number().default(14).describe('Days from today to schedule the hearing')
    })
  })
  async allocateHearing(input: { caseId: string; courtId: string; daysOffset: number }, ctx: ExecutionContext) {
    ctx.logger.info(`Allocating hearing for case: ${input.caseId} in court: ${input.courtId}`);

    try {
      const caseRecord = await prisma.case.findUnique({
        where: { id: input.caseId }
      });

      if (!caseRecord) {
        throw new Error(`Case with ID ${input.caseId} not found`);
      }

      // Find a judge to assign
      const judge = await prisma.user.findFirst({
        where: { role: 'JUDGE' }
      });

      if (!judge) {
        throw new Error('No judges available in system database');
      }

      // Calculate date
      const hearingDate = new Date();
      hearingDate.setDate(hearingDate.getDate() + input.daysOffset);
      hearingDate.setHours(10, 0, 0, 0); // Default 10:00 AM

      // Determine a courtroom
      const roomNumber = `Courtroom No. ${Math.floor(Math.random() * 5) + 1}`;

      // Create hearing record in transaction
      const [hearing, updatedCase] = await prisma.$transaction([
        prisma.hearing.create({
          data: {
            caseId: input.caseId,
            date: hearingDate,
            room: roomNumber,
            status: 'SCHEDULED',
            judgeId: judge.id
          }
        }),
        prisma.case.update({
          where: { id: input.caseId },
          data: {
            status: 'SCHEDULED',
            judgeId: judge.id,
            courtId: input.courtId
          }
        })
      ]);

      await prisma.auditLog.create({
        data: {
          action: 'HEARING_SCHEDULED',
          details: `Scheduled hearing for case "${caseRecord.title}" in ${roomNumber} on ${hearingDate.toDateString()} under Judge ${judge.name}`,
          userId: judge.id
        }
      });

      return {
        status: 'success',
        caseId: updatedCase.id,
        hearingId: hearing.id,
        date: hearingDate.toISOString(),
        room: roomNumber,
        judge: {
          id: judge.id,
          name: judge.name
        },
        message: `Hearing successfully scheduled for ${hearingDate.toDateString()} in ${roomNumber}`
      };
    } catch (err: any) {
      ctx.logger.error(`Error allocating hearing: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }

  @Tool({
    name: 'court_availability',
    description: 'List scheduled hearings for a court room to verify availability',
    inputSchema: z.object({
      courtId: z.string().describe('The database court ID'),
      date: z.string().describe('The date to check availability (YYYY-MM-DD)')
    })
  })
  async checkCourtAvailability(input: { courtId: string; date: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Checking availability for court ${input.courtId} on date: ${input.date}`);

    try {
      const targetDate = new Date(input.date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const scheduledHearings = await prisma.hearing.findMany({
        where: {
          case: { courtId: input.courtId },
          date: {
            gte: startOfDay,
            lte: endOfDay
          }
        },
        include: {
          case: true,
          judge: true
        }
      });

      const slots = ['10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM'];
      const reservedSlots: string[] = scheduledHearings.map(h => {
        const hours = h.date.getHours();
        if (hours === 10) return '10:00 AM';
        if (hours === 11) return '11:30 AM';
        if (hours === 14) return '02:00 PM';
        if (hours === 15) return '03:30 PM';
        return '';
      }).filter(Boolean) as string[];

      const availableSlots = slots.filter(s => !reservedSlots.includes(s));

      return {
        status: 'success',
        date: input.date,
        scheduledCount: scheduledHearings.length,
        reservedSlots,
        availableSlots,
        hearingsList: scheduledHearings.map(h => ({
          id: h.id,
          caseTitle: h.case.title,
          room: h.room,
          time: h.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          judgeName: h.judge?.name || 'N/A'
        }))
      };
    } catch (err: any) {
      ctx.logger.error(`Error checking court availability: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }

  @Tool({
    name: 'calendar_management',
    description: 'Fetch calendar items (hearings list) for a user based on their ID',
    inputSchema: z.object({
      userId: z.string().describe('The user database ID')
    })
  })
  async getCalendar(input: { userId: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Fetching calendar for user: ${input.userId}`);

    try {
      const user = await prisma.user.findUnique({
        where: { id: input.userId }
      });

      if (!user) {
        throw new Error(`User with ID ${input.userId} not found`);
      }

      let hearings = [];
      if (user.role === 'JUDGE') {
        hearings = await prisma.hearing.findMany({
          where: { judgeId: user.id },
          include: { case: true, judge: true }
        });
      } else if (user.role === 'LAWYER') {
        hearings = await prisma.hearing.findMany({
          where: { case: { lawyerId: user.id } },
          include: { case: true, judge: true }
        });
      } else {
        hearings = await prisma.hearing.findMany({
          where: { case: { citizenId: user.id } },
          include: { case: true, judge: true }
        });
      }

      return {
        status: 'success',
        userId: user.id,
        userRole: user.role,
        hearings: hearings.map(h => ({
          hearingId: h.id,
          caseId: h.caseId,
          caseTitle: h.case.title,
          date: h.date.toISOString(),
          room: h.room,
          status: h.status,
          judgeName: user.role === 'JUDGE' ? user.name : (h.judge?.name || 'N/A')
        }))
      };
    } catch (err: any) {
      ctx.logger.error(`Error in calendar fetch: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }
}
