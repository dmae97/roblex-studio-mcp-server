import { BaseModel } from './BaseModel.js';
import { ModelState } from './types.js';
import { logger } from '../utils/logger.js';
import { validateModelData, validateModelUpdates } from './validation.js';

/**
 * Roblox Studio 모델 클래스
 * 스크립트, UI, 서비스 등 Roblox Studio의 다양한 요소를 표현합니다.
 */

// 베이스 Roblox Studio 모델 클래스 - 다른 클래스의 기본 클래스로 사용
export class RoblexStudioBaseModel extends BaseModel {
  constructor(id: string, initialState?: Record<string, unknown>) {
    super(id);
    
    // 기본 상태 설정
    this.setValue('created', new Date().toISOString());
    this.setValue('modified', new Date().toISOString());
    this.setValue('properties', {});
    
    // 초기 상태가 있으면 설정
    if (initialState) {
      this.setValues(initialState);
    }
  }
  
  // 특정 모델 타입 확인
  protected getModelType(): 'script' | 'ui' | 'service' | null {
    if (this instanceof RoblexStudioScriptModel) {
      return 'script';
    } else if (this instanceof RoblexStudioUIModel) {
      return 'ui';
    } else if (this instanceof RoblexStudioServiceModel) {
      return 'service';
    }
    return null;
  }
  
  // 값 설정 시 유효성 검사 추가
  setValue(key: string, value: unknown): void {
    // 모델 타입 결정
    const modelType = this.getModelType();
    
    // 모델 타입이 없거나 특수 필드는 검증 없이 설정
    if (!modelType || key === 'modified' || key === 'created' || key === 'properties') {
      super.setValue(key, value);
      return;
    }
    
    // 단일 필드 업데이트 유효성 검사
    const update = { [key]: value };
    const validation = validateModelUpdates(update, modelType);
    
    if (validation.success && validation.data) {
      // 검증 통과, 값 설정
      super.setValue(key, value);
      // 수정 시간 업데이트
      super.setValue('modified', new Date().toISOString());
    } else {
      // 검증 실패, 오류 로깅
      logger.warn(`Invalid value for ${this.id}.${key}`, { errors: validation.errors });
      throw new Error(`Invalid value for ${key}: ${JSON.stringify(validation.errors)}`);
    }
  }
  
  // 여러 값 설정 시 유효성 검사 추가
  setValues(values: Record<string, unknown>): void {
    // 모델 타입 결정
    const modelType = this.getModelType();
    
    // 모델 타입이 없으면 검증 없이 설정
    if (!modelType) {
      super.setValues(values);
      return;
    }
    
    // modified, created 필드 분리 (자동 관리 필드)
    const { modified, created, ...otherValues } = values;
    
    // 유효성 검사 실행
    const validation = validateModelUpdates(otherValues, modelType);
    
    if (validation.success && validation.data) {
      // 검증 통과, 값 설정
      super.setValues(validation.data);
      // 수정 시간 업데이트
      super.setValue('modified', new Date().toISOString());
    } else {
      // 검증 실패, 오류 로깅
      logger.warn(`Invalid values for ${this.id}`, { errors: validation.errors });
      throw new Error(`Invalid values: ${JSON.stringify(validation.errors)}`);
    }
  }

  // getValue 메소드 타입 오버라이드
  getValue<T>(key: string, defaultValue?: T): T {
    return super.getValue(key, defaultValue);
  }
}

/**
 * Specialized model for Roblox Studio script objects
 */
export class RoblexStudioScriptModel extends RoblexStudioBaseModel {
  /**
   * Create a new Roblox Studio script model
   * @param id Script ID (usually the name)
   * @param initialState Initial script properties
   */
  constructor(id: string, initialState: ModelState = {}) {
    super(id);
    
    // 기본 스크립트 속성 설정
    this.setValue('type', 'ModuleScript');
    this.setValue('content', '-- Empty Script');
    this.setValue('enabled', true);
    
    // 기본 속성과 초기 속성 병합
    const scriptState = {
      scriptType: 'Script',  // Script, LocalScript, or ModuleScript
      source: '',
      enabled: true,
      runContext: 'Server',  // Server, Client, or Legacy
      parent: 'ServerScriptService',
      ...initialState
    };
    
    // 초기 상태 유효성 검사 후 설정
    const validation = validateModelData(scriptState, 'script');
    if (validation.success && validation.data) {
      super.setValues(validation.data);
    } else {
      logger.warn(`Invalid initial state for script ${id}`, { errors: validation.errors });
      throw new Error(`Invalid initial state for script: ${JSON.stringify(validation.errors)}`);
    }
    
    logger.debug(`Roblox Studio script model created: ${id}`);
  }
  
