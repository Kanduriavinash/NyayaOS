import { Module } from '@nitrostack/core';
import { NotificationTools } from './notification.tools.js';

@Module({
  name: 'notification',
  description: 'Judicial notification delivery module (Email, SMS, Push)',
  controllers: [NotificationTools]
})
export class NotificationModule {}
