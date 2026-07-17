import { Module } from '@nitrostack/core';
import { DocumentTools } from './document.tools.js';
import { DocumentResources } from './document.resources.js';

@Module({
  name: 'document',
  description: 'Document processing and verification module',
  controllers: [DocumentTools, DocumentResources]
})
export class DocumentModule {}
