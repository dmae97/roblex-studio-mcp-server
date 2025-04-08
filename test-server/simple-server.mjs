import { McpServer } from '@modelcontextprotocol/sdk/dist/esm/server.js';

// 로깅 헬퍼 함수
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

async function main() {
  // MCP 서버 인스턴스 생성
  const server = new McpServer({
    name: 'Simple Roblex Studio MCP Server',
    description: 'A simple MCP server for Roblex Studio',
    version: '1.0.0',
  });

  // 간단한 툴 등록
  server.registerTool({
    name: 'test-tool',
    description: 'A test tool',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'A test message',
        },
      },
      required: ['message'],
    },
    handler: async (params) => {
      log(`Tool called with message: ${params.message}`);
      return {
        result: {
          message: `You said: ${params.message}`,
        },
      };
    },
  });

  // 간단한 리소스 등록
  server.registerResource({
    name: 'test-resource',
    description: 'A test resource',
    list: async () => {
      return [
        {
          uri: 'test://resource/1',
          name: 'Test Resource 1',
          description: 'A test resource',
        },
      ];
    },
    get: async (uri) => {
      if (uri === 'test://resource/1') {
        return {
          content: 'This is a test resource content.',
          contentType: 'text/plain',
        };
      }
      return null;
    },
  });

  // 서버 시작
  const port = 3001;
  try {
    await server.listen(port);
    log(`🚀 MCP Server started on port ${port}`);
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch(console.error); 