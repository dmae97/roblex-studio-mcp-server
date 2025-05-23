import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../utils/logger.js';

/**
 * Roblex Studio용 교육 게임 도구
 */
export const educationalTools = {
  register: (server: McpServer) => {
    (server as any).tool(
      'create-educational-game',
      {
        educationLevel: {
          type: 'string',
          enum: ['elementary', 'middleSchool', 'highSchool', 'university', 'professional'],
          description: '대상 교육 수준'
        },
        subject: {
          type: 'string',
          enum: ['math', 'science', 'history', 'language', 'coding', 'arts', 'custom'],
          description: '교육 주제'
        },
        customSubject: {
          type: 'string',
          description: '사용자 정의 주제(subject가 custom인 경우)'
        },
        learningOutcomes: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: '학습 목표 배열'
        },
        interactivityLevel: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: '상호작용 수준'
        },
        assessmentType: {
          type: 'string',
          enum: ['quiz', 'project', 'simulation', 'none'],
          description: '평가 유형'
        },
        progressTracking: {
          type: 'boolean',
          description: '학습 진행 상황 추적 기능 포함 여부'
        }
      },
      async (params: any) => {
        try {
          logger.info(`Creating educational game for subject: ${params.subject} at level: ${params.educationLevel}`);
          
          // 제공되지 않은 경우 기본값
          const interactivityLevel = params.interactivityLevel || 'medium';
          const assessmentType = params.assessmentType || 'quiz';
          const progressTracking = params.progressTracking !== false; // 기본값은 true
          
          // 표시용 주제 이름 결정
          let subjectName = params.subject;
          if (params.subject === 'custom' && params.customSubject) {
            subjectName = params.customSubject;
          }
          
          // 교육 수준 표시 이름 매핑
          const educationLevelNames: {[key: string]: string} = {
            elementary: '초등학교',
            middleSchool: '중학교',
            highSchool: '고등학교',
            university: '대학교',
            professional: '전문가'
          };
          
          // 주제를 표시 이름에 매핑
          const subjectDisplayNames: {[key: string]: string} = {
            math: '수학',
            science: '과학',
            history: '역사',
            language: '언어',
            coding: '코딩',
            arts: '예술',
            custom: params.customSubject || '사용자 정의 주제'
          };
          
          // 제공되지 않은 경우 기본 학습 결과
          const defaultLearningOutcomes: {[key: string]: string[]} = {
            math: [
              '수치적 문제 해결 능력 향상',
              '수학적 개념 이해 증진',
              '수식과 방정식 조작 능력 함양'
            ],
            science: [
              '과학적 방법론 이해',
              '자연 현상에 대한 이해 증진',
              '실험 설계 및 분석 능력 개발'
            ],
            history: [
              '역사적 사건과 인물 이해',
              '시간순 연대기 파악',
              '역사적 맥락에서 현대 이슈 분석'
            ],
            language: [
              '어휘력 향상',
              '문법 규칙 이해 및 활용',
              '효과적인 의사소통 능력 개발'
            ],
            coding: [
              '프로그래밍 개념 이해',
              '논리적 문제 해결 능력 개발',
              '코드 작성 및 디버깅 능력 향상'
            ],
            arts: [
              '창의적 표현 능력 개발',
              '예술 형식과 기법 이해',
              '비평적 감상 능력 함양'
            ]
          };
          
          const learningOutcomes = params.learningOutcomes || 
                                (params.subject && defaultLearningOutcomes[params.subject as keyof typeof defaultLearningOutcomes]) || 
                                ['학습 목표 1', '학습 목표 2', '학습 목표 3'];
          
          // 핵심 교육 시스템 코드 생성
          const coreSystemCode = `-- 핵심 교육 시스템
-- 대상: ${params.educationLevel && educationLevelNames[params.educationLevel as keyof typeof educationLevelNames]}
-- 주제: ${params.subject && subjectDisplayNames[params.subject as keyof typeof subjectDisplayNames]}

local EducationalSystem = {}
EducationalSystem.Config = {
\tSubject = "${params.subject}",
\tEducationLevel = "${params.educationLevel}",
\tInteractivityLevel = "${interactivityLevel}",
\tAssessmentType = "${assessmentType}",
\tProgressTracking = ${progressTracking}
}

-- 학습 목표
EducationalSystem.LearningOutcomes = {
\t${learningOutcomes.map((outcome: string) => `"${outcome}"`).join(',\n\t')}
}

-- 시스템 초기화
function EducationalSystem:Initialize()
\tprint("교육 시스템 초기화 중...")
\t
\t-- 모듈 초기화
\tself.ContentManager = require(script.Parent.ContentManager)
\tself.ContentManager:Initialize(self.Config)
\t
\tself.UserInterface = require(script.Parent.UserInterface)
\tself.UserInterface:Initialize(self.Config)
\t
\tif self.Config.AssessmentType ~= "none" then
\t\tself.AssessmentSystem = require(script.Parent.AssessmentSystem)
\t\tself.AssessmentSystem:Initialize(self.Config)
\tend
\t
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker = require(script.Parent.ProgressTracker)
\t\tself.ProgressTracker:Initialize(self.Config)
\tend
\t
\t-- 이벤트 리스너 설정
\tself:SetupEventListeners()
\t
\treturn true
end

-- 이벤트 리스너 설정
function EducationalSystem:SetupEventListeners()
\tlocal Players = game:GetService("Players")
\t
\t-- 플레이어 참가 시 처리
\tPlayers.PlayerAdded:Connect(function(player)
\t\tself:OnPlayerJoined(player)
\tend)
\t
\t-- 플레이어 퇴장 시 처리
\tPlayers.PlayerRemoving:Connect(function(player)
\t\tself:OnPlayerLeft(player)
\tend)
end

-- 플레이어 참가 처리
function EducationalSystem:OnPlayerJoined(player)
\tprint("플레이어 참가: " .. player.Name)
\t
\t-- 플레이어 데이터 로드
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker:LoadPlayerData(player)
\tend
\t
\t-- 시작 화면 표시
\tself.UserInterface:ShowWelcomeScreen(player)
end

-- 플레이어 퇴장 처리
function EducationalSystem:OnPlayerLeft(player)
\tprint("플레이어 퇴장: " .. player.Name)
\t
\t-- 플레이어 데이터 저장
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker:SavePlayerData(player)
\tend
end

return EducationalSystem`;
          
          return {
            content: [
              { type: 'text', text: coreSystemCode }
            ]
          };
        } catch (error: any) {
          logger.error('Error creating educational game:', error);
          return {
            content: [
              { type: 'text', text: `Error creating educational game: ${error instanceof Error ? error.message : String(error)}` }
            ],
            isError: true
          };
        }
      }
    );
    
    // 추가 교육 도구들도 등록
    (server as any).tool(
      'create-quiz-system',
      {
        subject: {
          type: 'string',
          description: '퀴즈 주제'
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard', 'mixed'],
          description: '퀴즈 난이도'
        },
        questionsCount: {
          type: 'number',
          description: '퀴즈 문항 수'
        }
      },
      async (params: any) => {
        logger.info(`Creating quiz system for subject: ${params.subject}`);
        
        return {
          content: [
            { type: 'text', text: `-- Quiz system for ${params.subject} created` }
          ]
        };
      }
    );
  }
};
