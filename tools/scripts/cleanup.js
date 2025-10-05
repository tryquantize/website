#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cleanupDirs = [
  '.vite-temp',
  'dist',
  '.cache',
  '.turbo',
  '.next',
  'coverage',
  '.nyc_output',
  'ai_service/__pycache__'
];

const cleanupFiles = [
  '*.log',
  '.DS_Store',
  '**/.DS_Store',
  '*.pyc',
  '.tsbuildinfo'
];

function cleanup() {
  console.log('🧹 Cleaning up unnecessary files...');
  
  cleanupDirs.forEach(dir => {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`✅ Removed ${dir}`);
      }
    } catch (err) {
      console.log(`⚠️  Could not remove ${dir}`);
    }
  });

  cleanupFiles.forEach(pattern => {
    try {
      execSync(`find . -name "${pattern}" -delete 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (err) {}
  });

  console.log('✨ Cleanup complete!');
}

if (process.argv.includes('--watch')) {
  setInterval(cleanup, 30000); // Clean every 30 seconds
} else {
  cleanup();
}