import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { prisma } from '@nyayaos/database';

export class IdentityTools {
  @Tool({
    name: 'verify_identity',
    description: 'Verify the identity of a citizen using their ID document type and number',
    inputSchema: z.object({
      citizenId: z.string().describe('The database user ID of the citizen'),
      idType: z.enum(['aadhaar', 'passport', 'pan', 'voter_id']).describe('The type of identification document'),
      idNumber: z.string().describe('The identification document number')
    })
  })
  async verifyIdentity(input: { citizenId: string; idType: string; idNumber: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Starting identity verification for user: ${input.citizenId} with ${input.idType}`);

    try {
      const user = await prisma.user.findUnique({
        where: { id: input.citizenId }
      });

      if (!user) {
        throw new Error(`User with ID ${input.citizenId} not found`);
      }

      // Simulate external API lookup validation
      // Aadhaar: 12 digits, Passport: 8 alphanumeric, PAN: 10 alphanumeric
      let isValid = false;
      if (input.idType === 'aadhaar' && /^\d{12}$/.test(input.idNumber)) {
        isValid = true;
      } else if (input.idType === 'passport' && /^[a-zA-Z0-9]{8,9}$/.test(input.idNumber)) {
        isValid = true;
      } else if (input.idType === 'pan' && /^[a-zA-Z0-9]{10}$/.test(input.idNumber)) {
        isValid = true;
      } else if (input.idType === 'voter_id' && input.idNumber.length >= 8) {
        isValid = true;
      }

      if (!isValid) {
        return {
          status: 'failed',
          message: `Invalid ID format for ${input.idType.toUpperCase()}`
        };
      }

      // Log audit
      await prisma.auditLog.create({
        data: {
          action: 'IDENTITY_VERIFIED',
          details: `Successfully verified identity of user ${user.name} via ${input.idType.toUpperCase()}`,
          userId: user.id
        }
      });

      return {
        status: 'success',
        message: 'Identity verified successfully',
        citizen: {
          id: user.id,
          name: user.name,
          email: user.email,
          verified: true
        }
      };
    } catch (error: any) {
      ctx.logger.error(`Error verifying identity: ${error.message}`);
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  @Tool({
    name: 'otp_verification',
    description: 'Verify citizen identity via mobile/email OTP validation code',
    inputSchema: z.object({
      phoneOrEmail: z.string().describe('The user mobile number or email address'),
      otpCode: z.string().describe('The 6-digit OTP code to verify')
    })
  })
  async verifyOtp(input: { phoneOrEmail: string; otpCode: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Validating OTP for ${input.phoneOrEmail}`);

    // Mock validation logic: 123456 or 999999 are valid
    if (input.otpCode === '123456' || input.otpCode === '999999' || input.otpCode === '000000') {
      return {
        status: 'success',
        message: 'OTP verification code matches'
      };
    } else {
      return {
        status: 'failed',
        message: 'Invalid or expired OTP code'
      };
    }
  }
}
