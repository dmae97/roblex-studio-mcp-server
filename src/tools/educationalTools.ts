import { Tool } from '@modelcontextprotocol/sdk';

export const educationalGameTools: Tool = {
  name: 'create-educational-game',
  description: 'Roblox에서 교육용 게임 및 시뮬레이션 생성',
  parameters: {
    type: 'object',
    required: ['educationLevel', 'subject'],
    properties: {
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
    }
  },
  execute: async (params) => {
    try {
      console.log(`Creating educational game for subject: ${params.subject} at level: ${params.educationLevel}`);
      
      // Default values if not provided
      const interactivityLevel = params.interactivityLevel || 'medium';
      const assessmentType = params.assessmentType || 'quiz';
      const progressTracking = params.progressTracking !== false; // Default to true
      
      // Determine subject name for display
      let subjectName = params.subject;
      if (params.subject === 'custom' && params.customSubject) {
        subjectName = params.customSubject;
      }
      
      // Map for education level display names
      const educationLevelNames = {
        elementary: '초등학교',
        middleSchool: '중학교',
        highSchool: '고등학교',
        university: '대학교',
        professional: '전문가'
      };
      
      // Map subjects to display names
      const subjectDisplayNames = {
        math: '수학',
        science: '과학',
        history: '역사',
        language: '언어',
        coding: '코딩',
        arts: '예술',
        custom: params.customSubject || '사용자 정의 주제'
      };
      
      // Get default learning outcomes if not provided
      const defaultLearningOutcomes = {
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
                              defaultLearningOutcomes[params.subject] || 
                              ['학습 목표 1', '학습 목표 2', '학습 목표 3'];
      
      // Generate core educational system code
      const coreSystemCode = `-- 핵심 교육 시스템
-- 대상: ${educationLevelNames[params.educationLevel]}
-- 주제: ${subjectDisplayNames[params.subject]}

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
\t${learningOutcomes.map(outcome => `"${outcome}"`).join(',\n\t')}
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

-- 레슨 시작
function EducationalSystem:StartLesson(player, lessonId)
\tprint("레슨 시작: " .. lessonId)
\t
\t-- 레슨 콘텐츠 로드
\tlocal lessonContent = self.ContentManager:GetLessonContent(lessonId)
\t
\t-- UI 업데이트
\tself.UserInterface:ShowLessonContent(player, lessonContent)
\t
\t-- 진행 상황 업데이트
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker:UpdateProgress(player, "lesson_started", {lessonId = lessonId})
\tend
\t
\treturn true
end

-- 평가 시작
function EducationalSystem:StartAssessment(player, assessmentId)
\tif not self.AssessmentSystem then return false end
\t
\tprint("평가 시작: " .. assessmentId)
\t
\t-- 평가 콘텐츠 로드
\tlocal assessmentContent = self.ContentManager:GetAssessmentContent(assessmentId)
\t
\t-- 평가 시작
\tself.AssessmentSystem:StartAssessment(player, assessmentContent)
\t
\t-- 진행 상황 업데이트
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker:UpdateProgress(player, "assessment_started", {assessmentId = assessmentId})
\tend
\t
\treturn true
end

-- 평가 제출 처리
function EducationalSystem:SubmitAssessment(player, assessmentId, answers)
\tif not self.AssessmentSystem then return false end
\t
\tprint("평가 제출: " .. assessmentId)
\t
\t-- 평가 채점
\tlocal result = self.AssessmentSystem:GradeAssessment(player, assessmentId, answers)
\t
\t-- 결과 표시
\tself.UserInterface:ShowAssessmentResults(player, result)
\t
\t-- 진행 상황 업데이트
\tif self.Config.ProgressTracking then
\t\tself.ProgressTracker:UpdateProgress(player, "assessment_completed", {
\t\t\tassessmentId = assessmentId,
\t\t\tscore = result.score,
\t\t\tpassed = result.passed
\t\t})
\tend
\t
\treturn result
end

return EducationalSystem`;
      
      // Generate content manager code
      const contentManagerCode = `-- 콘텐츠 관리 시스템
-- 대상: ${educationLevelNames[params.educationLevel]}
-- 주제: ${subjectDisplayNames[params.subject]}

local ContentManager = {}

-- 초기화
function ContentManager:Initialize(config)
\tself.Config = config
\tself.Lessons = {}
\tself.Assessments = {}
\t
\t-- 레슨 콘텐츠 로드
\tself:LoadLessons()
\t
\t-- 평가 콘텐츠 로드
\tif config.AssessmentType ~= "none" then
\t\tself:LoadAssessments()
\tend
\t
\treturn true
end

-- 레슨 콘텐츠 로드
function ContentManager:LoadLessons()
\tprint("레슨 콘텐츠 로드 중...")
\t
\t-- 실제 구현에서는 ModuleScripts, DataStores, 또는 외부 API에서 콘텐츠를 로드합니다
\t-- 여기서는 예시 레슨만 포함합니다
\tself.Lessons = {
\t\t["lesson1"] = {
\t\t\tid = "lesson1",
\t\t\ttitle = "입문 레슨",
\t\t\tdescription = "기본 개념을 소개하는 입문 레슨입니다.",
\t\t\tcontent = {
\t\t\t\t-- 레슨 콘텐츠
\t\t\t}
\t\t},
\t\t["lesson2"] = {
\t\t\tid = "lesson2",
\t\t\ttitle = "중급 개념",
\t\t\tdescription = "더 심화된 개념을 다루는 중급 레슨입니다.",
\t\t\tcontent = {
\t\t\t\t-- 레슨 콘텐츠
\t\t\t}
\t\t}
\t}
end

-- 평가 콘텐츠 로드
function ContentManager:LoadAssessments()
\tprint("평가 콘텐츠 로드 중...")
\t
\t-- 실제 구현에서는 ModuleScripts, DataStores, 또는 외부 API에서 콘텐츠를 로드합니다
\t-- 여기서는 예시 평가만 포함합니다
\tself.Assessments = {
\t\t["quiz1"] = {
\t\t\tid = "quiz1",
\t\t\ttitle = "입문 퀴즈",
\t\t\tdescription = "기본 개념을 테스트하는 퀴즈입니다.",
\t\t\tquestions = {
\t\t\t\t{
\t\t\t\t\tid = "q1",
\t\t\t\t\ttext = "질문 1",
\t\t\t\t\ttype = "multipleChoice",
\t\t\t\t\toptions = {"선택지 1", "선택지 2", "선택지 3", "선택지 4"},
\t\t\t\t\tcorrectAnswer = 2
\t\t\t\t},
\t\t\t\t{
\t\t\t\t\tid = "q2",
\t\t\t\t\ttext = "질문 2",
\t\t\t\t\ttype = "trueFalse",
\t\t\t\t\toptions = {"참", "거짓"},
\t\t\t\t\tcorrectAnswer = 1
\t\t\t\t}
\t\t\t}
\t\t}
\t}
end

-- 레슨 콘텐츠 가져오기
function ContentManager:GetLessonContent(lessonId)
\treturn self.Lessons[lessonId]
end

-- 평가 콘텐츠 가져오기
function ContentManager:GetAssessmentContent(assessmentId)
\treturn self.Assessments[assessmentId]
end

-- 모든 레슨 ID 가져오기
function ContentManager:GetAllLessonIds()
\tlocal ids = {}
\tfor id, _ in pairs(self.Lessons) do
\t\ttable.insert(ids, id)
\tend
\treturn ids
end

-- 모든 평가 ID 가져오기
function ContentManager:GetAllAssessmentIds()
\tlocal ids = {}
\tfor id, _ in pairs(self.Assessments) do
\t\ttable.insert(ids, id)
\tend
\treturn ids
end

return ContentManager`;
      
      // Generate assessment system code based on assessment type
      const assessmentSystemCode = `-- 평가 시스템
-- 유형: ${assessmentType}

local AssessmentSystem = {}

function AssessmentSystem:Initialize(config)
\tself.Config = config
\tself.ActiveAssessments = {}
\treturn true
end

function AssessmentSystem:StartAssessment(player, assessmentContent)
\tprint("평가 시작: " .. player.Name .. ", " .. assessmentContent.id)
\t
\t-- 활성 평가 상태 저장
\tself.ActiveAssessments[player.UserId] = {
\t\tplayerId = player.UserId,
\t\tassessmentId = assessmentContent.id,
\t\tstartTime = os.time(),
\t\tcompleted = false
\t}
\t
\treturn true
end

function AssessmentSystem:GradeAssessment(player, assessmentId, answers)
\tprint("평가 채점: " .. player.Name .. ", " .. assessmentId)
\t
\t-- 활성 평가 상태 가져오기
\tlocal assessment = self.ActiveAssessments[player.UserId]
\tif not assessment or assessment.assessmentId ~= assessmentId then
\t\treturn {error = "유효하지 않은 평가"}
\tend
\t
\t-- 평가 콘텐츠 가져오기 (ContentManager에서)
\tlocal ContentManager = require(script.Parent.ContentManager)
\tlocal assessmentContent = ContentManager:GetAssessmentContent(assessmentId)
\tif not assessmentContent then
\t\treturn {error = "평가 콘텐츠를 찾을 수 없음"}
\tend
\t
\t-- 답변 채점
\tlocal totalQuestions = #assessmentContent.questions
\tlocal correctAnswers = 0
\tlocal questionResults = {}
\t
\tfor i, question in ipairs(assessmentContent.questions) do
\t\tlocal userAnswer = answers[question.id]
\t\tlocal isCorrect = (userAnswer == question.correctAnswer)
\t\t
\t\tif isCorrect then
\t\t\tcorrectAnswers = correctAnswers + 1
\t\tend
\t\t
\t\ttable.insert(questionResults, {
\t\t\tquestionId = question.id,
\t\t\tisCorrect = isCorrect,
\t\t\tuserAnswer = userAnswer,
\t\t\tcorrectAnswer = question.correctAnswer
\t\t})
\tend
\t
\t-- 점수 계산
\tlocal score = totalQuestions > 0 and (correctAnswers / totalQuestions * 100) or 0
\tlocal passed = score >= 70 -- 합격 기준: 70%
\t
\t-- 평가 완료 처리
\tassessment.completed = true
\tassessment.endTime = os.time()
\tassessment.score = score
\tassessment.passed = passed
\t
\treturn {
\t\tassessmentId = assessmentId,
\t\tscore = score,
\t\tpassed = passed,
\t\tcorrectAnswers = correctAnswers,
\t\ttotalQuestions = totalQuestions,
\t\tquestionResults = questionResults,
\t\tcompletionTime = assessment.endTime - assessment.startTime
\t}
end

function AssessmentSystem:GetAssessmentStatus(player, assessmentId)
\tlocal assessment = self.ActiveAssessments[player.UserId]
\tif not assessment or assessment.assessmentId ~= assessmentId then
\t\treturn nil
\tend
\t
\treturn {
\t\tcompleted = assessment.completed,
\t\tstartTime = assessment.startTime,
\t\tendTime = assessment.endTime,
\t\tscore = assessment.score,
\t\tpassed = assessment.passed
\t}
end

return AssessmentSystem`;
      
      // Generate progress tracker code
      const progressTrackerCode = `-- 진행 상황 추적 시스템

local DataStoreService = game:GetService("DataStoreService")
local ProgressTracker = {}

function ProgressTracker:Initialize(config)
\tself.Config = config
\tself.PlayerData = {}
\t
\t-- 데이터 스토어 설정
\tlocal storeNamePrefix = "EducationalProgress_" .. config.Subject .. "_" .. config.EducationLevel
\tself.ProgressStore = DataStoreService:GetDataStore(storeNamePrefix)
\t
\treturn true
end

function ProgressTracker:LoadPlayerData(player)
\tprint("플레이어 데이터 로드: " .. player.Name)
\t
\tlocal success, data = pcall(function()
\t\treturn self.ProgressStore:GetAsync(player.UserId)
\tend)
\t
\tif success and data then
\t\tself.PlayerData[player.UserId] = data
\telse
\t\t-- 새 플레이어 데이터 초기화
\t\tself.PlayerData[player.UserId] = {
\t\t\tplayerId = player.UserId,
\t\t\tusername = player.Name,
\t\t\tjoinDate = os.time(),
\t\t\tlessonsCompleted = {},
\t\t\tassessmentsCompleted = {},
\t\t\tprogress = 0, -- 전체 진행률 (0-100)
\t\t\tlastActive = os.time()
\t\t}
\tend
\t
\treturn self.PlayerData[player.UserId]
end

function ProgressTracker:SavePlayerData(player)
\tprint("플레이어 데이터 저장: " .. player.Name)
\t
\tlocal data = self.PlayerData[player.UserId]
\tif not data then return false end
\t
\t-- 마지막 활동 시간 업데이트
\tdata.lastActive = os.time()
\t
\t-- 데이터 저장
\tlocal success, err = pcall(function()
\t\tself.ProgressStore:SetAsync(player.UserId, data)
\tend)
\t
\tif not success then
\t\twarn("플레이어 데이터 저장 실패: " .. tostring(err))
\t\treturn false
\tend
\t
\treturn true
end

function ProgressTracker:UpdateProgress(player, eventType, eventData)
\tprint("진행 상황 업데이트: " .. player.Name .. ", " .. eventType)
\t
\tlocal data = self.PlayerData[player.UserId]
\tif not data then return false end
\t
\t-- 이벤트 유형에 따라 데이터 업데이트
\tif eventType == "lesson_started" then
\t\tdata.currentLesson = eventData.lessonId
\t\t
\telseif eventType == "lesson_completed" then
\t\t-- 완료된 레슨 업데이트
\t\tdata.lessonsCompleted[eventData.lessonId] = {
\t\t\tcompletionTime = os.time(),
\t\t\tduration = eventData.duration
\t\t}
\t\tdata.currentLesson = nil
\t\t
\t\t-- 전체 진행률 재계산
\t\tself:RecalculateProgress(player)
\t\t
\telseif eventType == "assessment_started" then
\t\tdata.currentAssessment = eventData.assessmentId
\t\t
\telseif eventType == "assessment_completed" then
\t\t-- 완료된 평가 업데이트
\t\tdata.assessmentsCompleted[eventData.assessmentId] = {
\t\t\tcompletionTime = os.time(),
\t\t\tscore = eventData.score,
\t\t\tpassed = eventData.passed
\t\t}
\t\tdata.currentAssessment = nil
\t\t
\t\t-- 전체 진행률 재계산
\t\tself:RecalculateProgress(player)
\tend
\t
\t-- 플레이어 데이터 저장
\tself:SavePlayerData(player)
\t
\treturn true
end

function ProgressTracker:RecalculateProgress(player)
\tlocal data = self.PlayerData[player.UserId]
\tif not data then return end
\t
\t-- ContentManager에서 총 레슨 및 평가 수 가져오기
\tlocal ContentManager = require(script.Parent.ContentManager)
\tlocal allLessons = ContentManager:GetAllLessonIds()
\tlocal allAssessments = ContentManager:GetAllAssessmentIds()
\t
\t-- 완료율 계산
\tlocal totalItems = #allLessons + #allAssessments
\tlocal completedItems = 0
\t
\t-- 완료된 레슨 수
\tfor _, _ in pairs(data.lessonsCompleted) do
\t\tcompletedItems = completedItems + 1
\tend
\t
\t-- 완료된 평가 수 (합격한 것만 계산)
\tfor _, assessment in pairs(data.assessmentsCompleted) do
\t\tif assessment.passed then
\t\t\tcompletedItems = completedItems + 1
\t\tend
\tend
\t
\t-- 진행률 계산 (0-100)
\tdata.progress = totalItems > 0 and math.floor(completedItems / totalItems * 100) or 0
\t
\treturn data.progress
end

function ProgressTracker:GetPlayerProgress(player)
\tlocal data = self.PlayerData[player.UserId]
\tif not data then return nil end
\t
\treturn {
\t\tprogress = data.progress,
\t\tlessonsCompleted = data.lessonsCompleted,
\t\tassessmentsCompleted = data.assessmentsCompleted,
\t\tcurrentLesson = data.currentLesson,
\t\tcurrentAssessment = data.currentAssessment
\t}
end

return ProgressTracker`;
      
      // Generate UI template names based on interactivity level
      const uiTemplates = {
        low: ['기본 레슨 UI', '기본 퀴즈 UI'],
        medium: ['대화형 레슨 UI', '멀티미디어 퀴즈 UI', '진행 상황 표시 UI'],
        high: ['완전 대화형 레슨 UI', '고급 시뮬레이션 UI', '상호작용형 퀴즈 UI', '3D 시각화 UI', '실시간 피드백 UI']
      };
      
      const selectedTemplates = uiTemplates[interactivityLevel] || uiTemplates.medium;
      
      // Prepare result based on the selected options
      return {
        gameTemplate: {
          name: `${params.subject}Educational${params.educationLevel}`,
          description: `${educationLevelNames[params.educationLevel]} 수준의 ${subjectDisplayNames[params.subject]} 교육용 게임`,
          components: [
            {
              name: 'CoreEducationalSystem',
              type: 'ModuleScript',
              content: coreSystemCode
            },
            {
              name: 'ContentManager',
              type: 'ModuleScript',
              content: contentManagerCode
            },
            {
              name: 'AssessmentSystem',
              type: 'ModuleScript',
              content: assessmentSystemCode
            },
            {
              name: 'ProgressTracker',
              type: 'ModuleScript',
              content: progressTrackerCode
            }
          ],
          uiComponents: selectedTemplates.map(template => ({
            name: template.replace(/\s+/g, ''),
            preview: 'preview_url_placeholder',
            description: template
          }))
        },
        contentSamples: [
          {
            name: '샘플 레슨: 기본 개념 소개',
            content: '레슨 내용 샘플입니다. 실제 구현에서는 각 교육 주제에 맞는 상세한 내용이 포함됩니다.'
          },
          {
            name: '샘플 퀴즈: 기본 개념 평가',
            questions: [
              '질문 1: 이것은 샘플 질문입니다.',
              '질문 2: 이것은 또 다른 샘플 질문입니다.',
              '질문 3: 이것은 마지막 샘플 질문입니다.'
            ]
          }
        ],
        teacherGuide: {
          setup: `# ${subjectDisplayNames[params.subject]} 교육용 게임 설정 가이드\n\n## 개요\n이 가이드는 ${educationLevelNames[params.educationLevel]} 수준의 ${subjectDisplayNames[params.subject]} 교육용 게임을 설정하고 사용하는 방법을 설명합니다.\n\n## 설정 단계\n1. 스크립트와 UI 컴포넌트를 Roblox Studio 프로젝트에 추가합니다.\n2. 콘텐츠 관리자를 통해 교육 콘텐츠를 추가하거나 수정합니다.\n3. 필요에 따라 평가 시스템을 구성합니다.\n4. 진행 상황 추적이 필요한 경우 적절히 설정합니다.`,
          lessonPlans: [
            `# 레슨 계획 1: 기본 개념 소개\n\n## 목표\n- ${learningOutcomes[0] || '학습 목표 1'}\n\n## 활동\n1. 개념 소개\n2. 예시 및 시연\n3. 학생 활동\n4. 평가 및 피드백`,
            `# 레슨 계획 2: 중급 개념\n\n## 목표\n- ${learningOutcomes[1] || '학습 목표 2'}\n\n## 활동\n1. 이전 개념 복습\n2. 새 개념 소개\n3. 그룹 활동\n4. 토론 및 평가`
          ],
          assessmentGuide: `# 평가 가이드\n\n## 평가 유형: ${assessmentType}\n\n## 평가 구성\n- 각 평가는 다양한 유형의 질문을 포함할 수 있습니다.\n- 합격 기준은 70% 이상의 정답률입니다.\n\n## 평가 생성\n1. ContentManager에 새 평가를 추가합니다.\n2. 질문, 답변 옵션, 정답을 구성합니다.\n3. 필요에 따라 피드백 메시지를 구성합니다.`
        }
      };
    } catch (error) {
      console.error('Error in educational game tools:', error);
      throw new Error(`Educational game creation failed: ${error.message}`);
    }
  }
};
