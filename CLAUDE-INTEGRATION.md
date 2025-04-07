# Claude와 MCP 서버 연동 가이드

이 문서는 Claude API와 Roblex Studio MCP 서버를 연동하는 방법을 안내합니다.

## 설치 및 실행

### MCP 서버 설정

1. 필요한 패키지 설치:
   ```bash
   npm install
   ```

2. 개발 모드로 서버 실행:
   ```bash
   npm run dev
   ```

### 연동 방법

MCP 서버와 Claude API를 연동하는 방법은 두 가지가 있습니다:

1. **Node.js 클라이언트 사용**: `claude-mcp-integration.js` 파일을 사용하여 Node.js 환경에서 연동
2. **웹 인터페이스 사용**: `claude-mcp-demo.html` 파일을 사용하여 브라우저에서 연동

## Node.js 클라이언트 사용

`claude-mcp-integration.js` 파일을 수정하여 사용할 수 있습니다:

1. Claude API 키를 설정합니다:
   ```javascript
   const API_KEY = 'YOUR_CLAUDE_API_KEY';
   ```

2. 스크립트 실행:
   ```bash
   node claude-mcp-integration.js
   ```

## 웹 인터페이스 사용

1. `claude-mcp-demo.html` 파일을 웹 브라우저에서 열기:
   - 파일 탐색기에서 더블 클릭하거나
   - 간단한 HTTP 서버를 실행하여 접근:
     ```bash
     npx serve
     ```

2. 웹 페이지에서:
   - Claude API 키 입력
   - MCP 서버 URL 확인 (기본값: http://localhost:3000)
   - "MCP 서버에 연결" 버튼 클릭
   - 프롬프트 입력 후 "Claude에 질문하기" 버튼 클릭

## Claude 툴 구성

Claude API에 사용할 MCP 연동 툴의 정의입니다:

```javascript
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
```

## WebSocket 실시간 동기화

WebSocket을 통해 MCP 서버와 실시간 데이터 동기화를 할 수 있습니다:

```javascript
// WebSocket 연결
const ws = new WebSocket(`ws://localhost:3000/sync?sessionId=${sessionId}`);

// 모델 구독
ws.send(JSON.stringify({
  type: 'sync:subscribe',
  data: { modelId: 'player1' },
  requestId: 'req-1'
}));

// 모델 업데이트
ws.send(JSON.stringify({
  type: 'sync:update',
  data: {
    modelId: 'player1',
    values: { health: 75, position: { x: 10, y: 20, z: 30 } }
  },
  requestId: 'req-2'
}));

// 모델 업데이트 수신
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'sync:modelUpdated') {
    console.log('모델 업데이트됨:', message.data);
  }
});
```

## API 인증 정보

개발 환경에서는 다음 인증 정보를 사용할 수 있습니다:

- **사용자명/비밀번호**: admin/admin
- **API 키**: 
  - `test_key` (사용자 권한)
  - `admin_key` (관리자 권한)

## 주의 사항

1. 개발 환경에서만 사용하세요. 프로덕션 환경에서는 적절한 보안 조치를 취해야 합니다.
2. `.env` 파일에 설정된 값을 확인하세요.
3. Claude API 키는 외부에 노출되지 않도록 주의하세요.

## 문제 해결

- **연결 오류**: MCP 서버가 실행 중인지 확인하세요.
- **인증 오류**: `.env` 파일에 설정된 인증 정보를 확인하세요.
- **WebSocket 오류**: 네트워크 방화벽이나 프록시 설정을 확인하세요.
- **Claude API 오류**: API 키와 요청 형식이 올바른지 확인하세요. 