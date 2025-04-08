"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerator = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
/**
 * Tool for generating Roblex code/scripts based on user specifications
 */
exports.codeGenerator = {
    register: (server) => {
        server.tool('generate-roblex-code', {
            // Input schema using Zod
            scriptType: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']),
            functionality: zod_1.z.string().describe('Description of what the script should do'),
            includeComments: zod_1.z.boolean().default(true).describe('Whether to include comments in the code'),
            targetRoblexVersion: zod_1.z.string().optional().describe('Target Roblex version')
        }, async ({ scriptType, functionality, includeComments, targetRoblexVersion }) => {
            logger_js_1.logger.info(`Generating ${scriptType} for: ${functionality}`);
            try {
                // In a real implementation, this could use an LLM or other code generation service
                // For now, we'll return a template based on the script type
                let generatedCode = '';
                const timestamp = new Date().toISOString();
                const header = includeComments
                    ? `--[[\n  Generated ${scriptType}\n  Functionality: ${functionality}\n  Generated on: ${timestamp}\n  ${targetRoblexVersion ? `Target Version: ${targetRoblexVersion}` : ''}\n--]]\n\n`
                    : '';
                switch (scriptType) {
                    case 'ServerScript':
                        generatedCode = `${header}local ServerStorage = game:GetService("ServerStorage")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Main server functionality for: ${functionality}
local function initialize()
    print("Server script initialized")
    -- Add your server-side logic here
end

initialize()
`;
                        break;
                    case 'LocalScript':
                        generatedCode = `${header}local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local player = Players.LocalPlayer

-- Main client functionality for: ${functionality}
local function initialize()
    print("Local script initialized")
    -- Add your client-side logic here
end

initialize()
`;
                        break;
                    case 'ModuleScript':
                        generatedCode = `${header}local module = {}

-- Module functionality for: ${functionality}

function module.initialize()
    print("Module initialized")
    -- Add your module implementation here
    return true
end

function module.cleanup()
    -- Add cleanup logic here
    return true
end

return module
`;
                        break;
                }
                return {
                    content: [
                        {
                            type: 'text',
                            text: generatedCode
                        }
                    ]
                };
            }
            catch (error) {
                // Log only the error message for safety, consistent with the return block
                logger_js_1.logger.error(`Error generating code: ${error instanceof Error ? error.message : String(error)}`);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error generating code: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        logger_js_1.logger.debug('Code generator tool registered');
    }
};
//# sourceMappingURL=codeGenerator.js.map