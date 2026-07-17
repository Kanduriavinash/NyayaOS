import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { SchedulingModule } from './modules/scheduling/scheduling.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'scheduling-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root module for Scheduling Server',
  imports: [
    ConfigModule.forRoot(),
    SchedulingModule
  ]
})
export class AppModule {}
