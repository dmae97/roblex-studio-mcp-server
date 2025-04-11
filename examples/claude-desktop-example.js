#!/usr/bin/env node

/**
 * Claude Desktop Integration Example
 * 
 * This script demonstrates how to use the Roblex Studio MCP Server with Claude Desktop
 * in STDIO transport mode. To run this example:
 * 
 * 1. Build the project: npm run build
 * 2. Run this script: node examples/claude-desktop-example.js
 */

// Import required modules
const { spawn } = require('child_process');
const path = require('path');

// Configuration
const SERVER_PATH = path.join(__dirname, '../dist/index.js');
const MODEL = 'claude-3-7-sonnet';
const CONTEXT_LENGTH = 200000;
const MAX_TOKENS = 4096;

// Claude Desktop parameters
const claudeParams = [
  '--model', MODEL,
  '--context_length', CONTEXT_LENGTH.toString(),
  '--max_tokens', MAX_TOKENS.toString(),
  '--custom_instructions', 'You are a helpful assistant specializing in Roblox Studio development.'
];

// Start the server process in STDIO mode
console.log('Starting Claude Desktop MCP Server in STDIO mode...');
const server = spawn('node', [SERVER_PATH, ...claudeParams], {
  env: {
    ...process.env,
    TRANSPORT_MODE: 'stdio',
    CLAUDE_DESKTOP_ENABLED: 'true',
    USE_SEQUENTIAL: 'true',
    LOG_LEVEL: 'info'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// Handle server output
server.stdout.on('data', (data) => {
  try {
    // Try to parse the output as JSON
    const message = JSON.parse(data.toString().trim());
    
    // Handle different message types
    if (message.type === 'server_info') {
      console.log('Server connected!');
      console.log('Server version:', message.data.version);
      console.log('Available tools:', message.data.tools.length);
      console.log('Extended options:', message.data.extendedOptions || 'None');
      
      // Send a test message to Claude
      sendMessage({
        type: 'tool_call',
        data: {
          toolName: 'ping',
          args: { message: 'Hello from Claude Desktop example!' }
        }
      });
    } else if (message.type === 'tool_result') {
      console.log('Tool result received:');
      console.log('Tool:', message.data.toolName);
      console.log('Success:', message.data.success);
      console.log('Result:', message.data.result);
      
      // Exit after example completes
      setTimeout(() => {
        console.log('Example completed successfully.');
        server.kill();
        process.exit(0);
      }, 1000);
    } else {
      console.log('Message received:', message);
    }
  } catch (error) {
    // Handle non-JSON output
    console.log('Server output:', data.toString());
  }
});

// Handle server errors
server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Handle server exit
server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Function to send messages to the server
function sendMessage(message) {
  server.stdin.write(JSON.stringify(message) + '\n');
}

// Handle process exit
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill();
  process.exit(0);
});

console.log('Claude Desktop example running...');
console.log('Press Ctrl+C to exit.');
