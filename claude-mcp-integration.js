// Claude와 MCP 서버 연동 예제
const API_KEY = 'YOUR_CLAUDE_API_KEY'; // Claude API 키를 입력하세요
const SERVER_URL = 'http://localhost:3000'; // MCP 서버 URL

/**
 * Claude API 호출 예제
 */
async function callClaude(prompt, tools = []) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      tools: tools,
      tool_choice: 'auto'
    })
  });

  if (!response.ok) {
    throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * MCP 서버 연결 및 세션 생성
 */
async function connectToMCP() {
  const response = await fetch(`${SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin'  // .env 파일에 설정된 ADMIN_PASSWORD와 일치해야 합니다
    })
  });

  if (!response.ok) {
    throw new Error(`MCP 서버 연결 실패: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.sessionId;
}

/**
 * MCP 서버에 메시지 전송
 */
async function sendToMCP(sessionId, toolName, params) {
  const response = await fetch(`${SERVER_URL}/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'tool_call',
      data: {
        name: toolName,
        parameters: params
      }
    })
  });

  if (!response.ok) {
    throw new Error(`MCP 메시지 전송 실패: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

/**
 * WebSocket 연결
 */
function connectToWebSocket(sessionId) {
  const ws = new WebSocket(`ws://${SERVER_URL.replace('http://', '')}/sync?sessionId=${sessionId}`);
  
  ws.onopen = () => {
    console.log('WebSocket 연결됨');
    
    // 모델 구독 예제
    ws.send(JSON.stringify({
      type: 'sync:subscribe',
      data: { modelType: 'player' },
      requestId: 'req-1'
    }));
  };
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('서버로부터 메시지 수신:', message);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket 오류:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket 연결 종료');
  };
  
  return ws;
}

/**
 * MCP 기능을 활용하는 Claude 툴 정의
 */
const mcpTools = [
  {
    function: {
      name: 'mcp_generate_script',
      description: 'Roblox 스크립트 생성',
      parameters: {
        type: 'object',
        properties: {
          scriptType: {
            type: 'string',
            enum: ['Script', 'LocalScript', 'ModuleScript'],
            description: '스크립트 유형'
          },
          functionality: {
            type: 'string',
            description: '스크립트 기능에 대한 설명'
          },
          includeComments: {
            type: 'boolean',
            description: '주석 포함 여부'
          }
        },
        required: ['scriptType', 'functionality']
      }
    }
  },
  {
    function: {
      name: 'mcp_update_model',
      description: 'MCP 모델 업데이트',
      parameters: {
        type: 'object',
        properties: {
          modelId: {
            type: 'string',
            description: '업데이트할 모델 ID'
          },
          values: {
            type: 'object',
            description: '모델에 설정할 값들'
          }
        },
        required: ['modelId', 'values']
      }
    }
  }
];

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    // 1. MCP 서버에 연결
    console.log('MCP 서버에 연결 중...');
    const sessionId = await connectToMCP();
    console.log(`세션 ID: ${sessionId}`);
    
    // 2. WebSocket 연결 (실시간 업데이트용)
    const ws = connectToWebSocket(sessionId);
    
    // 3. Claude에게 Roblox 스크립트 생성 요청
    console.log('Claude에게 스크립트 생성 요청 중...');
    const claudeResponse = await callClaude(
      '플레이어가 동전을 수집할 수 있는 간단한 Roblox 게임을 위한 서버 스크립트를 생성해주세요.',
      mcpTools
    );
    console.log('Claude 응답:', claudeResponse);
    
    // 4. Claude의 응답에서 도구 호출이 있는 경우 MCP 서버로 전달
    if (claudeResponse.tool_calls && claudeResponse.tool_calls.length > 0) {
      for (const toolCall of claudeResponse.tool_calls) {
        if (toolCall.function.name === 'mcp_generate_script') {
          console.log('MCP 서버에 스크립트 생성 요청 전송 중...');
          const mcpResponse = await sendToMCP(
            sessionId,
            'generate-roblox-code',
            toolCall.function.arguments
          );
          console.log('MCP 응답:', mcpResponse);
        }
      }
    }
    
    // 5. WebSocket을 통해 모델 업데이트 전송
    ws.send(JSON.stringify({
      type: 'sync:update',
      data: {
        modelId: 'player1',
        values: {
          health: 100,
          position: { x: 0, y: 0, z: 0 },
          inventory: ['sword']
        }
      },
      requestId: 'req-update-1'
    }));
    
    // 클라이언트를 일정 시간 동안 실행 유지
    console.log('WebSocket 메시지 대기 중... (10초 후 종료)');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 연결 종료
    ws.close();
    console.log('예제 실행 완료');
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

// 스크립트가 직접 실행된 경우 main 함수 호출
if (require.main === module) {
  main();
}

module.exports = {
  callClaude,
  connectToMCP,
  sendToMCP,
  connectToWebSocket,
  mcpTools
}; 