import { spawn } from 'node:child_process';

// Next.js dev server wrapper to ensure port 3000 and host 0.0.0.0
const child = spawn(
  './node_modules/.bin/next',
  ['dev', '-p', '3000', '-H', '0.0.0.0'],
  {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' },
  }
);

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