  /**
   * Get the script source code
   * @returns Source code as string
   */
  getSource(): string {
    return this.getValue<string>('source', '');
  }
  
  /**
   * Set the script source code
   * @param source New source code
   */
  setSource(source: string): void {
    this.setValue('source', source);
  }
  
  /**
   * Get the script type
   * @returns Script type (Script, LocalScript, or ModuleScript)
   */
  getScriptType(): string {
    return this.getValue<string>('scriptType', 'Script');
  }
  
  /**
   * Set the script type
   * @param scriptType New script type (Script, LocalScript, or ModuleScript)
   */
  setScriptType(scriptType: string): void {
    if (!['Script', 'LocalScript', 'ModuleScript'].includes(scriptType)) {
      logger.warn(`Invalid script type: ${scriptType}, using 'Script' instead`);
      scriptType = 'Script';
    }
    
    this.setValue('scriptType', scriptType);
  }
  
  /**
   * Get the run context
   * @returns Run context (Server, Client, or Legacy)
   */
  getRunContext(): string {
    return this.getValue<string>('runContext', 'Server');
  }
  
  /**
   * Set the run context
   * @param runContext New run context (Server, Client, or Legacy)
   */
  setRunContext(runContext: string): void {
    if (!['Server', 'Client', 'Legacy'].includes(runContext)) {
      logger.warn(`Invalid run context: ${runContext}, using 'Server' instead`);
      runContext = 'Server';
    }
    
    this.setValue('runContext', runContext);
  }
  
  /**
   * Check if the script is enabled
   * @returns true if enabled, false otherwise
   */
  isEnabled(): boolean {
    return this.getValue<boolean>('enabled', true);
  }
  
  /**
   * Set the enabled state of the script
   * @param enabled New enabled state
   */
  setEnabled(enabled: boolean): void {
    this.setValue('enabled', enabled);
  }
  
  /**
   * Get the parent of the script
   * @returns Parent name or path
   */
  getParent(): string {
    return this.getValue<string>('parent', 'ServerScriptService');
  }
  
  /**
   * Set the parent of the script
   * @param parent New parent name or path
   */
  setParent(parent: string): void {
    this.setValue('parent', parent);
  }
}

/**
 * Specialized model for Roblox Studio UI objects
 */
export class RoblexStudioUIModel extends RoblexStudioBaseModel {
  /**
   * Create a new Roblox Studio UI model
   * @param id UI element ID (usually the name)
   * @param initialState Initial UI properties
   */
  constructor(id: string, initialState: ModelState = {}) {
    super(id);
    
    // 기본 UI 속성 설정
    this.setValue('type', 'Frame');
    this.setValue('visible', true);
    this.setValue('position', { x: 0, y: 0 });
    this.setValue('size', { width: 100, height: 100 });
    
    // 기본 속성과 초기 속성 병합
    const uiState = {
      uiType: 'Frame',
      visible: true,
      position: { x: 0, y: 0 },
      size: { x: 100, y: 100 },
      anchorPoint: { x: 0, y: 0 },
      parent: 'PlayerGui',
      children: [],
      ...initialState
    };
    
    // 초기 상태 유효성 검사 후 설정
    const validation = validateModelData(uiState, 'ui');
    if (validation.success && validation.data) {
      super.setValues(validation.data);
    } else {
      logger.warn(`Invalid initial state for UI element ${id}`, { errors: validation.errors });
      throw new Error(`Invalid initial state for UI: ${JSON.stringify(validation.errors)}`);
    }
    
    logger.debug(`Roblox Studio UI model created: ${id}`);
  }
  
  /**
   * Get the UI class name
   * @returns Class name
   */
  getClassName(): string {
    return this.getValue<string>('className', 'Frame');
  }
  
  /**
   * Set the UI class name
   * @param className New class name
   */
  setClassName(className: string): void {
    this.setValue('className', className);
  }
  
  /**
   * Get the size of the UI element
   * @returns Size as {x, y}
   */
  getSize(): { x: number; y: number } {
    return this.getValue<{ x: number; y: number }>('size', { x: 200, y: 200 });
  }
  
  /**
   * Set the size of the UI element
   * @param x Width
   * @param y Height
   */
  setSize(x: number, y: number): void {
    this.setValue('size', { x, y });
  }
  
  /**
   * Get the position of the UI element
   * @returns Position as {x, y}
   */
  getPosition(): { x: number; y: number } {
    return this.getValue<{ x: number; y: number }>('position', { x: 0, y: 0 });
  }
  
  /**
   * Set the position of the UI element
   * @param x X coordinate
   * @param y Y coordinate
   */
  setPosition(x: number, y: number): void {
    this.setValue('position', { x, y });
  }
  
