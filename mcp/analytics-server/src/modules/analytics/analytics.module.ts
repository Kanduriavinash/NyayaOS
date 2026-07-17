import { Module } from '@nitrostack/core';
import { AnalyticsTools } from './analytics.tools.js';

@Module({
  name: 'analytics',
  description: 'Judicial analytics and case status report module',
  controllers: [AnalyticsTools]
})
export class AnalyticsModule {}
