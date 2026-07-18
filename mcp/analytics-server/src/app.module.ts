import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'analytics-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
  ,
  transport: {
    type: 'dual',
    http: {
      port: 4007
    }
  }
})
@Module({
  name: 'app',
  description: 'Root module for Analytics Server',
  imports: [
    ConfigModule.forRoot(),
    AnalyticsModule
  ]
})
export class AppModule {}
