#!/usr/bin/env node
import { spawn } from 'child_process';
import { execSync } from 'child_process';

console.log('🚀 Starting Quantize Website Services...\n');

// Kill existing processes
try {
  execSync('lsof -ti:3001 | xargs kill -9', { stdio: 'ignore' });
} catch (e) {}
try {
  execSync('lsof -ti:5002 | xargs kill -9', { stdio: 'ignore' });
} catch (e) {}

// Run cleanup
console.log('🧹 Running cleanup...');
execSync('node cleanup.js');

// Start AI service
console.log('🤖 Starting AI service on port 5002...');
const aiService = spawn('bash', ['-c', 'cd ai_service && source venv/bin/activate && python app.py'], {
  stdio: ['inherit', 'pipe', 'pipe'],
  detached: false
});

aiService.stdout.on('data', (data) => {
  console.log(`[AI Service] ${data.toString().trim()}`);
});

aiService.stderr.on('data', (data) => {
  console.log(`[AI Service] ${data.toString().trim()}`);
});

// Wait for AI service to start
setTimeout(() => {
  console.log('🌐 Starting main server on port 3001...');
  
  const mainServer = spawn('yarn', ['tsx', 'server/index.ts'], {
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env, NODE_ENV: 'development' }
  });

  mainServer.stdout.on('data', (data) => {
    console.log(`[Main Server] ${data.toString().trim()}`);
  });

  mainServer.stderr.on('data', (data) => {
    console.log(`[Main Server] ${data.toString().trim()}`);
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping services...');
    aiService.kill();
    mainServer.kill();
    process.exit(0);
  });

  console.log('\n✅ Services started!');
  console.log('🌐 Main website: http://localhost:3001');
  console.log('🤖 AI service: http://localhost:5002');
  console.log('\nPress Ctrl+C to stop all services\n');

}, 3000);