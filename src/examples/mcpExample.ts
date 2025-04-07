import { 
  createGameObjectMcp, 
  createMcp, 
  createUiComponentMcp,
  globalContext,
  globalProtocol
} from '../models/index.js';
import { logger } from '../utils/logger.js';

/**
 * Example demonstrating usage of the MCP pattern
 */
export function runMcpExample(): void {
  logger.info('Starting MCP example');
  
  // Create a player model
  const playerMcp = createGameObjectMcp('MainPlayer', 'player', {
    health: 100,
    maxHealth: 100,
    speed: 16,
    inventory: [],
    position: { x: 0, y: 5, z: 0 }
  });
  
  // Create a UI component for the player's health bar
  const healthBarMcp = createUiComponentMcp('HealthBar', 'progressBar', {
    value: 100,
    maxValue: 100,
    color: '#ff0000',
    size: { width: 200, height: 20 },
    position: { x: 10, y: 10 }
  });
  
  // Create a simple game world model
  const worldMcp = createMcp('GameWorld', {
    time: 0,
    weather: 'sunny',
    gravity: 196.2,
    bounds: { min: { x: -1000, y: -1000, z: -1000 }, max: { x: 1000, y: 1000, z: 1000 } }
  });
  
  // Register models with the global context
  globalContext.registerModel(playerMcp.model);
  globalContext.registerModel(healthBarMcp.model);
  globalContext.registerModel(worldMcp.model);
  
  // Set up event handlers
  playerMcp.model.onChange(change => {
    logger.debug(`Player change: ${change.key} = ${JSON.stringify(change.newValue)}`);
    
    // Sync health bar with player health
    if (change.key === 'health') {
      healthBarMcp.model.setValue('value', change.newValue);
    }
  });
  
  healthBarMcp.model.onChange(change => {
    logger.debug(`Health bar change: ${change.key} = ${JSON.stringify(change.newValue)}`);
  });
  
  worldMcp.model.onChange(change => {
    logger.debug(`World change: ${change.key} = ${JSON.stringify(change.newValue)}`);
  });
  
  // Set up protocol handlers
  playerMcp.protocol.registerHandler('move', async (data) => {
    const { x, y, z } = data;
    playerMcp.model.setValue('position', { x, y, z });
    return { success: true, newPosition: { x, y, z } };
  });
  
  playerMcp.protocol.registerHandler('damage', async (data) => {
    const { amount } = data;
    const currentHealth = playerMcp.model.getValue<number>('health');
    const newHealth = Math.max(0, currentHealth - amount);
    
    playerMcp.model.setValue('health', newHealth);
    
    return { 
      success: true, 
      health: newHealth, 
      alive: newHealth > 0 
    };
  });
  
  worldMcp.protocol.registerHandler('setTime', async (data) => {
    const { time } = data;
    worldMcp.model.setValue('time', time);
    return { success: true, newTime: time };
  });
  
  // Register global message handlers
  globalProtocol.registerHandler('ping', async () => {
    return { pong: true, timestamp: Date.now() };
  });
  
  globalProtocol.registerHandler('getState', async () => {
    return globalContext.getState();
  });
  
  // Example usage
  simulateGameActivity(playerMcp, worldMcp);
}

/**
 * Simulate some game activity
 * @param playerMcp Player MCP components
 * @param worldMcp World MCP components
 */
async function simulateGameActivity(playerMcp: any, worldMcp: any): Promise<void> {
  logger.info('Simulating game activity...');
  
  // Move the player
  const moveResult = await playerMcp.protocol.processMessage('move', { x: 10, y: 5, z: 15 });
  logger.info(`Move result: ${JSON.stringify(moveResult)}`);
  
  // Damage the player
  const damageResult = await playerMcp.protocol.processMessage('damage', { amount: 25 });
  logger.info(`Damage result: ${JSON.stringify(damageResult)}`);
  
  // Update world time
  const timeResult = await worldMcp.protocol.processMessage('setTime', { time: 12 });
  logger.info(`Time change result: ${JSON.stringify(timeResult)}`);
  
  // Get global state
  const stateResult = await globalProtocol.processMessage('getState', {});
  logger.info(`Global state: ${JSON.stringify(stateResult)}`);
  
  logger.info('MCP example completed');
} 