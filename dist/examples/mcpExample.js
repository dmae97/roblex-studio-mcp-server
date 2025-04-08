"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMcpExample = void 0;
const index_js_1 = require("../models/index.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Example demonstrating usage of the MCP pattern
 */
function runMcpExample() {
    logger_js_1.logger.info('Starting MCP example');
    // Create a player model
    const playerMcp = (0, index_js_1.createGameObjectMcp)('MainPlayer', 'player', {
        health: 100,
        maxHealth: 100,
        speed: 16,
        inventory: [],
        position: { x: 0, y: 5, z: 0 }
    });
    // Create a UI component for the player's health bar
    const healthBarMcp = (0, index_js_1.createUiComponentMcp)('HealthBar', 'progressBar', {
        value: 100,
        maxValue: 100,
        color: '#ff0000',
        size: { width: 200, height: 20 },
        position: { x: 10, y: 10 }
    });
    // Create a simple game world model
    const worldMcp = (0, index_js_1.createMcp)('GameWorld', {
        time: 0,
        weather: 'sunny',
        gravity: 196.2,
        bounds: { min: { x: -1000, y: -1000, z: -1000 }, max: { x: 1000, y: 1000, z: 1000 } }
    });
    // Register models with the global context
    index_js_1.globalContext.registerModel(playerMcp.model);
    index_js_1.globalContext.registerModel(healthBarMcp.model);
    index_js_1.globalContext.registerModel(worldMcp.model);
    // Set up event handlers
    playerMcp.model.onChange(change => {
        logger_js_1.logger.debug(`Player change: ${change.key} = ${JSON.stringify(change.newValue)}`);
        // Sync health bar with player health
        if (change.key === 'health') {
            healthBarMcp.model.setValue('value', change.newValue);
        }
    });
    healthBarMcp.model.onChange(change => {
        logger_js_1.logger.debug(`Health bar change: ${change.key} = ${JSON.stringify(change.newValue)}`);
    });
    worldMcp.model.onChange(change => {
        logger_js_1.logger.debug(`World change: ${change.key} = ${JSON.stringify(change.newValue)}`);
    });
    // Set up protocol handlers
    playerMcp.protocol.registerHandler('move', async (data) => {
        const { x, y, z } = data;
        playerMcp.model.setValue('position', { x, y, z });
        return { success: true, newPosition: { x, y, z } };
    });
    playerMcp.protocol.registerHandler('damage', async (data) => {
        const { amount } = data;
        const currentHealth = playerMcp.model.getValue('health');
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
    index_js_1.globalProtocol.registerHandler('ping', async () => {
        return { pong: true, timestamp: Date.now() };
    });
    index_js_1.globalProtocol.registerHandler('getState', async () => {
        return index_js_1.globalContext.getState();
    });
    // Example usage
    simulateGameActivity(playerMcp, worldMcp);
}
exports.runMcpExample = runMcpExample;
/**
 * Simulate some game activity
 * @param playerMcp Player MCP components
 * @param worldMcp World MCP components
 */
async function simulateGameActivity(playerMcp, worldMcp) {
    logger_js_1.logger.info('Simulating game activity...');
    // Move the player
    const moveResult = await playerMcp.protocol.processMessage('move', { x: 10, y: 5, z: 15 });
    logger_js_1.logger.info(`Move result: ${JSON.stringify(moveResult)}`);
    // Damage the player
    const damageResult = await playerMcp.protocol.processMessage('damage', { amount: 25 });
    logger_js_1.logger.info(`Damage result: ${JSON.stringify(damageResult)}`);
    // Update world time
    const timeResult = await worldMcp.protocol.processMessage('setTime', { time: 12 });
    logger_js_1.logger.info(`Time change result: ${JSON.stringify(timeResult)}`);
    // Get global state
    const stateResult = await index_js_1.globalProtocol.processMessage('getState', {});
    logger_js_1.logger.info(`Global state: ${JSON.stringify(stateResult)}`);
    logger_js_1.logger.info('MCP example completed');
}
//# sourceMappingURL=mcpExample.js.map