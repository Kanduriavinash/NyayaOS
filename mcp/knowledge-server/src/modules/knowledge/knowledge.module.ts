import { Module } from '@nitrostack/core';
import { KnowledgeTools } from './knowledge.tools.js';
import { KnowledgeResources } from './knowledge.resources.js';

@Module({
  name: 'knowledge',
  description: 'Judicial workflow knowledge base and templates module',
  controllers: [KnowledgeTools, KnowledgeResources]
})
export class KnowledgeModule {}
