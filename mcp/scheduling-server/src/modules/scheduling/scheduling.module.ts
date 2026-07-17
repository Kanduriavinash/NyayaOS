import { Module } from '@nitrostack/core';
import { SchedulingTools } from './scheduling.tools.js';

@Module({
  name: 'scheduling',
  description: 'Court hearings scheduling and calendar management module',
  controllers: [SchedulingTools]
})
export class SchedulingModule {}
