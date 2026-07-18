import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { KnowledgeModule } from './modules/knowledge/knowledge.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'knowledge-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
  ,
  transport: {
    type: 'dual',
    http: {
      port: 4008
    }
  }
})
@Module({
  name: 'app',
  description: 'Root module for Knowledge Server',
  imports: [
    ConfigModule.forRoot(),
    KnowledgeModule
  ]
})
export class AppModule {}
