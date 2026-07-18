const { execSync } = require('child_process');

const userAgent = process.env.npm_config_user_agent || '';
const isNpm = userAgent.startsWith('npm/');

console.log(`[Build Script] User Agent: ${userAgent}`);
console.log(`[Build Script] Detected package manager: ${isNpm ? 'npm' : 'pnpm'}`);

if (isNpm) {
  console.log('[Build Script] Running inside npm context (likely Docker container/CI). Checking for pnpm...');
  try {
    execSync('pnpm -v', { stdio: 'ignore' });
    console.log('[Build Script] pnpm is already installed.');
  } catch (error) {
    console.log('[Build Script] pnpm not found. Installing pnpm@10.27.0 globally...');
    try {
      execSync('npm install -g pnpm@10.27.0', { stdio: 'inherit' });
    } catch (installError) {
      console.error('[Build Script] Failed to install pnpm globally:', installError.message);
      process.exit(1);
    }
  }

  console.log('[Build Script] Installing monorepo dependencies with pnpm...');
  try {
    execSync('pnpm install', { stdio: 'inherit' });
  } catch (installError) {
    console.error('[Build Script] pnpm install failed:', installError.message);
    process.exit(1);
  }
}

console.log('[Build Script] Generating Prisma Client...');
try {
  execSync('pnpm --filter @nyayaos/database db:generate', { stdio: 'inherit' });
} catch (generateError) {
  console.error('[Build Script] Prisma generate failed:', generateError.message);
  process.exit(1);
}

console.log('[Build Script] Running turbo build...');
try {
  execSync('npx turbo run build --concurrency=1', { stdio: 'inherit' });
} catch (buildError) {
  console.error('[Build Script] Turbo build failed:', buildError.message);
  process.exit(1);
}
