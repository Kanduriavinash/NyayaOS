import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { IdentityModule } from './modules/identity/identity.module.js';

@McpApp({
  module: AppModule,
  server: {
    name: 'identity-server',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root module for Identity Server',
  imports: [
    ConfigModule.forRoot(),
    IdentityModule
  ]
})
export class AppModule {}
