import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { RegistryModule } from './modules/registry/registry.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'registry-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root module for Registry Server',
  imports: [
    ConfigModule.forRoot(),
    RegistryModule
  ]
})
export class AppModule {}
