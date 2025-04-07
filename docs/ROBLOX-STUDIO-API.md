# Roblox Studio MCP API 문서

이 문서는 Roblox Studio와 통합된 MCP(Model Context Protocol) 서버의 API를 설명합니다. MCP를 사용하면 외부 시스템에서 Roblox Studio의 모델과 상호작용하고 실시간으로 데이터를 교환할 수 있습니다.

## 목차

1. [개요](#개요)
2. [API 엔드포인트](#api-엔드포인트)
3. [모델 유형](#모델-유형)
4. [이벤트 및 메시지](#이벤트-및-메시지)
5. [인증](#인증)
6. [예제](#예제)
7. [오류 처리](#오류-처리)
8. [Roblox Studio 플러그인](#roblox-studio-플러그인)

## 개요

MCP(Model Context Protocol)는 외부 시스템과 Roblox Studio 간의 양방향 통신을 가능하게 하는 프로토콜입니다. 이를 통해 다음과 같은 기능을 수행할 수 있습니다:

- Roblox Studio 스크립트의 실시간 생성 및 편집
- UI 요소의 동적 조작
- 게임 서비스 및 로직의 원격 제어
- 실시간 데이터 교환 및 동기화

## API 엔드포인트

### 기본 엔드포인트

- **베이스 URL**: `http://localhost:3000`

### 상태 확인

- **GET** `/health` - 서버 상태 확인
  - 응답 예시: `{"status":"ok","name":"Roblex Studio MCP Server","version":"1.0.0","activeSessions":0,"activeStudioSessions":0}`

### 이벤트 스트림 연결

- **GET** `/sse?studioId={studioId}` - 서버 이벤트 스트림 연결
  - 파라미터:
    - `studioId`: Roblox Studio 인스턴스의 고유 식별자
  - 응답: `text/event-stream` 형식의 이벤트 스트림
  - 첫 번째 이벤트로 메시지 엔드포인트 정보 수신 (예: `event: endpoint, data: /messages?sessionId=abc123`)

### 메시지 송신

- **POST** `/messages?sessionId={sessionId}` - Roblox Studio로 메시지 전송
  - 파라미터:
    - `sessionId`: 세션 식별자 (SSE 연결 시 수신한 값)
  - 요청 본문:
    ```json
    {
      "type": "command",
      "action": "createScript",
      "data": {
        "name": "MyScript",
        "type": "ModuleScript",
        "content": "-- 스크립트 내용"
      }
    }
    ```

### 모델 조작

- **GET** `/models` - 모든 모델 목록 조회
- **GET** `/models/{modelId}` - 특정 모델 조회
- **POST** `/models` - 새 모델 생성
- **PUT** `/models/{modelId}` - 모델 업데이트
- **DELETE** `/models/{modelId}` - 모델 삭제

### 사용자 세션

- **GET** `/sessions` - 활성 세션 목록 조회
- **DELETE** `/sessions/{sessionId}` - 세션 종료

## 모델 유형

### 스크립트 모델

Roblox Studio 스크립트를 관리하는 모델입니다.

```json
{
  "name": "PlayerScript",
  "type": "LocalScript",
  "content": "-- 여기에 Lua 코드 작성",
  "enabled": true,
  "parent": "Players.LocalPlayer",
  "properties": {
    "RunContext": "Client"
  }
}
```

속성:
- `name`: 스크립트 이름
- `type`: 스크립트 타입 (ModuleScript, LocalScript, ServerScript)
- `content`: 스크립트 내용 (Lua)
- `enabled`: 스크립트 활성화 여부
- `parent`: 부모 객체 경로
- `properties`: 추가 속성

### UI 모델

Roblox Studio UI 요소를 관리하는 모델입니다.

```json
{
  "name": "HealthBar",
  "type": "Frame",
  "position": {"x": 0, "y": 0},
  "size": {"width": 200, "height": 30},
  "visible": true,
  "properties": {
    "BackgroundColor3": [1, 0, 0],
    "BorderSizePixel": 0
  }
}
```

속성:
- `name`: UI 요소 이름
- `type`: UI 요소 타입 (Frame, Button, TextLabel 등)
- `position`: 위치 (x, y)
- `size`: 크기 (width, height)
- `visible`: 표시 여부
- `properties`: 추가 속성

### 서비스 모델

Roblox Studio 서비스를 관리하는 모델입니다.

```json
{
  "name": "GameService",
  "serviceType": "Custom",
  "enabled": true,
  "properties": {
    "GameState": "Lobby",
    "MaxPlayers": 10,
    "TimeLimit": 300
  }
}
```

속성:
- `name`: 서비스 이름
- `serviceType`: 서비스 유형
- `enabled`: 활성화 여부
- `properties`: 서비스 속성

## 이벤트 및 메시지

### 서버에서 클라이언트로 전송되는 이벤트

- `connection:established`: 연결 설정 완료
- `model:created`: 새 모델 생성됨
- `model:updated`: 모델 업데이트됨
- `model:deleted`: 모델 삭제됨
- `studio:connected`: Roblox Studio 연결됨
- `studio:disconnected`: Roblox Studio 연결 해제됨
- `error`: 오류 발생

### 클라이언트에서 서버로 전송되는 메시지

- `createModel`: 새 모델 생성
- `updateModel`: 모델 업데이트
- `deleteModel`: 모델 삭제
- `executeScript`: 스크립트 실행
- `getModelState`: 모델 상태 요청

## 인증

MCP 서버는 다음과 같은 인증 방식을 지원합니다:

1. **API 키 인증**
   - 요청 헤더에 API 키 포함: `X-API-Key: your-api-key`

2. **세션 기반 인증**
   - `/auth/login` 엔드포인트로 로그인하여 세션 토큰 획득
   - 요청 헤더에 토큰 포함: `Authorization: Bearer your-session-token`

## 예제

### 스크립트 생성 예제

```javascript
// SSE 연결 설정
const eventSource = new EventSource('http://localhost:3000/sse?studioId=myStudio');
let sessionId = '';

eventSource.addEventListener('endpoint', (event) => {
  const endpoint = JSON.parse(event.data);
  sessionId = endpoint.sessionId;
  
  // 스크립트 생성 요청
  fetch(`http://localhost:3000/messages?sessionId=${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'createModel',
      modelType: 'script',
      data: {
        name: 'PlayerController',
        type: 'LocalScript',
        content: `
          local player = game.Players.LocalPlayer
          
          -- 플레이어 컨트롤러 스크립트
          print("Player controller initialized")
          
          -- 플레이어 움직임 처리
          local function handleMovement()
            -- 움직임 로직
          end
          
          -- 이벤트 리스너 설정
          game:GetService("RunService").Heartbeat:Connect(handleMovement)
        `,
        parent: 'Players.LocalPlayer',
        enabled: true
      }
    })
  });
});

// 모델 업데이트 이벤트 리스닝
eventSource.addEventListener('model:updated', (event) => {
  const updateData = JSON.parse(event.data);
  console.log('Model updated:', updateData);
});
```

## 오류 처리

서버는 다음과 같은 HTTP 상태 코드로 오류를 반환합니다:

- `400 Bad Request`: 잘못된 요청
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스 찾을 수 없음
- `500 Internal Server Error`: 서버 내부 오류

오류 응답은 다음과 같은 JSON 형식을 따릅니다:

```json
{
  "error": true,
  "message": "오류 메시지",
  "code": "ERROR_CODE",
  "details": { 
    // 추가 오류 정보 
  }
}
```

## Roblox Studio 플러그인

Roblox Studio에서 MCP 서버와 통신하려면 Roblox Studio Plugin이 필요합니다. 플러그인 설치 및 구성 방법:

1. `src/plugins/RobloxStudioPlugin.lua` 파일을 Roblox Studio 플러그인 폴더에 복사
2. Roblox Studio에서 플러그인 활성화
3. 플러그인 설정에서 MCP 서버 URL 구성
4. 연결 버튼을 클릭하여 MCP 서버에 연결

플러그인은 다음과 같은 기능을 제공합니다:

- MCP 서버 연결 관리
- 모델 목록 조회 및 동기화
- 스크립트 편집 및 실행
- UI 요소 생성 및 조작
- 서비스 관리 