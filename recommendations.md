# Roblex Studio MCP 서버 개선 권장사항

## 1. 임포트 경로 문제 해결

컴파일된 JavaScript 파일에서 경로 참조 문제가 발생하고 있습니다. 주로 다음과 같은 경로 패턴에서 문제가 발생합니다:

```javascript
// 잘못된 경로
const logger_js_1 = require("../utils/logger.js");

// 올바른 경로 (상위 디렉토리로 올바르게 이동)
const logger_js_1 = require("../../utils/logger.js");
```

### 해결 방법:

1. **상대 경로 대신 모듈 별칭 사용**:
   ```typescript
   // tsconfig.json에 paths 설정 추가
   "baseUrl": ".",
   "paths": {
     "@/*": ["src/*"]
   }
   
   // 임포트 시 별칭 사용
   import { logger } from '@/utils/logger';
   ```

2. **경로가 잘못된 파일들 수정**:
   ```bash
   # 경로 문제가 있는 파일들 확인
   find dist/tools -type f -name "*.js" -exec grep -l "../utils/logger" {} \;
   ```
   
   다음 파일들의 경로를 확인하고 수정해야 합니다:
   - dist/tools/aiTester.js
   - dist/tools/codeGenerator.js
   - dist/tools/datastore/datastoreManager.js
   - dist/tools/educationalTools.js
   - dist/tools/index.js
   - dist/tools/levelDesigner/index.js
   - dist/tools/opencloud/openCloudConnector.js
   - dist/tools/physics/physicsSystem.js
   - dist/tools/roblexApiConnector.js
   - dist/tools/scriptGenerator.js
   - dist/tools/scriptValidator.js
   - dist/tools/ui/uiBuilder.js

## 2. package.json 최적화

package.json 파일을 다음과 같이 업데이트했습니다:

```json
{
  "name": "roblex-studio-mcp-server",
  "version": "1.0.0",
  "description": "MCP Server for Roblex Studio",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsc -w & nodemon dist/index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.9.0",
    "axios": "^1.8.4",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^5.1.0",
    "node-cache": "^5.1.2",
    "sqlite3": "^5.1.7",
    "uuid": "^11.1.0",
    "ws": "^8.18.0",
    "zod": "^3.24.2",
    "zod-to-json-schema": "^3.24.1"
  },
  "devDependencies": {
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.0.2",
    "@types/uuid": "^9.0.8",
    "@types/ws": "^8.5.12",
    "nodemon": "^3.1.2",
    "typescript": "^5.5.4"
  },
  "engines": {
    "node": ">=18"
  }
}
```

## 3. tsconfig.json 최적화

TypeScript 설정을 다음과 같이 최적화했습니다:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "esModuleInterop": true,
    "strict": false",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "dist",
    "declaration": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "noEmitOnError": false,
    "allowJs": true,
    "removeComments": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 주요 변경 사항:
- `module`과 `moduleResolution`을 `NodeNext`로 변경
- 모듈 별칭을 위한 `paths` 설정 추가
- `allowJs` 옵션 추가로 JavaScript 파일도 처리 가능

## 4. 환경 변수 설정

`.env.example` 파일을 생성하여 필요한 환경 변수를 정의했습니다:

```bash
# Server Configuration
PORT=3001
SERVER_NAME=Roblex Studio MCP Server
SERVER_VERSION=1.0.0
REQUIRE_AUTH=false
NODE_ENV=development

# Authentication
MCP_API_KEY_ROBLEX_STUDIO=your_api_key_here
ADMIN_PASSWORD=admin_password_here
SESSION_TIMEOUT=3600

# CORS Settings
CORS_ORIGINS=*

# Roblox API Settings
ROBLOX_API_KEY=your_roblox_api_key_here
OPENCLOUD_API_KEY=your_opencloud_api_key_here

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=false
LOG_FILE_PATH=logs/server.log
```

이 예제 파일을 `.env`로 복사하고 실제 값을 설정하여 사용할 수 있습니다.

## 5. 프로젝트 구조 개선 제안

현재 프로젝트 구조에 문제가 있어 소스 파일에 접근할 수 없습니다. 소스 파일을 다시 구성하고 컴파일된 파일에서 발생하는 오류를 수정하는 것이 좋습니다.

1. **올바른 TypeScript 소스 구조**:
   ```
   roblex-studio-mcp-server/
   ├── src/
   │   ├── index.ts
   │   ├── tools/
   │   │   ├── index.ts
   │   │   ├── opencloud/
   │   │   │   └── openCloudConnector.ts
   │   │   └── ...
   │   ├── utils/
   │   │   ├── logger.ts
   │   │   └── ...
   │   └── ...
   ├── dist/
   ├── package.json
   ├── tsconfig.json
   └── .env
   ```

2. **소스 코드 복원**: 
   - 컴파일된 파일 기반으로 소스 파일을 재구성
   - 경로 문제가 있는 모든 임포트 문 수정

## 6. 작업 순서 권장사항

1. 환경 설정을 완료합니다 (package.json, tsconfig.json, .env)
2. 소스 디렉토리 구조를 올바르게 복원합니다
3. TypeScript 소스 파일의 임포트 경로 문제를 수정합니다
4. 프로젝트를 다시 빌드합니다: `npm run build`
5. 서버를 테스트합니다: `npm start`
6. 필요한 경우 추가 수정을 진행합니다 