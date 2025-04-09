// Simple test script for Sequential MCP
const http = require('http');
const https = require('https');

// Configuration
const SERVER_URL = 'http://localhost:3001';

// Utility function to make HTTP requests
function makeRequest(method, url, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const data = JSON.parse(responseData);
          resolve(data);
        } catch (error) {
          resolve(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test the sequential MCP
async function testSequentialMcp() {
  console.log('Starting Sequential MCP test...');
  
  try {
    // 1. Check server health
    console.log('Checking server health...');
    const healthResponse = await makeRequest('GET', `${SERVER_URL}/health`);
    console.log('Server health:', healthResponse);
    
    if (healthResponse.type !== 'sequential') {
      console.error('Server is not running in sequential mode! Test aborted.');
      return;
    }
    
    // 2. Get SSE connection 
    console.log('Testing Sequential MCP...');
    
    // Create a series of tool calls to test sequencing
    for (let i = 1; i <= 5; i++) {
      const toolRequest = {
        type: 'tool_call',
        data: {
          toolName: `TestTool${i}`,
          args: {
            param1: `value${i}`,
            param2: i
          }
        }
      };
      
      console.log(`Sending tool call ${i}: ${toolRequest.data.toolName}`);
      const sessionId = '12345'; // This is just a test - actual implementation would have proper session
      const toolResponse = await makeRequest(
        'POST', 
        `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`,
        toolRequest
      );
      
      console.log(`Tool call ${i} response:`, toolResponse);
      
      // Slight delay to see the sequential processing
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('Sequential MCP test completed successfully!');
    
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

// Run the test
testSequentialMcp(); 