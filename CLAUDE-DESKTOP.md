# Claude Desktop Integration

이 문서는 Roblox Studio MCP 서버와 Claude Desktop을 연결하기 위한 설정 및 사용 방법을 설명합니다.

## 개요

Roblox Studio MCP 서버는 이제 두 가지 전송 모드를 지원합니다:

1. **Server-Sent Events (SSE)** - 웹 기반 연결을 위한 기본 모드
2. **Standard I/O (Stdio)** - 데스크톱 애플리케이션 통합을 위한 새로운 모드

Claude Desktop에서는 둘 다 사용 가능하지만, Stdio 모드가 더 효율적이고 안전합니다.

## 전송 모드 선택

### SSE 모드 (웹 기반)

웹 기반 연결에 적합하며, HTTP를 통한 양방향 통신을 제공합니다.

```bash
# SSE 모드로 서버 시작
npm run start:sse
```

### Stdio 모드 (데스크톱 통합)

데스크톱 애플리케이션과의 직접 통합에 적합하며, 효율적인 로컬 통신을 제공합니다.

```bash
# Stdio 모드로 서버 시작
npm run start:stdio

# Claude Desktop에 맞게 확장된 매개변수와 함께 시작
npm run claude:desktop
```

## 확장된 JSON 매개변수

서버는 이제 Claude Desktop 통합을 위한 확장된 JSON 매개변수를 지원합니다. 이러한 매개변수는 명령줄 인수 또는 쿼리 매개변수로 전달하여 서버와 Claude 모델의 동작을 사용자 지정할 수 있습니다.

| 매개변수 | 설명 | 예시 값 |
|-----------|-------------|---------------|
| `model` | 사용할 Claude 모델 | `claude-3-7-sonnet` |
| `context_length` | 최대 컨텍스트 창 크기 | `200000` |
| `max_tokens` | 최대 생성 토큰 수 | `4096` |
| `temperature` | 응답 무작위성 | `0.7` |
| `top_p` | 핵 샘플링 매개변수 | `0.9` |
| `top_k` | 상위-k 샘플링 매개변수 | `50` |
| `custom_instructions` | 사용자 지정 Claude 지침 | `코드 예제를 우선시` |

이러한 매개변수는 Claude Desktop에 대한 초기 연결 메시지에 포함되며 개발 워크플로우에 최적화된 AI 도우미 동작을 구성하는 데 도움이 됩니다.

## Claude Desktop 연결하기

### SSE 모드 (웹 기반)

1. SSE 모드로 서버 실행: `npm run start:sse`
2. Claude Desktop에서 연결 URL 설정: `http://localhost:3001/claude/connect`
3. SSE 스트리밍 엔드포인트: `http://localhost:3001/sse`
4. 메시지 전송 엔드포인트: `http://localhost:3001/messages?sessionId=YOUR_SESSION_ID`
5. 쿼리 매개변수로 사용자 지정 매개변수 추가: `?model=claude-3-7-sonnet&context_length=200000`

### Stdio 모드 (직접 데스크톱 통합)

1. 원하는 매개변수와 함께 Stdio 모드로 서버 시작:
   ```bash
   npm run claude:desktop -- --model claude-3-7-sonnet --context_length 200000 --max_tokens 4096
   ```
2. Claude Desktop이 표준 입출력 스트림을 통해 자동으로 연결됩니다.
3. URL이나 네트워크 구성이 필요하지 않습니다.

## 예제 스크립트

서버와 함께 제공되는 예제 스크립트를 사용하여 Claude Desktop 통합을 테스트할 수 있습니다:

```bash
# 예제 실행
node examples/claude-desktop-example.js
```

이 스크립트는 Stdio 모드에서 서버를 시작하고 간단한 메시지를 보내 통합을 테스트합니다.

## 문제 해결

### 일반적인 문제

- **연결 오류**: Claude Desktop에서 MCP 서버 URL이 올바른지 확인
- **인증 오류**: 환경 변수에서 API 키 확인
- **응답 없음**: 세션 ID가 요청에 올바르게 전달되는지 확인

### 전송 모드 문제

- **SSE 모드 작동 안 함**: 네트워크 연결과 방화벽 설정 확인
- **Stdio 모드 연결 안 됨**: 프로세스가 stdin/stdout 액세스 권한이 있는지 확인
- **모드 전환 불가**: `.env`에서 `TRANSPORT_MODE` 설정 또는 적절한 시작 스크립트 사용

### 확장된 JSON 매개변수 문제

- **매개변수 적용 안 됨**: CLI 또는 쿼리 매개변수에 올바르게 전달되었는지 확인
- **잘못된 매개변수 값**: 매개변수 형식과 허용 범위 확인
- **로그에 매개변수 표시 안 됨**: 매개변수 처리를 확인하기 위해 디버그 로깅 활성화

로그는 `logs/` 디렉터리에 저장됩니다.
