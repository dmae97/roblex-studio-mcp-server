# Roblox Studio MCP 서버 통합 가이드

이 문서는 Roblox Studio MCP 서버를 자신의 프로젝트에 통합하는 방법을 개발자에게 안내합니다.

## 목차

- [준비 사항](#준비-사항)
- [서버 설정](#서버-설정)
- [Roblox Studio 플러그인 설치](#roblox-studio-플러그인-설치)
- [통합 방법](#통합-방법)
  - [웹 클라이언트에서 연결하기](#웹-클라이언트에서-연결하기)
  - [Node.js 클라이언트에서 연결하기](#nodejs-클라이언트에서-연결하기)
  - [AI 서비스와 통합하기](#ai-서비스와-통합하기)
- [모델 작업하기](#모델-작업하기)
  - [스크립트 모델](#스크립트-모델)
  - [UI 모델](#ui-모델)
  - [서비스 모델](#서비스-모델)
- [고급 기능](#고급-기능)
  - [실시간 동기화](#실시간-동기화)
  - [보안 및 인증](#보안-및-인증)
  - [맞춤형 확장](#맞춤형-확장)
- [문제 해결](#문제-해결)

## 준비 사항

MCP 서버를 통합하기 전에 다음 항목이 필요합니다:

1. Node.js 16.x 이상
2. npm 또는 Yarn
3. Roblox Studio 설치
4. 기본 웹 개발 지식

## 서버 설정

1. MCP 서버 리포지토리를 클론합니다:

```bash
git clone https://github.com/your-username/roblex-studio-mcp-server.git
cd roblex-studio-mcp-server
```

2. 의존성 패키지를 설치합니다:

```bash
npm install
```

3. 환경 설정 파일을 생성합니다:

```bash
cp .env.example .env
```

4. `.env` 파일을 편집하여 필요한 설정을 구성합니다:

```
PORT=3000
LOG_LEVEL=info
API_KEYS=MCP_API_KEY_developer=your-api-key:developer
ROBLOX_STUDIO_API_KEY=your-roblox-studio-api-key
JWT_SECRET=your-jwt-secret
REQUIRE_AUTH=false
SESSION_TIMEOUT=3600
```

Roblox Studio API 키는 다음 단계로 획득할 수 있습니다:
- Roblox Developer Hub에 로그인합니다 (https://developer.roblox.com)
- API 키 관리 섹션으로 이동합니다
- 새 API 키를 생성하고 '스튜디오 통합'에 권한을 부여합니다
- 생성된 키를 복사하여 `.env` 파일의 `ROBLOX_STUDIO_API_KEY` 값으로 설정합니다

이 API 키는 MCP 서버와 Roblox Studio 간의 통신을 인증하는 데 필수적입니다. 이 키가 없으면 스튜디오 연결이 실패합니다.

5. 서버를 시작합니다:

```bash
npm run dev
```

서버가 제대로 시작되면 다음과 같은 메시지가 표시됩니다:

```
[2023-04-07T12:34:56.789Z] [INFO] Roblex Studio MCP Server v1.0.0 started on port 3000
[2023-04-07T12:34:56.789Z] [INFO] SSE endpoint: http://localhost:3000/sse
[2023-04-07T12:34:56.789Z] [INFO] WebSocket sync endpoint: ws://localhost:3000/sync
```

## Roblox Studio 플러그인 설치

1. 프로젝트의 `src/plugins/RobloxStudioPlugin.lua` 파일을 찾습니다.
2. 이 파일을 Roblox Studio 플러그인 폴더에 복사합니다:
   - Windows: `%LocalAppData%\Roblox\Plugins`
   - macOS: `~/Documents/Roblox/Plugins`
3. Roblox Studio를 실행합니다.
4. 플러그인 메뉴에서 "MCP Server"를 찾습니다.
5. 플러그인 설정에서 MCP 서버 URL을 구성합니다 (기본값: `http://localhost:3000`).

## 통합 방법

### 웹 클라이언트에서 연결하기

웹 애플리케이션에서 MCP 서버에 연결하는 기본 예제:

```javascript
// MCP 연결 설정
class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl;
    this.sessionId = null;
    this.eventSource = null;
    this.models = {};
  }

  // 서버에 연결
  async connect(studioId) {
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}/sse?studioId=${studioId || 'web-client'}`;
      this.eventSource = new EventSource(url);
      
      // 연결 설정 이벤트
      this.eventSource.addEventListener('endpoint', (event) => {
        const data = JSON.parse(event.data);
        this.sessionId = new URL(data.endpoint, this.serverUrl).searchParams.get('sessionId');
        console.log(`Connected to MCP server, session ID: ${this.sessionId}`);
        resolve(this.sessionId);
      });
      
      // 모델 업데이트 이벤트
      this.eventSource.addEventListener('model:updated', (event) => {
        const data = JSON.parse(event.data);
        this.models[data.modelId] = data.state;
        this.onModelUpdated?.(data.modelId, data.state);
      });
      
      // 모델 생성 이벤트
      this.eventSource.addEventListener('model:created', (event) => {
        const data = JSON.parse(event.data);
        this.models[data.modelId] = data.state;
        this.onModelCreated?.(data.modelId, data.state);
      });
      
      // 오류 처리
      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        reject(error);
      };
    });
  }
  
  // 메시지 전송
  async sendMessage(type, data) {
    if (!this.sessionId) {
      throw new Error('Not connected to MCP server');
    }
    
    const response = await fetch(`${this.serverUrl}/messages?sessionId=${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data })
    });
    
    return response.json();
  }
  
  // 스크립트 생성
  async createScript(name, content, scriptType = 'ModuleScript') {
    return this.sendMessage('createModel', {
      modelType: 'script',
      data: {
        name,
        type: scriptType,
        content,
        enabled: true
      }
    });
  }
  
  // UI 요소 생성
  async createUI(name, properties) {
    return this.sendMessage('createModel', {
      modelType: 'ui',
      data: {
        name,
        ...properties
      }
    });
  }
  
  // 서비스 생성
  async createService(name, serviceType, properties) {
    return this.sendMessage('createModel', {
      modelType: 'service',
      data: {
        name,
        serviceType,
        ...properties
      }
    });
  }
  
  // 연결 종료
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.sessionId = null;
      console.log('Disconnected from MCP server');
    }
  }
}

// 사용 예제
async function example() {
  const client = new MCPClient('http://localhost:3000');
  await client.connect('my-web-app');
  
  // 모델 업데이트 이벤트 처리
  client.onModelUpdated = (modelId, state) => {
    console.log(`Model ${modelId} updated:`, state);
    // UI 업데이트 등
  };
  
  // 스크립트 생성
  await client.createScript('PlayerController', `
    local Players = game:GetService("Players")
    local player = Players.LocalPlayer
    
    print("Player controller initialized")
  `, 'LocalScript');
  
  // UI 요소 생성
  await client.createUI('MainMenu', {
    type: 'Frame',
    size: { width: 400, height: 300 },
    position: { x: 0.5, y: 0.5 },
    visible: true
  });
}
```

### Node.js 클라이언트에서 연결하기

Node.js 환경에서 MCP 서버에 연결하는 방법:

```javascript
const fetch = require('node-fetch');
const EventSource = require('eventsource');
const WebSocket = require('ws');

class NodeMCPClient {
  constructor(serverUrl, apiKey) {
    this.serverUrl = serverUrl;
    this.apiKey = apiKey;
    this.sessionId = null;
    this.eventSource = null;
    this.ws = null;
  }
  
  // API 키로 인증
  async authenticate() {
    const response = await fetch(`${this.serverUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: this.apiKey })
    });
    
    const result = await response.json();
    
    if (!result.sessionId) {
      throw new Error('Authentication failed');
    }
    
    this.sessionId = result.sessionId;
    this.token = result.token;
    
    return result;
  }
  
  // SSE로 연결
  async connect(studioId) {
    if (!this.sessionId) {
      await this.authenticate();
    }
    
    return new Promise((resolve, reject) => {
      const url = `${this.serverUrl}/sse?studioId=${studioId || 'node-client'}&sessionId=${this.sessionId}`;
      this.eventSource = new EventSource(url);
      
      this.eventSource.addEventListener('endpoint', (event) => {
        const data = JSON.parse(event.data);
        console.log('Connected to MCP server:', data);
        resolve(this.sessionId);
      });
      
      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        reject(error);
      };
    });
  }
  
  // WebSocket 동기화 연결
  connectSync(groups = []) {
    return new Promise((resolve, reject) => {
      const url = `ws://${new URL(this.serverUrl).host}/sync?sessionId=${this.sessionId}&groups=${groups.join(',')}`;
      this.ws = new WebSocket(url);
      
      this.ws.on('open', () => {
        console.log('WebSocket sync connection established');
        resolve();
      });
      
      this.ws.on('message', (data) => {
        const message = JSON.parse(data);
        this.onSyncMessage?.(message);
      });
      
      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      });
      
      this.ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }
  
  // 스크립트 생성 예제
  async createServerScript(name, content) {
    const message = {
      type: 'createModel',
      modelType: 'script',
      data: {
        name,
        type: 'Script',
        content,
        runContext: 'Server',
        parent: 'ServerScriptService'
      }
    };
    
    const response = await fetch(`${this.serverUrl}/messages?sessionId=${this.sessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
    
    return response.json();
  }
  
  // 모든 연결 종료
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    console.log('Disconnected from MCP server');
  }
}
```

### AI 서비스와 통합하기

AI 모델(예: Claude)을 사용하여 Roblox 코드 생성 및 업데이트 자동화:

```javascript
const { NodeMCPClient } = require('./node-mcp-client');
const { Anthropic } = require('@anthropic-ai/sdk');

class AIRobloxHelper {
  constructor(mcpServerUrl, apiKey, anthropicApiKey) {
    this.mcp = new NodeMCPClient(mcpServerUrl, apiKey);
    this.anthropic = new Anthropic({ apiKey: anthropicApiKey });
  }
  
  // 연결 설정
  async connect() {
    await this.mcp.authenticate();
    await this.mcp.connect('ai-assistant');
    console.log('Connected to MCP server and ready for AI code generation');
  }
  
  // AI를 사용하여 스크립트 생성
  async generateScript(description, options = {}) {
    const { scriptType = 'ModuleScript', parent = 'ServerScriptService' } = options;
    
    const prompt = `
    You are an expert Roblox Luau programmer. Create a well-documented ${scriptType} for the following purpose:
    
    ${description}
    
    The code should be efficient, follow Roblox best practices, and include helpful comments.
    Respond with ONLY the Luau code, no explanations.
    `;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const scriptContent = response.content[0].text;
    const scriptName = options.name || this.generateNameFromDescription(description);
    
    // MCP를 통해 Roblox Studio에 스크립트 생성
    return this.mcp.sendMessage('createModel', {
      modelType: 'script',
      data: {
        name: scriptName,
        type: scriptType,
        content: scriptContent,
        parent,
        runContext: scriptType === 'LocalScript' ? 'Client' : 'Server'
      }
    });
  }
  
  // 기존 스크립트 개선
  async improveScript(scriptId, improvementRequest) {
    // 먼저 스크립트 내용 가져오기
    const scriptData = await this.mcp.sendMessage('getModel', { 
      modelId: scriptId 
    });
    
    const prompt = `
    You are an expert Roblox Luau programmer. Improve the following script with this request:
    
    REQUEST: ${improvementRequest}
    
    CURRENT SCRIPT:
    ${scriptData.state.content}
    
    Respond with ONLY the improved Luau code, no explanations.
    `;
    
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.5,
      messages: [{ role: 'user', content: prompt }]
    });
    
    const improvedScript = response.content[0].text;
    
    // 스크립트 업데이트
    return this.mcp.sendMessage('updateModel', {
      modelId: scriptId,
      values: {
        content: improvedScript
      }
    });
  }
  
  // 설명에서 스크립트 이름 생성
  generateNameFromDescription(description) {
    const words = description
      .split(/\s+/)
      .filter(word => word.length > 3)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .slice(0, 2)
      .join('');
    
    return words + 'Manager';
  }
  
  // 연결 종료
  disconnect() {
    this.mcp.disconnect();
  }
}

// 사용 예제
async function aiExample() {
  const helper = new AIRobloxHelper(
    'http://localhost:3000',
    'your-mcp-api-key',
    'your-anthropic-api-key'
  );
  
  await helper.connect();
  
  // AI 기반 스크립트 생성
  const scriptResult = await helper.generateScript(
    'Create a system that manages player health and regeneration over time',
    { scriptType: 'Script', name: 'HealthManager' }
  );
  
  console.log(`Created script ${scriptResult.modelId}`);
  
  // AI 기반 스크립트 개선
  await helper.improveScript(
    scriptResult.modelId,
    'Add support for shield mechanics that absorb damage before health is affected'
  );
  
  console.log('Script improved with shield mechanics');
  
  helper.disconnect();
}
```

## 모델 작업하기

### 스크립트 모델

Roblox 스크립트 모델의 구조와 작업 방법:

```javascript
// 스크립트 모델 예제
const scriptModel = {
  name: 'PlayerController',
  type: 'LocalScript',
  content: `
    local Players = game:GetService("Players")
    local player = Players.LocalPlayer
    
    -- 플레이어 움직임 처리
    local function handleMovement()
      -- 움직임 로직
    end
    
    -- 이벤트 리스너 설정
    game:GetService("RunService").Heartbeat:Connect(handleMovement)
  `,
  runContext: 'Client',
  parent: 'StarterPlayerScripts',
  enabled: true
};

// 스크립트 생성하기
await client.sendMessage('createModel', {
  modelType: 'script',
  data: scriptModel
});

// 스크립트 실행하기
await client.sendMessage('executeScript', {
  modelId: 'PlayerController',
  args: [] // 선택적 인자
});

// 스크립트 수정하기
await client.sendMessage('updateModel', {
  modelId: 'PlayerController',
  values: {
    content: `
      -- 업데이트된 스크립트 내용
      local Players = game:GetService("Players")
      local player = Players.LocalPlayer
      
      -- 설정
      local MOVE_SPEED = 16
      
      -- 플레이어 움직임 처리
      local function handleMovement()
        -- 개선된 움직임 로직
      end
      
      -- 이벤트 리스너 설정
      game:GetService("RunService").Heartbeat:Connect(handleMovement)
    `
  }
});
```

### UI 모델

Roblox UI 모델의 구조와 작업 방법:

```javascript
// UI 모델 예제
const uiModel = {
  name: 'HealthBar',
  type: 'Frame',
  parent: 'PlayerGui.MainUI',
  position: { x: 0.05, y: 0.05 },
  size: { x: 200, y: 20 },
  anchorPoint: { x: 0, y: 0 },
  backgroundColor: [0.1, 0.1, 0.1],
  borderColor: [0, 0, 0],
  visible: true,
  children: ['HealthFill', 'HealthText']
};

// UI 요소 생성하기
await client.sendMessage('createModel', {
  modelType: 'ui',
  data: uiModel
});

// 내부 UI 요소 생성하기
await client.sendMessage('createModel', {
  modelType: 'ui',
  data: {
    name: 'HealthFill',
    type: 'Frame',
    parent: 'HealthBar',
    position: { x: 0, y: 0 },
    size: { x: 200, y: 20 },
    backgroundColor: [0.2, 0.8, 0.2]
  }
});

await client.sendMessage('createModel', {
  modelType: 'ui',
  data: {
    name: 'HealthText',
    type: 'TextLabel',
    parent: 'HealthBar',
    position: { x: 0.5, y: 0.5 },
    size: { x: 200, y: 20 },
    anchorPoint: { x: 0.5, y: 0.5 },
    text: '100/100',
    fontSize: 16,
    textColor: [1, 1, 1]
  }
});

// UI 요소 업데이트하기
await client.sendMessage('updateModel', {
  modelId: 'HealthFill',
  values: {
    size: { x: 150, y: 20 } // 75% 체력 표시
  }
});

await client.sendMessage('updateModel', {
  modelId: 'HealthText',
  values: {
    text: '75/100'
  }
});
```

### 서비스 모델

Roblox 서비스 모델의 구조와 작업 방법:

```javascript
// 서비스 모델 예제
const serviceModel = {
  name: 'GameManager',
  serviceType: 'Custom',
  properties: {
    gameState: 'Lobby',
    maxPlayers: 10,
    roundTime: 300,
    maps: ['Beach', 'Forest', 'City']
  }
};

// 서비스 생성하기
await client.sendMessage('createModel', {
  modelType: 'service',
  data: serviceModel
});

// 서비스 속성 업데이트하기
await client.sendMessage('updateModel', {
  modelId: 'GameManager',
  values: {
    'properties.gameState': 'Playing',
    'properties.currentMap': 'Forest'
  }
});

// 이벤트 발생시키기
await client.sendMessage('triggerServiceEvent', {
  serviceId: 'GameManager',
  eventName: 'GameStarted',
  args: ['Forest', 10]
});
```

## 고급 기능

### 실시간 동기화

WebSocket을 사용한 실시간 모델 동기화:

```javascript
// WebSocket 연결 설정
const ws = new WebSocket(`ws://localhost:3000/sync?sessionId=${client.sessionId}`);

ws.addEventListener('open', () => {
  console.log('WebSocket connection established');
  
  // 모델 구독
  ws.send(JSON.stringify({
    type: 'sync:subscribe',
    data: { modelId: 'PlayerController' },
    requestId: 'req-1'
  }));
});

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'sync:modelUpdated') {
    console.log('Model updated:', message.data);
    // UI 업데이트 등
  } else if (message.type === 'response') {
    console.log('Response received:', message);
  }
});

// 모델 업데이트
ws.send(JSON.stringify({
  type: 'sync:update',
  data: {
    modelId: 'PlayerController',
    values: {
      content: '-- 새 스크립트 내용'
    }
  },
  requestId: 'req-2'
}));

// 연결 종료
ws.close();
```

### 보안 및 인증

보안 및 인증 옵션 구성:

1. `.env` 파일에서 인증 설정:

```
REQUIRE_AUTH=true
API_KEYS=MCP_API_KEY_developer=your-api-key:developer,MCP_API_KEY_admin=admin-api-key:admin
JWT_SECRET=your-long-secure-random-string
```

2. 인증으로 API 호출하기:

```javascript
// API 키 인증
const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key'
};

// 또는 JWT 토큰 인증
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// API 호출 예시
await fetch(`${serverUrl}/api/models/PlayerController`, {
  method: 'GET',
  headers
});
```

### 맞춤형 확장

MCP 서버를 맞춤형 도구와 기능으로 확장하는 방법:

1. 새 도구 파일 생성: `src/tools/myCustomTool.ts`

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

export const myCustomTool = {
  register: (server: McpServer) => {
    server.tool(
      'my-custom-tool',
      {
        param1: { type: 'string', description: '첫 번째 매개변수' },
        param2: { type: 'number', description: '두 번째 매개변수' }
      },
      async (params) => {
        const { param1, param2 } = params;
        
        logger.info(`Custom tool executed with params: ${param1}, ${param2}`);
        
        // 도구 로직 구현
        
        return {
          content: [
            { type: 'text', text: `도구 실행 결과: ${param1}, ${param2}` }
          ]
        };
      }
    );
    
    logger.debug('Custom tool registered');
  }
};
```

2. 도구를 `src/tools/index.ts`에 등록:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { scriptValidator } from './scriptValidator.js';
import { myCustomTool } from './myCustomTool.js';

export const roblexTools = {
  register: (server: McpServer) => {
    scriptValidator.register(server);
    myCustomTool.register(server);
  }
};
```

## 문제 해결

### 일반적인 문제

1. **연결 오류**
   - MCP 서버가 실행 중인지 확인
   - 방화벽이 포트를 차단하고 있지 않은지 확인
   - 로그 파일에서 자세한 오류 확인

2. **인증 오류**
   - API 키가 올바른지 확인
   - `.env` 파일에서 `REQUIRE_AUTH` 설정 확인
   - `ROBLOX_STUDIO_API_KEY`가 올바르게 설정되었는지 확인
   - 로그에서 인증 시도 확인

3. **플러그인 연결 문제**
   - Roblox Studio 플러그인 설정에서 서버 URL 확인
   - 로그에서 연결 시도 확인
   - 플러그인 디버깅 로그 활성화

### 로그 확인

로그 파일은 `logs` 디렉토리에 저장됩니다:

- `combined.log`: 모든 로그
- `error.log`: 오류 로그만
- `studio.log`: Roblox Studio 관련 로그

로그 레벨을 변경하려면 `.env` 파일에서 `LOG_LEVEL` 설정을 수정하세요:

```
LOG_LEVEL=debug
```

가능한 로그 레벨: `debug`, `info`, `warn`, `error`