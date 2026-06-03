#!/usr/bin/env node
// DevToolBox CLI - Quick dev tools in your terminal
// npm: devtoolbox-cli
// Web: https://wangjisong2007-max.github.io/devtoolbox/

const { program } = require('commander');
const crypto = require('crypto');

program
  .name('devtool')
  .description('🔧 DevToolBox CLI - Quick dev tools in terminal')
  .version('1.0.0');

// JSON formatter
program
  .command('json')
  .description('Format or minify JSON')
  .argument('[file]', 'JSON file (reads from stdin if omitted)')
  .option('-m, --minify', 'Minify instead of format')
  .action(async (file, opts) => {
    const fs = require('fs');
    let input = file ? fs.readFileSync(file, 'utf8') : await readStdin();
    try {
      const obj = JSON.parse(input);
      console.log(opts.minify ? JSON.stringify(obj) : JSON.stringify(obj, null, 2));
    } catch (e) {
      console.error('❌ Invalid JSON:', e.message);
      process.exit(1);
    }
  });

// Timestamp tools
program
  .command('ts')
  .description('Timestamp conversion')
  .argument('[value]', 'Timestamp (seconds) or date string')
  .action((val) => {
    if (!val) {
      console.log(Math.floor(Date.now() / 1000));
      return;
    }
    if (/^\d+$/.test(val)) {
      let ts = parseInt(val);
      if (ts > 1e12) ts = Math.floor(ts / 1000);
      const d = new Date(ts * 1000);
      console.log(`Timestamp: ${ts}s`);
      console.log(`UTC:   ${d.toUTCString()}`);
      console.log(`Local: ${d.toLocaleString()}`);
      console.log(`ISO:   ${d.toISOString()}`);
    } else {
      const d = new Date(val);
      if (isNaN(d.getTime())) {
        console.error('Invalid date');
        process.exit(1);
      }
      console.log(`Seconds: ${Math.floor(d.getTime() / 1000)}`);
      console.log(`Millis:  ${d.getTime()}`);
    }
  });

// Base64
program
  .command('b64')
  .description('Base64 encode')
  .argument('[text]', 'Text to encode (read from stdin if omitted)')
  .action(async (text) => {
    const input = text || await readStdin();
    console.log(Buffer.from(input).toString('base64'));
  });

program
  .command('b64d')
  .description('Base64 decode')
  .argument('[text]', 'Base64 string to decode')
  .action(async (text) => {
    const input = text || await readStdin();
    try {
      console.log(Buffer.from(input.trim(), 'base64').toString('utf8'));
    } catch (e) {
      console.error('Invalid base64');
      process.exit(1);
    }
  });

// UUID
program
  .command('uuid')
  .description('Generate UUID v4')
  .option('-n, --count <n>', 'Number of UUIDs', '1')
  .action((opts) => {
    const count = parseInt(opts.count) || 1;
    for (let i = 0; i < count; i++) {
      console.log(crypto.randomUUID());
    }
  });

// URL encode/decode 
program
  .command('url-encode')
  .description('URL encode')
  .argument('[text]', 'Text to encode')
  .action(async (text) => {
    const input = text || await readStdin();
    console.log(encodeURIComponent(input.trim()));
  });

program
  .command('url-decode')
  .description('URL decode')
  .argument('[text]', 'URL to decode')
  .action(async (text) => {
    const input = text || await readStdin();
    try {
      console.log(decodeURIComponent(input.trim()));
    } catch (e) {
      console.error('Invalid URL encoding');
      process.exit(1);
    }
  });

// Hash
program
  .command('hash')
  .description('Compute SHA-256 hash')
  .argument('[text]', 'Text to hash')
  .action(async (text) => {
    const input = text || await readStdin();
    console.log(crypto.createHash('sha256').update(input.trim()).digest('hex'));
  });

// Open web version
program
  .command('web')
  .description('Open DevToolBox in browser')
  .action(() => {
    const url = 'https://wangjisong2007-max.github.io/devtoolbox/';
    console.log(`Opening ${url} ...`);
    const { exec } = require('child_process');
    const cmd = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`;
    exec(cmd);
  });

async function readStdin() {
  return new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve('');
      return;
    }
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
  });
}

program.parse();
