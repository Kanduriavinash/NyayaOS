import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class IdentityResources {
  @Resource({
    uri: 'app://identity-rules',
    name: 'Identity Verification Guidelines',
    description: 'System rules and standards for user identity verification',
    mimeType: 'application/json'
  })
  async getIdentityRules(ctx: ExecutionContext) {
    return {
      acceptedDocuments: ['aadhaar', 'passport', 'pan', 'voter_id'],
      formats: {
        aadhaar: '12-digit numeric code',
        passport: '8-9 character alphanumeric code starting with a letter',
        pan: '10-character alphanumeric uppercase code',
        voter_id: 'Standard state election commission ID card number'
      },
      otpExpirySeconds: 300,
      maxAttempts: 3
    };
  }
}
