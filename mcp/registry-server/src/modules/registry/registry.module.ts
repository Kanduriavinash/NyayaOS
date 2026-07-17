import { Module } from '@nitrostack/core';
import { RegistryTools } from './registry.tools.js';

@Module({
  name: 'registry',
  description: 'Court registry filing validation module',
  controllers: [RegistryTools]
})
export class RegistryModule {}
