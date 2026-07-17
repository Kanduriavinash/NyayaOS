import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { ResearchModule } from './modules/research/research.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'research-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root module for Research Server',
  imports: [
    ConfigModule.forRoot(),
    ResearchModule
  ]
})
export class AppModule {}
