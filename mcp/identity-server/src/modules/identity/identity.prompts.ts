import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';

export class IdentityPrompts {
  @Prompt({
    name: 'explain_verification_process',
    description: 'Provide an explanation to the user about why verification is needed and what document formats are accepted',
    arguments: [
      { name: 'citizenName', description: 'Name of the citizen', required: true }
    ]
  })
  async explainVerification(args: { citizenName: string }, ctx: ExecutionContext) {
    return {
      messages: [
        {
          role: 'user',
          content: `You are the NyayaOS Intake Assistant. Explain the identity verification steps to the citizen ${args.citizenName}. Mention that they need to verify their identity via Aadhaar, Passport, PAN, or Voter ID to ensure the safety and validity of legal submissions.`
        }
      ]
    };
  }
}
