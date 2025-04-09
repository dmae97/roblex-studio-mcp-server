/**
 * Test script for Sequential MCP Server
 * 
 * Usage: node test-sequential-mcp.js
 */

const http = require('http');
const EventSource = require('eventsource');

// Configuration
const SERVER_URL = 'http://localhost:3001';
const SSE_URL = `${SERVER_URL}/sse`;

// Make HTTP request helper
function request(method, url, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// Test function
async function testSequentialMcp() {
  console.log('🚀 Starting Sequential MCP test...');

  try {
    // 1. Health check
    console.log('\n📊 Checking server health...');
    const health = await request('GET', `${SERVER_URL}/health`);
    console.log(` - Server status: ${health.status}`);
    console.log(` - Server type: ${health.type}`);
    console.log(` - Server version: ${health.version}`);
    
    if (health.type !== 'sequential') {
      console.log('❌ Server is not running in sequential mode! Enable it in .env with USE_SEQUENTIAL=true');
      return;
    }
    
    // 2. Connect to SSE
    console.log('\n🔌 Connecting to SSE endpoint...');
    const sessionId = `test-${Date.now()}`;
    const sseUrl = `${SSE_URL}?sessionId=${sessionId}`;
    
    console.log(` - Using session ID: ${sessionId}`);
    console.log(` - SSE URL: ${sseUrl}`);
    
    // 3. Test sequential tool calls
    console.log('\n🧪 Testing sequential tool calls...');
    
    // Create promises array to wait for all results
    const promises = [];
    
    // Make 5 tool calls in quick succession
    for (let i = 1; i <= 5; i++) {
      console.log(`📤 Sending tool call #${i} (TestTool${i})...`);
      
      const promise = request('POST', `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`, {
        type: 'tool_call',
        data: {
          toolName: `TestTool${i}`,
          args: {
            testParam: `value-${i}`,
            index: i
          }
        }
      }).then(response => {
        console.log(`📥 Received response for tool #${i}:`);
        console.log(` - Tool: ${response.data?.toolName || 'unknown'}`);
        console.log(` - Success: ${response.data?.success}`);
        console.log(` - Processing order: ${response.data?.result?.processingOrder}`);
        console.log(` - Timestamp: ${response.data?.result?.timestamp}`);
        return response;
      });
      
      promises.push(promise);
      
      // Don't wait between calls - the server should handle sequencing
    }
    
    // Wait for all calls to complete
    console.log('\n⏳ Waiting for all tool calls to complete...');
    const results = await Promise.all(promises);
    
    // 4. Test error handling in sequential mode
    console.log('\n🧪 Testing error handling in sequential mode...');
    
    const errorResponse = await request('POST', `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`, {
      type: 'tool_call',
      data: {
        toolName: 'TestToolError',
        args: {
          shouldFail: true
        }
      }
    });
    
    console.log(` - Error tool response:`, errorResponse);
    
    // 5. Make additional calls after error to ensure queue continues processing
    console.log('\n🧪 Testing queue continues after error...');
    
    const finalResponse = await request('POST', `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`, {
      type: 'tool_call',
      data: {
        toolName: 'TestTool1',
        args: {
          testParam: 'final-call',
          afterError: true
        }
      }
    });
    
    console.log(` - Final tool response:`, finalResponse.data?.result);
    
    // 6. Test priority tools
    console.log('\n🧪 Testing priority-based ordering...');
    
    // Send priority tools in reverse order to see if they're processed by priority
    // First store promises to wait for them all
    const priorityPromises = [];
    
    // Send in reverse priority order (lowest first)
    for (let i = 1; i <= 3; i++) {
      console.log(`📤 Sending priority tool #${i} (PriorityTool${i})...`);
      
      const promise = request('POST', `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`, {
        type: 'tool_call',
        data: {
          toolName: `PriorityTool${i}`,
          args: {
            testParam: `priority-${i}`,
            priority: i * 3
          }
        }
      }).then(response => {
        console.log(`📥 Received response for PriorityTool${i}:`);
        console.log(` - Priority: ${response.data?.result?.priority}`);
        console.log(` - Processing time: ${response.data?.result?.processingTime}ms`);
        console.log(` - Timestamp: ${response.data?.result?.timestamp}`);
        return response;
      });
      
      priorityPromises.push(promise);
    }
    
    console.log('\n⏳ Waiting for all priority tool calls to complete...');
    const priorityResults = await Promise.all(priorityPromises);
    
    // 7. Test queue stats API
    console.log('\n🧪 Testing queue statistics API...');
    
    const statsResponse = await request('GET', `${SERVER_URL}/api/roblox-studio/queue/stats`);
    console.log(` - Queue statistics:`, statsResponse);
    
    // 8. Test long-running tool
    console.log('\n🧪 Testing long-running tool (shortened for test)...');
    
    const longRunningResponse = await request('POST', `${SERVER_URL}/api/roblox-studio/messages/${sessionId}`, {
      type: 'tool_call',
      data: {
        toolName: 'LongRunningTool',
        args: {
          duration: 3000, // Just 3 seconds for testing
          note: 'This demonstrates a long-running task'
        }
      }
    });
    
    console.log(` - Long-running tool response:`, longRunningResponse.data?.result);
    
    // 9. Test changing concurrency
    console.log('\n🧪 Testing concurrency update...');
    
    const concurrencyResponse = await request('POST', `${SERVER_URL}/api/roblox-studio/concurrency`, {
      concurrency: 2
    });
    
    console.log(` - Concurrency update response:`, concurrencyResponse);
    
    // 10. Test stats after concurrency change
    const statsAfterResponse = await request('GET', `${SERVER_URL}/api/roblox-studio/queue/stats`);
    console.log(` - Queue statistics after concurrency change:`, statsAfterResponse);
    
    console.log('\n✅ Sequential MCP test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Error during test:', error);
  }
}

// Run the test
testSequentialMcp(); 