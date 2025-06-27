const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 8000;

console.log('Starting QAest application...');

// Start backend server with PORT environment variable
const backend = spawn('node', ['server-basic.js'], {
  cwd: path.join(__dirname, 'qaest-mvp', 'backend'),
  stdio: 'inherit',
  env: { ...process.env, PORT: PORT }
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
  process.exit(1);
});

// For production, we'll serve the built frontend files from the backend
// For now, just run the backend which includes CORS support for the frontend

console.log(`Backend server starting on port ${PORT}...`);
console.log('To access the application, build the frontend separately');

// Keep the process running
process.on('SIGTERM', () => {
  backend.kill();
  process.exit(0);
});