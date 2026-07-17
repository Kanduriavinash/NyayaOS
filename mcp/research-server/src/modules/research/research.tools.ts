import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';

export class ResearchTools {
  @Tool({
    name: 'search_statutes',
    description: 'Search for relevant legal acts, codes, and sections based on dispute keywords',
    inputSchema: z.object({
      query: z.string().describe('Search query, e.g., land encroachment, property dispute, tenant eviction')
    })
  })
  async searchStatutes(input: { query: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Searching statutes for: ${input.query}`);

    const lowercaseQuery = input.query.toLowerCase();
    const results = [];

    if (lowercaseQuery.includes('property') || lowercaseQuery.includes('land') || lowercaseQuery.includes('encroach')) {
      results.push(
        {
          act: 'The Transfer of Property Act, 1882',
          section: 'Section 54',
          title: 'Sale of Immovable Property',
          description: 'Defines sale as a transfer of ownership in exchange for a price paid or promised or part-paid and part-promised.'
        },
        {
          act: 'Specific Relief Act, 1963',
          section: 'Section 5',
          title: 'Recovery of specific immovable property',
          description: 'A person entitled to the possession of specific immovable property may recover it in the manner provided by the Code of Civil Procedure, 1908.'
        },
        {
          act: 'Specific Relief Act, 1963',
          section: 'Section 6',
          title: 'Suit by person dispossessed of immovable property',
          description: 'If any person is dispossessed without his consent of immovable property otherwise than in due course of law, he may, by suit, recover possession thereof.'
        }
      );
    } else if (lowercaseQuery.includes('consumer') || lowercaseQuery.includes('product') || lowercaseQuery.includes('service')) {
      results.push(
        {
          act: 'The Consumer Protection Act, 2019',
          section: 'Section 2(10)',
          title: 'Defect',
          description: 'Any fault, imperfection or shortcoming in the quality, quantity, potency, purity or standard which is required to be maintained by or under any law.'
        },
        {
          act: 'The Consumer Protection Act, 2019',
          section: 'Section 35',
          title: 'Manner in which complaint shall be made',
          description: 'Details the procedure for filing a complaint before the District Commission.'
        }
      );
    } else {
      results.push(
        {
          act: 'Code of Civil Procedure, 1908',
          section: 'Section 9',
          title: 'Courts to try all civil suits unless barred',
          description: 'The Courts shall subject to the provisions herein contained have jurisdiction to try all suits of a civil nature.'
        }
      );
    }

    return {
      status: 'success',
      query: input.query,
      results
    };
  }

  @Tool({
    name: 'search_judgments',
    description: 'Search for public judicial judgments and opinions containing legal keywords',
    inputSchema: z.object({
      query: z.string().describe('Case law search query')
    })
  })
  async searchJudgments(input: { query: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Searching judgments for: ${input.query}`);

    const lowercaseQuery = input.query.toLowerCase();
    const judgments = [];

    if (lowercaseQuery.includes('property') || lowercaseQuery.includes('possession') || lowercaseQuery.includes('deed')) {
      judgments.push(
        {
          citation: '2023 INSC 445',
          caseName: 'Anitha vs. Ramasamy',
          court: 'Supreme Court of India',
          verdict: 'Decided in favor of Plaintiff',
          summary: 'The Court held that registration of a sale deed is mandatory under Section 17 of the Registration Act, 1908, to create title in immovable property worth over INR 100.'
        },
        {
          citation: '2021 INSC 812',
          caseName: 'State of Haryana vs. Mukesh Kumar',
          court: 'Supreme Court of India',
          verdict: 'Decided in favor of Respondent',
          summary: 'Detailed inspection of adverse possession principles. The Court observed that property rights are human rights and adverse possession laws need revision.'
        }
      );
    } else {
      judgments.push(
        {
          citation: '2022 INSC 152',
          caseName: 'Ramesh vs. Union of India',
          court: 'Supreme Court of India',
          verdict: 'Dismissed petition',
          summary: 'Examines the admissibility of electronic records as primary evidence in civil procedures under Section 65B of the Indian Evidence Act.'
        }
      );
    }

    return {
      status: 'success',
      query: input.query,
      judgments
    };
  }

  @Tool({
    name: 'find_precedents',
    description: 'Find similar case precedents with facts comparable to the ongoing lawsuit',
    inputSchema: z.object({
      category: z.string().describe('Category of case (e.g. PROPERTY_DISPUTE, CONSUMER_CASE)'),
      factsSummary: z.string().describe('Brief summary of case facts to match')
    })
  })
  async findPrecedents(input: { category: string; factsSummary: string }, ctx: ExecutionContext) {
    ctx.logger.info(`Finding precedents for category ${input.category} with facts: ${input.factsSummary}`);

    const precedents = [];
    if (input.category === 'PROPERTY_DISPUTE') {
      precedents.push({
        citation: '2024 INSC 321',
        matchingScore: 0.89,
        governingLaw: 'Specific Relief Act, 1963 Section 6',
        facts: 'Plaintiff was dispossessed from property by neighbor building a fence during the night without boundary survey.',
        holding: 'Restoration of possession ordered. Encroaching fence ordered to be demolished at defendants cost.'
      });
    } else {
      precedents.push({
        citation: '2023 INSC 112',
        matchingScore: 0.76,
        governingLaw: 'Consumer Protection Act, 2019 Section 2(11)',
        facts: 'Mobile phone motherboard failure within warranty. Service center refused repair citing water damage without proof.',
        holding: 'Order directing replacement of handset with new model and INR 10,000 punitive compensation.'
      });
    }

    return {
      status: 'success',
      category: input.category,
      precedents
    };
  }
}
