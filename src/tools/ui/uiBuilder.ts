import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../../utils/logger.js';
import { McpError } from '@modelcontextprotocol/sdk/types.js';

// UI 컴포넌트 생성 함수 구현 
const generateUiComponentCode = (componentType: string, properties: any = {}, parentPath: string = 'game.Players.LocalPlayer.PlayerGui') => {
  // 기본 컴포넌트 코드 템플릿
  let code = `-- ${componentType} UI 컴포넌트 생성
local component = Instance.new("${componentType}")
`;

  // 속성 추가
  for (const [key, value] of Object.entries(properties)) {
    if (typeof value === 'string') {
      code += `component.${key} = "${value}"\n`;
    } else {
      code += `component.${key} = ${value}\n`;
    }
  }

  // 부모 설정
  code += `
-- 부모 경로에 컴포넌트 연결
local parent = ${parentPath}
component.Parent = parent

return component -- 생성된 컴포넌트 반환
`;

  return code;
};

// 레이아웃 코드 생성 함수 구현
const generateLayoutCode = (layoutType: string, targetContainerPath: string, layoutOptions: any = {}) => {
  let layoutClassName = "";
  switch (layoutType) {
    case "List": layoutClassName = "UIListLayout"; break;
    case "Grid": layoutClassName = "UIGridLayout"; break;
    case "Horizontal": layoutClassName = "UIListLayout"; break;
    case "Vertical": layoutClassName = "UIListLayout"; break;
    default: layoutClassName = "UIListLayout";
  }

  let code = `-- ${layoutType} 레이아웃 생성
local layout = Instance.new("${layoutClassName}")
`;

  // 레이아웃 타입별 기본 설정
  if (layoutType === "Horizontal") {
    code += `layout.FillDirection = Enum.FillDirection.Horizontal\n`;
  } else if (layoutType === "Vertical") {
    code += `layout.FillDirection = Enum.FillDirection.Vertical\n`;
  }

  // 추가 옵션 설정
  for (const [key, value] of Object.entries(layoutOptions)) {
    if (typeof value === 'string') {
      code += `layout.${key} = "${value}"\n`;
    } else {
      code += `layout.${key} = ${value}\n`;
    }
  }

  // 대상 컨테이너에 레이아웃 적용
  code += `
-- 대상 컨테이너에 레이아웃 연결
local container = ${targetContainerPath}
layout.Parent = container

return layout -- 생성된 레이아웃 반환
`;

  return code;
};

// 테마 코드 생성 함수 구현
const generateThemeCode = (themeName: string, targetRootPath: string) => {
  // 테마 유형에 따른 색상 및 스타일 정의
  const themes: {[key: string]: {backgroundColor: string, textColor: string, buttonColor: string, borderColor: string}} = {
    "Dark": {
      backgroundColor: "Color3.fromRGB(40, 40, 40)",
      textColor: "Color3.fromRGB(255, 255, 255)",
      buttonColor: "Color3.fromRGB(60, 60, 60)",
      borderColor: "Color3.fromRGB(100, 100, 100)"
    },
    "Light": {
      backgroundColor: "Color3.fromRGB(240, 240, 240)",
      textColor: "Color3.fromRGB(0, 0, 0)",
      buttonColor: "Color3.fromRGB(220, 220, 220)",
      borderColor: "Color3.fromRGB(180, 180, 180)"
    },
    "Fantasy": {
      backgroundColor: "Color3.fromRGB(50, 30, 80)",
      textColor: "Color3.fromRGB(255, 240, 200)",
      buttonColor: "Color3.fromRGB(90, 50, 120)",
      borderColor: "Color3.fromRGB(160, 120, 200)"
    }
  };

  // 기본 테마로 폴백
  const theme = themes[themeName] || themes["Light"];

  let code = `-- ${themeName} 테마 적용
local function ApplyTheme(element)
    -- 요소 유형에 따라 적절한 테마 속성 적용
    if element:IsA("Frame") or element:IsA("ScrollingFrame") then
        element.BackgroundColor3 = ${theme.backgroundColor}
        element.BorderColor3 = ${theme.borderColor}
    elseif element:IsA("TextLabel") or element:IsA("TextBox") or element:IsA("TextButton") then
        element.TextColor3 = ${theme.textColor}
        element.BackgroundColor3 = ${theme.buttonColor}
    elseif element:IsA("ImageButton") or element:IsA("ImageLabel") then
        element.BackgroundColor3 = ${theme.backgroundColor}
        element.BorderColor3 = ${theme.borderColor}
    end
    
    -- 자식 요소에 재귀적으로 테마 적용
    for _, child in ipairs(element:GetChildren()) do
        if child:IsA("GuiObject") then
            ApplyTheme(child)
        end
    end
end

-- 대상 루트 UI 요소에 테마 적용
local rootElement = ${targetRootPath}
ApplyTheme(rootElement)

print("${themeName} 테마가 성공적으로 적용되었습니다.")
`;

  return code;
};

