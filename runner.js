const { spawn } = require('child_process');
const path = require('path');

console.log('Starting TeleCare full-stack platform...');

// 1. Python AI Service (Port 8000)
const ai = spawn('python3', ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: path.join(__dirname, 'ai-service'),
  stdio: 'inherit'
});

ai.on('error', (err) => {
  console.error('[AI Service Error]', err.message);
});

// 2. Express Backend (Port 3001)
const backend = spawn('node', ['src/index.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('[Backend Error]', err.message);
});

// 3. Vite Client (Port 5173)
const client = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5173'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit'
});

client.on('error', (err) => {
  console.error('[Client Error]', err.message);
});

console.log('All 3 TeleCare processes launched.');

const cleanExit = () => {
  console.log('Shutting down TeleCare processes...');
  try { ai.kill(); } catch (e) {}
  try { backend.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGTERM', cleanExit);
process.on('SIGINT', cleanExit);
