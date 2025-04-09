"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const RoblexStudioService_js_1 = require("../server/RoblexStudioService.js");
// 서버 설정
const PORT = 3001;
const SERVER_NAME = 'Roblox Studio Sequential MCP Test';
const SERVER_VERSION = '1.0.0';
// Express 앱 생성
const app = (0, express_1.default)();
// CORS 설정
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// 로거 설정
const customLogger = {
    info: (message, ...args) => console.log(`[INFO] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args)
};
// Roblox Studio 서비스 생성
const studioService = new RoblexStudioService_js_1.RoblexStudioService({
    version: SERVER_VERSION,
    apiPrefix: '/api/roblox-studio',
    concurrency: 1 // Sequential processing
});
// 라우터 등록
app.use('/', studioService.router);
// 기본 페이지 설정
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sequential MCP Test</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .card { border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }
        .button { background: #4CAF50; color: white; padding: 10px 15px; border: none; 
                 border-radius: 4px; cursor: pointer; margin-right: 10px; }
        .button:hover { background: #45a049; }
        .output { border: 1px solid #ddd; border-radius: 5px; padding: 10px; 
                 height: 300px; overflow-y: auto; margin-top: 20px; background: #f9f9f9; }
      </style>
    </head>
    <body>
      <h1>Roblox Studio Sequential MCP Test</h1>
      
      <div class="card">
        <h2>연결 테스트</h2>
        <button id="connect" class="button">서버에 연결</button>
        <button id="disconnect" class="button" disabled>연결 해제</button>
      </div>
      
      <div class="card">
        <h2>도구 테스트</h2>
        <button id="getEnv" class="button" disabled>환경 정보 가져오기</button>
        <button id="runCode" class="button" disabled>Luau 코드 실행</button>
        <button id="listScripts" class="button" disabled>스크립트 목록</button>
        <button id="createScript" class="button" disabled>스크립트 생성</button>
      </div>
      
      <h3>출력:</h3>
      <div id="output" class="output"></div>
      
      <script>
        // 요소들 가져오기
        const connectBtn = document.getElementById('connect');
        const disconnectBtn = document.getElementById('disconnect');
        const getEnvBtn = document.getElementById('getEnv');
        const runCodeBtn = document.getElementById('runCode');
        const listScriptsBtn = document.getElementById('listScripts');
        const createScriptBtn = document.getElementById('createScript');
        const outputDiv = document.getElementById('output');
        
        // 상태 변수
        let eventSource = null;
        let sessionId = null;
        
        // 로그 함수
        function log(message) {
          const timestamp = new Date().toLocaleTimeString();
          const line = document.createElement('div');
          line.textContent = `[$], { timestamp }, $, { message } `;
          outputDiv.appendChild(line);
          outputDiv.scrollTop = outputDiv.scrollHeight;
        }
        
        // 버튼 상태 업데이트
        function updateButtonStates(connected) {
          connectBtn.disabled = connected;
          disconnectBtn.disabled = !connected;
          getEnvBtn.disabled = !connected;
          runCodeBtn.disabled = !connected;
          listScriptsBtn.disabled = !connected;
          createScriptBtn.disabled = !connected;
        }
        
        // 연결 함수
        connectBtn.addEventListener('click', () => {
          log('서버에 연결 중...');
          
          // SSE 연결 설정
          eventSource = new EventSource('/api/roblox-studio/events');
          
          // 연결 성공 이벤트
          eventSource.addEventListener('connected', (event) => {
            const data = JSON.parse(event.data);
            sessionId = data.sessionId;
            log(`, 연결, 성공, 세션, ID, $, { sessionId } `);
            updateButtonStates(true);
          });
          
          // 메시지 이벤트
          eventSource.addEventListener('message', (event) => {
            const data = JSON.parse(event.data);
            log(`, 받은, 메시지, $, { JSON, : .stringify(data) } `);
          });
          
          // 연결 해제 이벤트
          eventSource.addEventListener('disconnected', () => {
            log('서버에서 연결 해제');
            closeConnection();
          });
          
          // 오류 이벤트
          eventSource.addEventListener('error', () => {
            log('연결 오류 발생');
            closeConnection();
          });
        });
        
        // 연결 해제 함수
        disconnectBtn.addEventListener('click', async () => {
          if (!sessionId) {
            log('연결되어 있지 않습니다.');
            return;
          }
          
          try {
            log('연결 해제 요청 중...');
            const response = await fetch(` / api / roblox - studio / disconnect / $, { sessionId } `, {
              method: 'POST'
            });
            
            const data = await response.json();
            log(`, 연결, 해제, 응답, $, { JSON, : .stringify(data) } `);
          } catch (error) {
            log(`, 오류, $, { error, : .message } `);
          }
          
          closeConnection();
        });
        
        // 도구 호출 함수
        async function callTool(toolName, args) {
          if (!sessionId) {
            log('연결되어 있지 않습니다.');
            return;
          }
          
          log(`, 도구, 호출, $, { toolName } `);
          
          try {
            const response = await fetch(` / api / roblox - studio / messages / $, { sessionId } `, {
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
            log(`, 응답, $, { JSON, : .stringify(data) } `);
            return data;
          } catch (error) {
            log(`, 오류, $, { error, : .message } `);
            return null;
          }
        }
        
        // 연결 닫기 함수
        function closeConnection() {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          
          sessionId = null;
          updateButtonStates(false);
          log('연결이 닫혔습니다.');
        }
        
        // 환경 정보 가져오기
        getEnvBtn.addEventListener('click', () => {
          callTool('GetStudioEnvironment', {});
        });
        
        // Luau 코드 실행
        runCodeBtn.addEventListener('click', () => {
          callTool('RunLuauCode', {
            code: 'print("Hello from Luau!")\nreturn "테스트 성공"'
          });
        });
        
        // 스크립트 목록
        listScriptsBtn.addEventListener('click', () => {
          callTool('ListScripts', {
            recursive: true
          });
        });
        
        // 스크립트 생성
        createScriptBtn.addEventListener('click', () => {
          callTool('CreateLuauScript', {
            parentId: 'ServerScriptService',
            name: 'TestScript' + Math.floor(Math.random() * 1000),
            scriptType: 'Script',
            content: '-- 테스트 스크립트\nprint("안녕하세요!")'
          });
        });
        
        // 초기 로그
        log('페이지가 로드되었습니다. "서버에 연결" 버튼을 클릭하여 시작하세요.');
      </script>
    </body>
    </html>
  `);
});
// 서버 시작
app.listen(PORT, () => {
    customLogger.info(`서버가 포트 ${PORT}에서 시작되었습니다.`);
    customLogger.info(`웹 브라우저에서 http://localhost:${PORT}/ 를 여세요.`);
});
//# sourceMappingURL=simple-sequential-test.js.map