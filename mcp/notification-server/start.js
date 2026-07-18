import { execSync } from 'child_process';

const PORT = process.env.PORT || process.env.MCP_PORT || '4006';

console.log(`Starting Notification Server on port ${PORT}`);

try {
  execSync(`nitrostack-cli start --port ${PORT}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start Notification Server:', error);
  process.exit(1);
}
