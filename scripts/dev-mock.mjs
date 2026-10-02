// Starts the mock Storefront API and Hydrogen dev server together.
// DEV ONLY. Usage: npm run dev:mock  →  http://localhost:3000
import {spawn} from 'node:child_process';

const children = [
  spawn('node', ['scripts/mock-storefront.ts'], {stdio: 'inherit'}),
  spawn(
    'npx',
    ['shopify', 'hydrogen', 'dev', '--codegen', '--env-file', '.env.mock'],
    {
      stdio: 'inherit',
    },
  ),
];

const stop = () => children.forEach((child) => child.kill('SIGTERM'));
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
children.forEach((child) =>
  child.on('exit', (code) => {
    if (code) {
      stop();
      process.exit(code);
    }
  }),
);
