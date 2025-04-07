# Roblox Studio MCP 서버

Roblox Studio의 데이터와 기능을 외부 시스템과 통합하기 위한 모델 컨텍스트 프로토콜(MCP) 서버입니다. 이 서버를 통해 개발자는 Roblox Studio와 외부 도구 간의 실시간 통신 및 데이터 동기화를 구현할 수 있습니다.

## 목차

- [소개](#소개)
- [기능](#기능)
- [시작하기](#시작하기)
- [구성](#구성)
- [API 문서](#api-문서)
- [예제](#예제)
- [개발](#개발)
- [문제 해결](#문제-해결)
- [라이선스](#라이선스)

## 소개

Roblox Studio MCP 서버는 Roblox 게임 개발 과정을 향상시키기 위한 도구입니다. 이 서버는 외부 시스템과 Roblox Studio 간의 양방향 통신을 가능하게 하여 스크립트 생성, UI 요소 조작, 게임 시스템 관리 등 다양한 작업을 자동화할 수 있습니다.

주요 사용 사례:
- AI 모델을 활용한 코드 생성 및 수정
- 외부 에디터와의 연동으로 강력한 코드 편집 경험 제공
- 실시간 게임 데이터 모니터링 및 조작
- 게임 개발 워크플로우 자동화

## 기능

- **양방향 실시간 통신**: Roblox Studio와 실시간 데이터 교환
- **모델 관리**: 스크립트, UI, 서비스 등 다양한 Roblox 모델 관리
- **이벤트 기반 아키텍처**: SSE(Server-Sent Events)를 통한 실시간 이벤트 전달
- **확장 가능한 도구 시스템**: 새로운 도구와 기능을 쉽게 확장 가능
- **보안 인증**: API 키 및 세션 기반 인증 시스템
- **유효성 검증**: 모델 데이터 유효성 검사로 데이터 무결성 보장
- **상세 로깅 시스템**: 문제 해결 및 디버깅을 위한 로깅

## 시작하기

### 필수 요구 사항

- Node.js 16.x 이상
- NPM 또는 Yarn
- Typescript 5.x
- Roblox Studio

### 설치

1. 저장소 클론:
   ```
   git clone https://github.com/your-username/roblex-studio-mcp-server.git
   cd roblex-studio-mcp-server
   ```

2. 의존성 설치:
   ```
   npm install
   ```

3. 환경 설정:
   ```
   cp .env.example .env
   ```
   `.env` 파일을 편집하여 필요한 환경 변수 설정

4. 서버 실행:
   ```
   npm run dev
   ```

5. Roblox Studio 플러그인 설치:
   - `src/plugins/RobloxStudioPlugin.lua` 파일을 Roblox Studio 플러그인 폴더에 복사
   - Roblox Studio에서 플러그인 활성화

### 첫 번째 연결

1. Roblox Studio 실행
2. MCP 서버 플러그인 열기
3. 서버 URL 설정 (기본값: `http://localhost:3000`)
4. '연결' 버튼 클릭
5. 성공적으로 연결되면 콘솔에 연결 메시지가 표시됩니다

## 구성

### 환경 변수

| 변수명 | 설명 | 기본값 |
|--------|------|--------|
| `PORT` | 서버 포트 | `3000` |
| `LOG_LEVEL` | 로깅 수준 (debug, info, warn, error) | `info` |
| `API_KEYS` | 쉼표로 구분된 API 키 목록 | - |
| `JWT_SECRET` | JWT 토큰 암호화 키 | - |
| `REQUIRE_AUTH` | 인증 요구 여부 (true/false) | `false` |
| `SESSION_TIMEOUT` | 세션 타임아웃(초) | `3600` |

### 설정 파일

- `config/default.json`: 기본 서버 설정
- `config/development.json`: 개발 환경 설정 (`.env` 파일 설정이 우선됨)
- `config/production.json`: 프로덕션 환경 설정

## API 문서

자세한 API 문서는 [ROBLOX-STUDIO-API.md](docs/ROBLOX-STUDIO-API.md) 파일을 참조하세요.

## 예제

### 스크립트 생성 예제

```javascript
// 서버에 연결
const eventSource = new EventSource('http://localhost:3000/sse?studioId=myStudio');
let sessionId = '';

// 연결 성공 시 메시지 엔드포인트 정보 수신
eventSource.addEventListener('endpoint', (event) => {
  const data = JSON.parse(event.data);
  sessionId = data.sessionId;
  
  // 스크립트 생성 요청
  fetch(`http://localhost:3000/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'createModel',
      modelType: 'script',
      data: {
        name: 'HelloWorld',
        type: 'LocalScript',
        content: 'print("Hello from MCP Server!")',
        parent: 'StarterPlayerScripts'
      }
    })
  });
});
```

### UI 요소 생성 예제

```javascript
// UI 요소 생성 요청
fetch(`http://localhost:3000/messages?sessionId=${sessionId}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'createModel',
    modelType: 'ui',
    data: {
      name: 'MainMenu',
      type: 'Frame',
      size: { width: 400, height: 300 },
      position: { x: 0.5, y: 0.5 },
      properties: {
        AnchorPoint: [0.5, 0.5],
        BackgroundColor3: [0.1, 0.1, 0.1]
      }
    }
  })
});
```

더 많은 예제는 `src/examples` 디렉토리를 참조하세요.

## 개발

### 프로젝트 구조

```
roblex-studio-mcp-server/
├── src/
│   ├── index.ts             # 서버 진입점
│   ├── models/              # 모델 정의
│   ├── tools/               # MCP 도구
│   ├── utils/               # 유틸리티 함수
│   ├── plugins/             # Roblox Studio 플러그인
│   └── examples/            # 예제 코드
├── config/                  # 설정 파일
├── logs/                    # 로그 파일
├── docs/                    # 문서
└── test/                    # 테스트
```

### 새로운 도구 생성

1. `src/tools` 디렉토리에 새 파일 생성
2. 도구 정의 및 `register` 함수 구현
3. `src/tools/index.ts` 파일에 도구 등록

예시:
```typescript
// src/tools/myTool.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

export const myTool = {
  register: (server: McpServer) => {
    server.tool(
      'my-tool-name',
      {
        // 입력 스키마
        param1: { type: 'string', description: '매개변수 1' },
        param2: { type: 'number', description: '매개변수 2' }
      },
      async (params) => {
        logger.info(`Tool executed with params: ${JSON.stringify(params)}`);
        
        // 도구 로직 구현
        
        return {
          content: [
            { type: 'text', text: `결과: ${params.param1}` }
          ]
        };
      }
    );
    
    logger.debug('My tool registered');
  }
};

// src/tools/index.ts에 등록
import { myTool } from './myTool.js';
// ...
myTool.register(server);
```

### 빌드 및 배포

개발 모드로 실행:
```
npm run dev
```

프로덕션 빌드:
```
npm run build
```

프로덕션 모드로 실행:
```
npm start
```

## 문제 해결

### 일반적인 문제

- **연결 오류**: Roblox Studio 플러그인에서 MCP 서버 URL이 올바른지 확인하세요.
- **인증 오류**: 환경 변수에 API 키가 올바르게 설정되었는지 확인하세요.
- **모델 생성 실패**: 요청 형식이 올바른지 확인하고 서버 로그를 확인하세요.

### 로그 확인

로그 파일은 `logs` 디렉토리에 저장됩니다:
- `combined.log`: 모든 로그
- `error.log`: 오류 로그만
- `studio.log`: Roblox Studio 관련 로그

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
