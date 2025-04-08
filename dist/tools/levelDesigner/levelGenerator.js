"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBestPractices = exports.generateSetupInstructions = exports.generateLevelCode = void 0;
const utils_js_1 = require("./utils.js");
// Level type specific generators
// import { generatePlatformerCode } from './levelTypes/platformer';
// import { generateMazeCode } from './levelTypes/maze';
// import { generateOpenWorldCode } from './levelTypes/openWorld';
// import { generateTowerDefenseCode } from './levelTypes/towerDefense';
// import { generateObstacleCourseCode } from './levelTypes/obstacleCourse';
// import { generateRacingCode } from './levelTypes/racing';
// import { generateCustomLevelCode } from './levelTypes/custom';
/**
 * Generates Lua code for level layout
 */
function generateLevelCode(params) {
    const { levelType, size, includePlayerSpawns, includeCheckpoints } = params;
    let code = `-- ${levelType.charAt(0).toUpperCase() + levelType.slice(1)} Level Generator
-- Generated by Roblex Studio MCP Server - Level Designer
-- Level size: ${size}, Type: ${levelType}

local function Create${(0, utils_js_1.capitalizeFirstLetter)(levelType)}Level()
    local level = Instance.new("Folder")
    level.Name = "${(0, utils_js_1.capitalizeFirstLetter)(levelType)}Level"
    level.Parent = workspace

    -- Set up basic structure
    local structure = Instance.new("Folder")
    structure.Name = "Structure"
    structure.Parent = level
`;
    // Add level specific code based on level type
    // switch (levelType) {
    //   case 'platformer':
    //     // code += generatePlatformerCode(size); // Not implemented
    //     break;
    //   case 'maze':
    //     // code += generateMazeCode(size); // Not implemented
    //     break;
    //   case 'open-world':
    //     // code += generateOpenWorldCode(size); // Not implemented
    //     break;
    //   case 'tower-defense':
    //     // code += generateTowerDefenseCode(size); // Not implemented
    //     break;
    //   case 'obstacle-course':
    //     // code += generateObstacleCourseCode(size); // Not implemented
    //     break;
    //   case 'racing':
    //     // code += generateRacingCode(size); // Not implemented
    //     break;
    //   default: // Assuming custom or unimplemented types fall here
    //     // code += generateCustomLevelCode(size); // Not implemented
    //     code += `\t-- Level type '${levelType}' generation logic is not implemented yet.\n`;
    // }
    code += `\t-- Placeholder for ${levelType} specific level elements --\n`;
    // Add player spawn points if requested
    if (includePlayerSpawns) {
        code += `
    -- Set up player spawn points
    local spawns = Instance.new("Folder")
    spawns.Name = "PlayerSpawns"
    spawns.Parent = level
    
    local spawn1 = Instance.new("SpawnLocation")
    spawn1.Name = "SpawnLocation1"
    spawn1.Parent = spawns
    spawn1.CFrame = CFrame.new(0, 10, 0)
    spawn1.Anchored = true
    spawn1.CanCollide = false
    spawn1.Transparency = 1
`;
    }
    // Add checkpoints if requested
    if (includeCheckpoints) {
        code += `
    -- Set up checkpoints
    local checkpoints = Instance.new("Folder")
    checkpoints.Name = "Checkpoints"
    checkpoints.Parent = level
    
    local checkpoint1 = Instance.new("Part")
    checkpoint1.Name = "Checkpoint1"
    checkpoint1.Parent = checkpoints
    checkpoint1.CFrame = CFrame.new(25, 5, 25)
    checkpoint1.Size = Vector3.new(10, 1, 10)
    checkpoint1.Anchored = true
    checkpoint1.CanCollide = false
    checkpoint1.Transparency = 0.5
    checkpoint1.BrickColor = BrickColor.new("Bright green")
`;
    }
    // Complete the function and add execution code
    code += `
    return level
end

-- Create the level
local newLevel = Create${(0, utils_js_1.capitalizeFirstLetter)(levelType)}Level()
`;
    return code;
}
exports.generateLevelCode = generateLevelCode;
/**
 * Generates setup instructions based on level parameters
 */
function generateSetupInstructions(params) {
    const { levelType, size } = params;
    return `
## ${(0, utils_js_1.capitalizeFirstLetter)(levelType)} Level Setup Instructions

1. Create a new ServerScript in ServerScriptService
2. Copy the provided code into the script
3. Run the game to generate the level
4. The level will be created as a Folder named "${(0, utils_js_1.capitalizeFirstLetter)(levelType)}Level" in Workspace
5. You can modify the generated level structure after creation
    *   (Placeholder for ${params.levelType} specific setup)

### Structure Overview:
- Main level folder contains all elements
- Structure subfolder contains terrain and level geometry
${params.includePlayerSpawns ? '- PlayerSpawns subfolder contains spawn locations\n' : ''}${params.includeCheckpoints ? '- Checkpoints subfolder contains checkpoint markers\n' : ''}
### Level Size: ${size}
This affects the overall scale of the generated level.
`;
}
exports.generateSetupInstructions = generateSetupInstructions;
/**
 * Generates best practices for the given level type
 */
function generateBestPractices(levelType) {
    let practices = `## ${(0, utils_js_1.capitalizeFirstLetter)(levelType)} Level Best Practices\n\n`;
    practices += `1. Test gameplay flow to ensure a good player experience.\n`;
    practices += `2. Balance difficulty progression throughout the level.\n`;
    practices += `3. Consider performance implications of complex geometry.\n`;
    practices += `4. Add visual guides to help players understand the level.\n`;
    practices += `5. Include checkpoints at appropriate intervals.\n`;
    practices += `6. Ensure the level follows the theme consistently.\n`;
    // Add level-type-specific best practices here
    // switch (levelType) {
    //   case 'platformer':
    //     practices += "- **Collision Fidelity:** Use appropriate collision fidelity for platforms to balance performance and accuracy.\n";
    //     practices += "- **Player Experience:** Ensure jump heights and distances feel natural.\n";
    //     break;
    //    // ... other cases
    //   default:
    //     practices += "- (Placeholder for specific best practices for this level type).\n";
    // }
    practices += `\n- (Placeholder for ${levelType} specific best practices)\n`;
    return practices;
}
exports.generateBestPractices = generateBestPractices;
//# sourceMappingURL=levelGenerator.js.map