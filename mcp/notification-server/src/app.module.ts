import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { NotificationModule } from './modules/notification/notification.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'notification-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
  ,
  transport: {
    type: 'dual',
    http: {
      port: 4006
    }
  }
})
@Module({
  name: 'app',
  description: 'Root module for Notification Server',
  imports: [
    ConfigModule.forRoot(),
    NotificationModule
  ]
})
export class AppModule {}
