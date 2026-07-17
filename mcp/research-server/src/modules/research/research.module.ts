import { Module } from '@nitrostack/core';
import { ResearchTools } from './research.tools.js';
import { ResearchResources } from './research.resources.js';

@Module({
  name: 'research',
  description: 'Legal research and statute search module',
  controllers: [ResearchTools, ResearchResources]
})
export class ResearchModule {}
