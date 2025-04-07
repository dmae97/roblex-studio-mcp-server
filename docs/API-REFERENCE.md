# Roblox Studio MCP Server API 레퍼런스

이 문서는 Roblox Studio MCP 서버의 모든 API 엔드포인트에 대한 상세한 정보를 제공합니다.

## 목차

- [인증 API](#인증-api)
  - [로그인](#로그인)
  - [로그아웃](#로그아웃)
- [이벤트 스트림](#이벤트-스트림)
  - [SSE 연결](#sse-연결)
  - [메시지 전송](#메시지-전송)
- [모델 API](#모델-api)
  - [모델 조회](#모델-조회)
- [Roblox Studio API](#roblox-studio-api)
  - [스튜디오 API 호출](#스튜디오-api-호출)
  - [스튜디오 상태 조회](#스튜디오-상태-조회)
- [세션 관리](#세션-관리)
  - [세션 목록 조회](#세션-목록-조회)
- [상태 확인](#상태-확인)
- [WebSocket 동기화](#websocket-동기화)
  - [WebSocket 연결](#websocket-연결)
  - [WebSocket 메시지](#websocket-메시지)

## 인증 API

### 로그인

API 키 또는 사용자 이름/비밀번호로 인증하여 세션을 생성합니다.

**URL:** `/auth/login`

**메소드:** `POST`

**데이터 파라미터:**

```json
// API 키 인증
{
  "apiKey": "your-api-key"
}
```

또는

```json
// 사용자 이름/비밀번호 인증
{
  "username": "admin",
  "password": "your-password"
}
```

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "token": "jwt-token-here",
  "sessionId": "api_1675847453123_a1b2c3d4",
  "user": {
    "name": "api-user-name",
    "role": "user"
  }
}
```

**오류 응답:**

- **코드:** 401 UNAUTHORIZED
- **내용:**

```json
{
  "error": "Invalid credentials"
}
```

또는

- **코드:** 403 FORBIDDEN
- **내용:**

```json
{
  "error": "Invalid API key"
}
```

### 로그아웃

세션을 종료하고 관련 리소스를 정리합니다.

**URL:** `/auth/logout?sessionId=<sessionId>`

**메소드:** `POST`

**URL 파라미터:**

- `sessionId` - 종료할 세션 ID

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "success": true
}
```

**오류 응답:**

- **코드:** 400 BAD REQUEST
- **내용:**

```json
{
  "error": "No active session"
}
```

## 이벤트 스트림

### SSE 연결

서버와 실시간 통신을 위한, 서버 전송 이벤트(SSE) 연결을 설정합니다.

**URL:** `/sse?studioId=<studioId>`

**메소드:** `GET`

**URL 파라미터:**

- `studioId` - (선택 사항) Roblox Studio 인스턴스 식별자

**인증:**

- API 키 인증이 활성화된 경우 `X-API-Key` 헤더 필요

**응답:**

- **콘텐츠 타입:** `text/event-stream`
- **이벤트:**
  - `endpoint` - 메시지 전송 엔드포인트 정보 포함
  - `model:created` - 새 모델 생성 시 발생
  - `model:updated` - 모델 업데이트 시 발생
  - `model:deleted` - 모델 삭제 시 발생

**예시 응답:**

```
event: endpoint
data: {"endpoint":"/messages?sessionId=api_1675847453123_a1b2c3d4"}

event: model:created
data: {"modelId":"player1","modelType":"script","state":{"content":"print('Hello')"}}
```

### 메시지 전송

SSE 연결을 통해 클라이언트에서 서버로 메시지를 전송합니다.

**URL:** `/messages?sessionId=<sessionId>`

**메소드:** `POST`

**URL 파라미터:**

- `sessionId` - 세션 ID(SSE 연결에서 받은 값)

**데이터 파라미터:**

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

**성공 응답:**

- **코드:** 200
- **내용:** 명령 실행 결과

**오류 응답:**

- **코드:** 400 BAD REQUEST
- **내용:**

```json
{
  "error": "No transport found for sessionId"
}
```

## 모델 API

### 모델 조회

특정 ID의 모델 정보를 조회합니다.

**URL:** `/api/models/:modelId`

**메소드:** `GET`

**URL 파라미터:**

- `modelId` - 조회할 모델 ID

**인증:**

- API 키 인증이 활성화된 경우 `X-API-Key` 헤더 필요

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "name": "ModelName",
  "state": {
    "property1": "value1",
    "property2": "value2"
  }
}
```

**오류 응답:**

- **코드:** 404 NOT FOUND
- **내용:**

```json
{
  "error": "Model {modelId} not found"
}
```

## Roblox Studio API

### 스튜디오 API 호출

Roblox Studio 어댑터에 특정 메시지를 전송합니다.

**URL:** `/studio/api?sessionId=<sessionId>`

**메소드:** `POST`

**URL 파라미터:**

- `sessionId` - 세션 ID

**데이터 파라미터:**

```json
{
  "messageType": "executeScript",
  "data": {
    "scriptId": "script1",
    "args": ["arg1", "arg2"]
  }
}
```

**성공 응답:**

- **코드:** 200
- **내용:** 메시지 처리 결과

**오류 응답:**

- **코드:** 400 BAD REQUEST
- **내용:**

```json
{
  "error": "No active Roblox Studio session found"
}
```

또는

- **코드:** 500 INTERNAL SERVER ERROR
- **내용:**

```json
{
  "error": "Error processing request"
}
```

### 스튜디오 상태 조회

Roblox Studio 연결 상태 정보를 조회합니다.

**URL:** `/studio/status`

**메소드:** `GET`

**인증:**

- API 키 인증이 활성화된 경우 `X-API-Key` 헤더 필요

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "activeConnections": 2,
  "globalModelCount": 5,
  "handlers": ["message", "executeScript", "createModel"]
}
```

## 세션 관리

### 세션 목록 조회

활성 세션 목록을 조회합니다(관리자 전용).

**URL:** `/api/sessions`

**메소드:** `GET`

**인증:**

- `admin` 역할을 가진 사용자만 접근 가능

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "sessions": [
    {
      "sessionId": "api_1675847453123_a1b2c3d4",
      "hasStudioAdapter": true,
      "sessionInfo": {
        "userId": "api-user-name",
        "role": "user",
        "createdAt": 1675847453123,
        "lastActivity": 1675847553123,
        "ipAddress": "127.0.0.1"
      }
    }
  ]
}
```

**오류 응답:**

- **코드:** 403 FORBIDDEN
- **내용:**

```json
{
  "error": "Insufficient permissions"
}
```

## 상태 확인

서버 상태를 확인합니다.

**URL:** `/health`

**메소드:** `GET`

**성공 응답:**

- **코드:** 200
- **내용:**

```json
{
  "status": "ok",
  "name": "Roblex Studio MCP Server",
  "version": "1.0.0",
  "activeSessions": 2,
  "activeStudioSessions": 1
}
```

## WebSocket 동기화

### WebSocket 연결

실시간 모델 동기화를 위한 WebSocket 연결을 설정합니다.

**URL:** `ws://server:port/sync?sessionId=<sessionId>&groups=<groups>`

**파라미터:**

- `sessionId` - (선택 사항) 세션 ID
- `groups` - (선택 사항) 구독할 그룹의 쉼표로 구분된 목록

### WebSocket 메시지

WebSocket을 통해 주고받는 메시지 형식입니다.

**모델 구독:**

```json
{
  "type": "sync:subscribe",
  "data": {
    "modelId": "player1"
  },
  "requestId": "req-1"
}
```

**응답:**

```json
{
  "type": "response",
  "requestId": "req-1",
  "data": {
    "modelId": "player1",
    "state": {
      "property1": "value1",
      "property2": "value2"
    }
  }
}
```

**모델 업데이트:**

```json
{
  "type": "sync:update",
  "data": {
    "modelId": "player1",
    "values": {
      "property1": "new-value"
    }
  },
  "requestId": "req-2"
}
```

**업데이트 이벤트:**

```json
{
  "type": "sync:modelUpdated",
  "data": {
    "modelId": "player1",
    "values": {
      "property1": "new-value"
    },
    "updatedBy": "session-id"
  },
  "timestamp": "2023-04-07T12:34:56.789Z"
}
```

**모델 상태 조회:**

```json
{
  "type": "sync:getState",
  "data": {
    "modelId": "player1"
  },
  "requestId": "req-3"
}
```

**응답:**

```json
{
  "type": "response",
  "requestId": "req-3",
  "data": {
    "modelId": "player1",
    "state": {
      "property1": "value1",
      "property2": "value2"
    }
  }
}
```

**구독 해제:**

```json
{
  "type": "sync:unsubscribe",
  "data": {
    "modelId": "player1"
  },
  "requestId": "req-4"
}
```

**응답:**

```json
{
  "type": "response",
  "requestId": "req-4",
  "data": {
    "success": true
  }
}
```

**핑 메시지:**

```json
{
  "type": "ping",
  "data": {},
  "requestId": "req-5"
}
```

**응답:**

```json
{
  "type": "response",
  "requestId": "req-5",
  "data": {
    "pong": true,
    "timestamp": "2023-04-07T12:34:56.789Z",
    "connectionId": "connection-id"
  }
}
``` 