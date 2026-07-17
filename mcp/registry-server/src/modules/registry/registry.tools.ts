import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { prisma } from '@nyayaos/database';

export class RegistryTools {
  @Tool({
    name: 'filing_validation',
    description: 'Validate if case filing submission contains all required criteria and documents',
    inputSchema: z.object({
      caseId: z.string().describe('The database case ID to validate')
    })
  })
  async validateFiling(input: { caseId: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Running registry filing validation for case: ${input.caseId}`);

    try {
      const caseRecord = await prisma.case.findUnique({
        where: { id: input.caseId },
        include: { documents: true, citizen: true }
      });

      if (!caseRecord) {
        throw new Error(`Case with ID ${input.caseId} not found`);
      }

      // Check required documents based on case category
      const documentTypes = caseRecord.documents.map(d => d.type);
      const errors: string[] = [];

      if (!caseRecord.title || caseRecord.title.trim().length < 5) {
        errors.push('Case title is missing or too short');
      }

      if (!caseRecord.description || caseRecord.description.trim().length < 20) {
        errors.push('Case description is missing or lacks detail');
      }

      if (caseRecord.category === 'PROPERTY_DISPUTE') {
        if (!documentTypes.includes('ID_PROOF')) {
          errors.push('Missing required Identity Proof');
        }
        if (!documentTypes.includes('PROPERTY_DEED')) {
          errors.push('Missing required Property Conveyance/Sale Deed');
        }
      } else if (caseRecord.category === 'CONSUMER_CASE') {
        if (!documentTypes.includes('EVIDENCE')) {
          errors.push('Missing invoice/receipt proof of purchase');
        }
      }

      const isValid = errors.length === 0;

      // Update case status in database
      const newStatus = isValid ? 'APPROVED' : 'REJECTED';
      await prisma.case.update({
        where: { id: input.caseId },
        data: { status: newStatus }
      });

      await prisma.auditLog.create({
        data: {
          action: isValid ? 'FILING_APPROVED' : 'FILING_REJECTED',
          details: isValid 
            ? `Registry automatically approved filing for case: ${caseRecord.title}`
            : `Registry rejected filing for case: ${caseRecord.title}. Errors: ${errors.join(', ')}`,
          userId: caseRecord.citizenId
        }
      });

      return {
        status: isValid ? 'success' : 'failed',
        caseId: caseRecord.id,
        title: caseRecord.title,
        statusUpdatedTo: newStatus,
        errors,
        message: isValid 
          ? 'Case filing validated successfully and approved'
          : 'Filing verification failed. Correct the listed issues.'
      };
    } catch (err: any) {
      ctx.logger.error(`Error in filing validation: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }

  @Tool({
    name: 'court_fee_calculation',
    description: 'Calculate the filing court fee based on case category and dispute claim value',
    inputSchema: z.object({
      category: z.enum(['PROPERTY_DISPUTE', 'CONSUMER_CASE', 'FAMILY_CASE', 'CRIMINAL_SUPPORT', 'MEDIATION']),
      claimAmount: z.number().describe('The disputed value or claimed financial relief amount in INR')
    })
  })
  async calculateCourtFee(input: { category: string; claimAmount: number }, ctx: ExecutionContext) {
    ctx.logger.info(`Calculating court fee for category ${input.category} with claim amount ${input.claimAmount}`);

    let fee = 0;
    if (input.category === 'PROPERTY_DISPUTE') {
      // 1% of property value, minimum INR 1,000, maximum INR 50,000
      fee = Math.max(1000, Math.min(50000, input.claimAmount * 0.01));
    } else if (input.category === 'CONSUMER_CASE') {
      // Standard slabs
      if (input.claimAmount <= 500000) fee = 500;
      else if (input.claimAmount <= 2000000) fee = 2000;
      else fee = 5000;
    } else if (input.category === 'FAMILY_CASE') {
      fee = 200; // Flat fee
    } else if (input.category === 'MEDIATION') {
      fee = 0; // Free track
    } else {
      fee = 1000; // Default flat civil court fee
    }

    return {
      status: 'success',
      category: input.category,
      claimAmount: input.claimAmount,
      calculatedFee: fee,
      formattedFee: `INR ${fee.toLocaleString()}`
    };
  }

  @Tool({
    name: 'jurisdiction_check',
    description: 'Check if court has territorial jurisdiction over property location or defendant address zip code',
    inputSchema: z.object({
      courtId: z.string().describe('The database court ID to check'),
      zipCode: z.string().describe('The 6-digit postal zip code of the dispute location')
    })
  })
  async checkJurisdiction(input: { courtId: string; zipCode: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Checking jurisdiction for court: ${input.courtId} and ZIP: ${input.zipCode}`);

    try {
      const court = await prisma.court.findUnique({
        where: { id: input.courtId }
      });

      if (!court) {
        throw new Error(`Court with ID ${input.courtId} not found`);
      }

      // Simulation: Delhi courts match 11xxxx, Delhi/NCR, Mumbai 40xxxx, Bengaluru 56xxxx
      let hasJurisdiction = false;
      if (court.location.toLowerCase().includes('delhi') && input.zipCode.startsWith('11')) {
        hasJurisdiction = true;
      } else if (court.location.toLowerCase().includes('mumbai') && input.zipCode.startsWith('40')) {
        hasJurisdiction = true;
      } else if (court.location.toLowerCase().includes('bengaluru') && input.zipCode.startsWith('56')) {
        hasJurisdiction = true;
      } else if (court.location.toLowerCase().includes('national') || court.location.toLowerCase().includes('online')) {
        hasJurisdiction = true; // Universal jurisdiction
      }

      return {
        status: 'success',
        courtName: court.name,
        courtLocation: court.location,
        zipCode: input.zipCode,
        hasJurisdiction,
        message: hasJurisdiction
          ? `The dispute location falls under territorial jurisdiction of ${court.name}`
          : `Out of jurisdiction. This dispute location does not fall under the territorial jurisdiction of ${court.name}.`
      };
    } catch (err: any) {
      ctx.logger.error(`Error checking jurisdiction: ${err.message}`);
      return {
        status: 'error',
        message: err.message
      };
    }
  }
}
