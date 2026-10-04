// Starts the mock Storefront API and Hydrogen dev server together.
// DEV ONLY. Usage: npm run dev:mock  →  http://localhost:3000
// ENV_FILE=.env.qa npm run dev:mock  → same, with test pixel IDs for QA.
import {spawn} from 'node:child_process';

const envFile = process.env.ENV_FILE ?? '.env.mock';
const children = [
  spawn('node', ['scripts/mock-storefront.ts'], {stdio: 'inherit'}),
  spawn('npx', ['shopify', 'hydrogen', 'dev', '--codegen', '--env-file', envFile], {
    stdio: 'inherit',
  }),
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
