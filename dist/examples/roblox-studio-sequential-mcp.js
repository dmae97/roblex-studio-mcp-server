"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const RoblexStudioService_js_1 = require("../server/RoblexStudioService.js");
const logger_js_1 = require("../utils/logger.js");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Enable CORS
app.use((0, cors_1.default)());
// Parse JSON bodies
app.use(express_1.default.json());
// Create Roblox Studio service
const studioService = new RoblexStudioService_js_1.RoblexStudioService({
    version: '1.0.0',
    apiPrefix: '/api/roblox-studio',
    concurrency: 1 // Sequential processing
});
// Register routes
app.use('/', studioService.router);
// Add a simple front-end for testing
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Roblox Studio MCP Server</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
          }
          pre {
            background: #f4f4f4;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 10px;
            overflow: auto;
          }
          .card {
            border: 1px solid #eee;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .button {
            display: inline-block;
            background: #0066ff;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            text-decoration: none;
            margin-right: 10px;
            margin-bottom: 10px;
          }
          .output {
            height: 200px;
            overflow: auto;
            background: #f9f9f9;
            border: 1px solid #ddd;
            padding: 10px;
            margin-top: 10px;
          }
          .footer {
            margin-top: 40px;
            color: #777;
            font-size: 0.9em;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Roblox Studio Sequential MCP Server</h1>
        
        <div class="card">
          <h2>Server Information</h2>
          <p>This server provides a Sequential MCP implementation for Roblox Studio.</p>
          <p>API Prefix: /api/roblox-studio</p>
          
          <h3>Endpoints:</h3>
          <ul>
            <li><code>/api/roblox-studio/events</code> - SSE connection for events</li>
            <li><code>/api/roblox-studio/messages/:sessionId</code> - Send messages to server</li>
            <li><code>/api/roblox-studio/disconnect/:sessionId</code> - Disconnect session</li>
            <li><code>/api/roblox-studio/health</code> - Health check</li>
          </ul>
        </div>
        
        <div class="card">
          <h2>Test Client</h2>
          <p>Use these buttons to test the Sequential MCP functionality:</p>
          
          <a href="#" class="button" id="connect">Connect to Server</a>
          <a href="#" class="button" id="disconnect" style="display:none">Disconnect</a>
          
          <div style="margin-top: 20px; display: none" id="actions">
            <h3>Tools:</h3>
            <a href="#" class="button" id="getEnv">Get Studio Environment</a>
            <a href="#" class="button" id="runCode">Run Luau Code</a>
            <a href="#" class="button" id="listScripts">List Scripts</a>
            <a href="#" class="button" id="createScript">Create Script</a>
          </div>
          
          <h3>Output:</h3>
          <div class="output" id="output"></div>
        </div>
        
        <script>
          let eventSource = null;
          let sessionId = null;
          
          function log(message) {
            const output = document.getElementById('output');
            const line = document.createElement('div');
            line.textContent = message;
            output.appendChild(line);
            output.scrollTop = output.scrollHeight;
          }
          
          document.getElementById('connect').addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (eventSource) {
              log('Already connected');
              return;
            }
            
            log('Connecting to server...');
            
            eventSource = new EventSource('/api/roblox-studio/events');
            
            eventSource.addEventListener('connected', (event) => {
              const data = JSON.parse(event.data);
              sessionId = data.sessionId;
              log(`, Connected);
    with (session)
        ID: $;
    {
        sessionId;
    }
    `);
              
              document.getElementById('connect').style.display = 'none';
              document.getElementById('disconnect').style.display = 'inline-block';
              document.getElementById('actions').style.display = 'block';
            });
            
            eventSource.addEventListener('message', (event) => {
              const data = JSON.parse(event.data);
              log(`;
    Received: $;
    {
        JSON.stringify(data);
    }
    `);
            });
            
            eventSource.addEventListener('disconnected', (event) => {
              log('Disconnected from server');
              closeConnection();
            });
            
            eventSource.addEventListener('error', () => {
              log('Connection error');
              closeConnection();
            });
          });
          
          document.getElementById('disconnect').addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!sessionId) {
              log('Not connected');
              return;
            }
            
            try {
              const response = await fetch(` / api / roblox - studio / disconnect / $;
    {
        sessionId;
    }
    `, {
                method: 'POST'
              });
              const data = await response.json();
              log(`;
    Disconnect;
    response: $;
    {
        JSON.stringify(data);
    }
    `);
            } catch (error) {
              log(`;
    Error: $;
    {
        error.message;
    }
    `);
            }
            
            closeConnection();
          });
          
          document.getElementById('getEnv').addEventListener('click', async (e) => {
            e.preventDefault();
            await sendToolCall('GetStudioEnvironment', {});
          });
          
          document.getElementById('runCode').addEventListener('click', async (e) => {
            e.preventDefault();
            await sendToolCall('RunLuauCode', {
              code: 'print("Hello from Luau!")'
            });
          });
          
          document.getElementById('listScripts').addEventListener('click', async (e) => {
            e.preventDefault();
            await sendToolCall('ListScripts', {
              recursive: true
            });
          });
          
          document.getElementById('createScript').addEventListener('click', async (e) => {
            e.preventDefault();
            await sendToolCall('CreateLuauScript', {
              parentId: 'ServerScriptService',
              name: 'TestScript' + Math.floor(Math.random() * 1000),
              scriptType: 'Script',
              content: '-- Test script\\nprint("Hello, World!")'
            });
          });
          
          async function sendToolCall(toolName, args) {
            if (!sessionId) {
              log('Not connected');
              return;
            }
            
            log(`;
    Calling;
    tool: $;
    {
        toolName;
    }
    `);
            
            try {
              const response = await fetch(` / api / roblox - studio / messages / $;
    {
        sessionId;
    }
    `, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  type: 'tool_call',
                  data: {
                    toolName,
                    args
                  }
                })
              });
              
              const data = await response.json();
              log(`;
    Response: $;
    {
        JSON.stringify(data);
    }
    `);
            } catch (error) {
              log(`;
    Error: $;
    {
        error.message;
    }
    `);
            }
          }
          
          function closeConnection() {
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
            
            sessionId = null;
            document.getElementById('connect').style.display = 'inline-block';
            document.getElementById('disconnect').style.display = 'none';
            document.getElementById('actions').style.display = 'none';
          }
        </script>
        
        <div class="footer">
          <p>Roblox Studio Sequential MCP Server v1.0.0</p>
        </div>
      </body>
    </html>
  `;
});
;
// Start server
app.listen(port, () => {
    logger_js_1.logger.info(`Roblox Studio Sequential MCP server listening on port ${port}`);
});
//# sourceMappingURL=roblox-studio-sequential-mcp.js.map