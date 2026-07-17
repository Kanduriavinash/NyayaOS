import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class KnowledgeTools {
  @Tool({
    name: 'fetch_acts',
    description: 'Fetch legal text details for a specific act by ID',
    inputSchema: z.object({
      actId: z.string().describe('The ID of the act, e.g., tp-1882,cp-2019')
    })
  })
  async fetchActs(input: { actId: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Fetching act details for: ${input.actId}`);

    if (input.actId === 'tp-1882') {
      return {
        status: 'success',
        actName: 'The Transfer of Property Act, 1882',
        enacted: '17-February-1882',
        summary: 'An Act to amend the law relating to the transfer of property by act of parties. Contains 137 sections across 8 chapters.'
      };
    } else if (input.actId === 'cp-2019') {
      return {
        status: 'success',
        actName: 'The Consumer Protection Act, 2019',
        enacted: '09-August-2019',
        summary: 'An Act to provide for protection of the interests of consumers and for the said purpose, to establish authorities for timely and effective administration and settlement of consumers disputes.'
      };
    } else {
      return {
        status: 'failed',
        message: `Act with ID "${input.actId}" not found in catalogue.`
      };
    }
  }

  @Tool({
    name: 'fetch_court_rules',
    description: 'Retrieve general court procedural rules and conduct guidelines',
    inputSchema: z.object({})
  })
  async fetchCourtRules(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Fetching court rules and guidelines');

    return {
      status: 'success',
      rules: [
        { ruleNo: 'Rule 1', title: 'Filing Timeline', description: 'All civil plaints must be filed within 90 days of the cause of action.' },
        { ruleNo: 'Rule 2', title: 'Service of Summons', description: 'Summons must be served to the defendant within 30 days of case approval.' },
        { ruleNo: 'Rule 3', title: 'Written Statement', description: 'The defendant must file a written statement within 30 days of receiving the summons.' },
        { ruleNo: 'Rule 4', title: 'Adjournments', description: 'No more than 3 adjournments shall be granted to either party in a case.' }
      ]
    };
  }
}