  /**
   * Get the anchor point of the UI element
   * @returns Anchor point as {x, y}
   */
  getAnchorPoint(): { x: number; y: number } {
    return this.getValue<{ x: number; y: number }>('anchorPoint', { x: 0, y: 0 });
  }
  
  /**
   * Set the anchor point of the UI element
   * @param x X anchor (0-1)
   * @param y Y anchor (0-1)
   */
  setAnchorPoint(x: number, y: number): void {
    // Clamp values to 0-1 range
    x = Math.max(0, Math.min(1, x));
    y = Math.max(0, Math.min(1, y));
    
    this.setValue('anchorPoint', { x, y });
  }
  
  /**
   * Check if the UI element is visible
   * @returns true if visible, false otherwise
   */
  isVisible(): boolean {
    return this.getValue<boolean>('visible', true);
  }
  
  /**
   * Set the visibility of the UI element
   * @param visible New visibility state
   */
  setVisible(visible: boolean): void {
    this.setValue('visible', visible);
  }
  
  /**
   * Get the Z-index of the UI element
   * @returns Z-index value
   */
  getZIndex(): number {
    return this.getValue<number>('zIndex', 1);
  }
  
  /**
   * Set the Z-index of the UI element
   * @param zIndex New Z-index value
   */
  setZIndex(zIndex: number): void {
    this.setValue('zIndex', zIndex);
  }
  
  /**
   * Get a specific UI property
   * @param propertyName Property name
   * @param defaultValue Default value if property doesn't exist
   * @returns Property value
   */
  getProperty<T>(propertyName: string, defaultValue?: T): T {
    const properties = this.getValue<Record<string, unknown>>('properties', {});
    return (properties[propertyName] as T) ?? defaultValue as T;
  }
  
  /**
   * Set a specific UI property
   * @param propertyName Property name
   * @param value Property value
   */
  setProperty(propertyName: string, value: unknown): void {
    const properties = this.getValue<Record<string, unknown>>('properties', {});
    this.setValue('properties', { ...properties, [propertyName]: value });
  }
  
  /**
   * Add a child to this UI element
   * @param childName Child name
   */
  addChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    if (!children.includes(childName)) {
      this.setValue('children', [...children, childName]);
    }
  }
  
  /**
   * Remove a child from this UI element
   * @param childName Child name
   */
  removeChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    this.setValue('children', children.filter(child => child !== childName));
  }
}

/**
 * Specialized model for Roblox Studio service objects
 */
export class RoblexStudioServiceModel extends RoblexStudioBaseModel {
  /**
   * Create a new Roblox Studio service model
   * @param id Service ID (usually the name)
   * @param initialState Initial service properties
   */
  constructor(id: string, initialState: ModelState = {}) {
    super(id);
    
    // 기본 서비스 속성 설정
    this.setValue('type', 'Service');
    
    // 기본 속성과 초기 속성 병합
    const serviceState = {
      serviceType: 'Custom',
      properties: {},
      ...initialState
    };
    
    // 초기 상태 유효성 검사 후 설정
    const validation = validateModelData(serviceState, 'service');
    if (validation.success && validation.data) {
      super.setValues(validation.data);
    } else {
      logger.warn(`Invalid initial state for service ${id}`, { errors: validation.errors });
      throw new Error(`Invalid initial state for service: ${JSON.stringify(validation.errors)}`);
    }
    
    logger.debug(`Roblox Studio service model created: ${id}`);
  }
  
  /**
   * Get the service name
   * @returns Service name
   */
  getServiceName(): string {
    return this.getValue<string>('serviceName', this.id);
  }
  
  /**
   * Get a specific service property
   * @param propertyName Property name
   * @param defaultValue Default value if property doesn't exist
   * @returns Property value
   */
  getProperty<T>(propertyName: string, defaultValue?: T): T {
    const properties = this.getValue<Record<string, unknown>>('properties', {});
    return (properties[propertyName] as T) ?? defaultValue as T;
  }
  
  /**
   * Set a specific service property
   * @param propertyName Property name
   * @param value Property value
   */
  setProperty(propertyName: string, value: unknown): void {
    const properties = this.getValue<Record<string, unknown>>('properties', {});
    this.setValue('properties', { ...properties, [propertyName]: value });
  }
  
  /**
   * Add a child to this service
   * @param childName Child name
   */
  addChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    if (!children.includes(childName)) {
      this.setValue('children', [...children, childName]);
    }
  }
  
  /**
   * Remove a child from this service
   * @param childName Child name
   */
  removeChild(childName: string): void {
    const children = this.getValue<string[]>('children', []);
    this.setValue('children', children.filter(child => child !== childName));
  }
} 