// Define Zod schemas for tool parameters
const createComponentSchema = z.object({
  componentType: z.enum(['Button', 'Label', 'Frame', 'TextBox', 'ImageLabel', 'ScrollingFrame']).describe('생성할 UI 컴포넌트 유형'),
  properties: z.record(z.any()).optional().describe('컴포넌트의 초기 속성 (예: { Text: "Click Me", Size: new UDim2(0, 100, 0, 50) })'),
  parentPath: z.string().optional().default('game.Players.LocalPlayer.PlayerGui').describe('부모 UI 요소의 인스턴스 경로')
});

const applyLayoutSchema = z.object({
  layoutType: z.enum(['List', 'Grid', 'Horizontal', 'Vertical']).describe('적용할 UI 레이아웃 유형'),
  targetContainerPath: z.string().describe('레이아웃을 적용할 컨테이너의 인스턴스 경로'),
  layoutOptions: z.record(z.any()).optional().describe('레이아웃 옵션 (예: Padding, CellSize)')
});

const applyThemeSchema = z.object({
  themeName: z.string().describe('적용할 테마 이름 (예: Dark, Light, Fantasy)'),
  targetRootPath: z.string().describe('테마를 적용할 루트 UI 요소의 인스턴스 경로')
});

/**
 * Roblox UI 요소를 프로그래밍 방식으로 구축하기 위한 도구 세트.
 */
const uiBuilder = {
  // tools/index.ts에서 호출할 등록 메서드
  register: (server: McpServer) => {
    logger.info('UI Builder 도구 등록 중...');

    // 'ui-create-component' 도구 등록
    (server as any).tool(
      'ui-create-component',
      createComponentSchema,
      async (params: any) => {
        try {
          // 검증된 매개변수 직접 사용
          const code = generateUiComponentCode(params.componentType, params.properties || {}, params.parentPath);
          return {
            content: [{ type: 'text', text: `${params.componentType} 생성 코드:\n\n\`\`\`lua\n${code}\n\`\`\` ` }]
          };
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('UI 컴포넌트 코드 생성 오류', { err: error, params });
          return { content: [{ type: 'text', text: `UI 컴포넌트 코드 생성 오류: ${errorMessage}` }], isError: true };
        }
      }
    );

    // 'ui-apply-layout' 도구 등록
    (server as any).tool(
      'ui-apply-layout',
      applyLayoutSchema,
      async (params: any) => {
        try {
          const code = generateLayoutCode(params.layoutType, params.targetContainerPath, params.layoutOptions || {});
          return {
            content: [{ type: 'text', text: `${params.layoutType} 레이아웃 생성 코드:\n\n\`\`\`lua\n${code}\n\`\`\` ` }]
          };
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('UI 레이아웃 코드 생성 오류', { err: error, params });
          return { content: [{ type: 'text', text: `UI 레이아웃 코드 생성 오류: ${errorMessage}` }], isError: true };
        }
      }
    );

    // 'ui-apply-theme' 도구 등록
    (server as any).tool(
      'ui-apply-theme',
      applyThemeSchema,
      async (params: any) => {
        try {
          const code = generateThemeCode(params.themeName, params.targetRootPath);
          return {
            content: [{ type: 'text', text: `${params.themeName} 테마 생성 코드:\n\n\`\`\`lua\n${code}\n\`\`\` ` }]
          };
        } catch (error: any) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          logger.error('UI 테마 코드 생성 오류', { err: error, params });
          return { content: [{ type: 'text', text: `UI 테마 코드 생성 오류: ${errorMessage}` }], isError: true };
        }
      }
    );

    logger.info('UI Builder 도구가 등록되었습니다.');
  }
};

export { uiBuilder };
