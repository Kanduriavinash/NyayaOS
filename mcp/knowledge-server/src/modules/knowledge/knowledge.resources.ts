import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';

export class KnowledgeResources {
  @Resource({
    uri: 'app://knowledge-guides',
    name: 'Judicial Guides',
    description: 'Guidelines and summaries for legal procedure and formatting',
    mimeType: 'application/json'
  })
  async getKnowledgeGuides(ctx: ExecutionContext) {
    return {
      guides: [
        { topic: 'Plaint Writing', summary: 'Plaint must contain facts in numbered paragraphs, valuation statement, and jurisdiction details.' },
        { topic: 'Affidavit Format', summary: 'Affidavit must be signed and verified before an authorized oath commissioner.' },
        { topic: 'E-Filing Portal', summary: 'All digital documents must be PDF format and below 20MB file size.' }
      ]
    };
  }
}
