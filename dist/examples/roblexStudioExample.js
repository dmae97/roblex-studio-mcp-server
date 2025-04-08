"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRoblexStudioExample = void 0;
const index_js_1 = require("../models/index.js");
const logger_js_1 = require("../utils/logger.js");
/**
 * Example demonstrating Roblox Studio MCP usage
 */
function runRoblexStudioExample() {
    logger_js_1.logger.info('Starting Roblox Studio MCP example');
    // Create a simulated connection
    const connectionId = `sim_${Date.now()}`;
    const adapter = (0, index_js_1.roblexStudioAdapterFactory)(connectionId);
    adapter.connect();
    // Create sample Roblox Studio script
    const playerScript = (0, index_js_1.createRoblexStudioScriptMcp)('PlayerController', 'LocalScript', `-- Player controller script
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local player = Players.LocalPlayer
local character = player.Character or player.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")

local SPEED = 16
local JUMP_POWER = 50

-- Movement handling
local function handleMovement(actionName, inputState, inputObject)
    if inputState == Enum.UserInputState.Begin then
        if actionName == "Forward" then
            humanoid:Move(Vector3.new(0, 0, -1) * SPEED)
        elseif actionName == "Backward" then
            humanoid:Move(Vector3.new(0, 0, 1) * SPEED)
        elseif actionName == "Left" then
            humanoid:Move(Vector3.new(-1, 0, 0) * SPEED)
        elseif actionName == "Right" then
            humanoid:Move(Vector3.new(1, 0, 0) * SPEED)
        elseif actionName == "Jump" then
            humanoid.JumpPower = JUMP_POWER
            humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
        end
    end
end

-- Setup input bindings
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    
    if input.KeyCode == Enum.KeyCode.W then
        handleMovement("Forward", Enum.UserInputState.Begin, input)
    elseif input.KeyCode == Enum.KeyCode.S then
        handleMovement("Backward", Enum.UserInputState.Begin, input)
    elseif input.KeyCode == Enum.KeyCode.A then
        handleMovement("Left", Enum.UserInputState.Begin, input)
    elseif input.KeyCode == Enum.KeyCode.D then
        handleMovement("Right", Enum.UserInputState.Begin, input)
    elseif input.KeyCode == Enum.KeyCode.Space then
        handleMovement("Jump", Enum.UserInputState.Begin, input)
    end
end)

print("Player controller initialized")`, 'StarterPlayerScripts');
    // Create a game UI element
    const healthBar = (0, index_js_1.createRoblexStudioUIMcp)('HealthBar', 'Frame', {
        size: { x: 200, y: 20 },
        position: { x: 10, y: 10 },
        backgroundColor: { r: 0.8, g: 0.1, b: 0.1 },
        parent: 'StarterGui'
    });
    // Create a server-side service
    const gameService = (0, index_js_1.createRoblexStudioServiceMcp)('GameManager', {
        properties: {
            gameState: 'Lobby',
            maxPlayers: 10,
            roundTime: 300,
            maps: ['Forest', 'Desert', 'City']
        },
        children: []
    });
    // Register the models with the global context
    index_js_1.globalContext.registerModel(playerScript.model);
    index_js_1.globalContext.registerModel(healthBar.model);
    index_js_1.globalContext.registerModel(gameService.model);
    // Register some handlers for Roblox Studio messages
    adapter.protocol.registerHandler('studio:saveScript', async (data) => {
        const { scriptName, source } = data;
        logger_js_1.logger.info(`Saving script: ${scriptName}`);
        const scriptModel = index_js_1.globalContext.getModel(`Script_${scriptName}`);
        if (scriptModel) {
            // Cast to any since we're not checking if it's specifically a RoblexStudioScriptModel
            scriptModel.setSource(source);
            return { success: true, scriptName };
        }
        return { success: false, error: `Script ${scriptName} not found` };
    });
    adapter.protocol.registerHandler('studio:updateUIElement', async (data) => {
        const { uiName, properties } = data;
        logger_js_1.logger.info(`Updating UI element: ${uiName}`);
        const uiModel = index_js_1.globalContext.getModel(`UI_${uiName}`);
        if (uiModel) {
            // Update the UI element properties
            Object.entries(properties).forEach(([key, value]) => {
                uiModel.setProperty(key, value);
            });
            return { success: true, uiName, state: uiModel.state };
        }
        return { success: false, error: `UI element ${uiName} not found` };
    });
    // Simulate some studio interactions
    simulateStudioActivity(adapter, playerScript, healthBar, gameService);
}
exports.runRoblexStudioExample = runRoblexStudioExample;
/**
 * Simulate Roblox Studio activity
 * @param adapter Roblox Studio adapter
 * @param playerScript Player script MCP
 * @param healthBar Health bar UI MCP
 * @param gameService Game service MCP
 */
async function simulateStudioActivity(adapter, playerScript, healthBar, gameService) {
    logger_js_1.logger.info('Simulating Roblox Studio activity...');
    // Simulate getting all models
    const modelsResult = await adapter.handleMessage('studio:getModels', {});
    logger_js_1.logger.info(`Studio models count: ${modelsResult.models.length}`);
    // Simulate updating a script
    const scriptUpdateResult = await adapter.handleMessage('studio:saveScript', {
        scriptName: 'PlayerController',
        source: playerScript.model.getSource() + '\n\n-- Updated with additional comment'
    });
    logger_js_1.logger.info(`Script update result: ${JSON.stringify(scriptUpdateResult)}`);
    // Simulate updating UI properties
    const uiUpdateResult = await adapter.handleMessage('studio:updateUIElement', {
        uiName: 'HealthBar',
        properties: {
            backgroundColor: { r: 0.2, g: 0.8, b: 0.2 } // Change to green
        }
    });
    logger_js_1.logger.info(`UI update result: ${JSON.stringify(uiUpdateResult)}`);
    // Simulate creating a workspace object
    const workspaceResult = await adapter.handleMessage('studio:createWorkspaceObject', {
        className: 'Part',
        name: 'Platform',
        properties: {
            position: { x: 0, y: 10, z: 0 },
            size: { x: 10, y: 1, z: 10 },
            anchored: true,
            color: { r: 0.5, g: 0.5, b: 0.5 }
        }
    });
    logger_js_1.logger.info(`Workspace object creation result: ${JSON.stringify(workspaceResult)}`);
    // Get final state
    const stateResult = await adapter.handleMessage('studio:getState', {});
    logger_js_1.logger.info(`Global state has ${Object.keys(stateResult.state).length} models`);
    // Disconnect the adapter
    adapter.disconnect();
    logger_js_1.logger.info('Roblox Studio MCP example completed');
}
//# sourceMappingURL=roblexStudioExample.js.map