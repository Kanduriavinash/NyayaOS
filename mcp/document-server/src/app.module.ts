import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { DocumentModule } from './modules/document/document.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'document-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root module for Document Server',
  imports: [
    ConfigModule.forRoot(),
    DocumentModule
  ]
})
export class AppModule {}
