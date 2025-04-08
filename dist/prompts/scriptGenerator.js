"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptGenerator = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
// Define Zod schema separately for clarity and validation
const scriptGeneratorSchema = zod_1.z.object({
    scriptType: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script to generate'),
    functionality: zod_1.z.string().describe('Description of what the script should do'),
    includeComments: zod_1.z.boolean().default(true).describe('Whether to include comments in the code'),
    complexity: zod_1.z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Complexity level of the code'),
    targetAudience: zod_1.z.enum(['Child', 'Teen', 'Adult']).default('Teen').describe('Target audience for the script')
});
/**
 * Prompt for generating Roblex scripts with AI assistance
 */
exports.scriptGenerator = {
    register: (server) => {
        server.prompt('generate-script', // Prompt name
        'Generate a Roblex script based on requirements', // Prompt description
        // Omit definition object, validate manually in callback
        (extra) => {
            let params;
            try {
                // Manually parse and validate parameters
                const rawParams = extra?.parameters ?? extra;
                params = scriptGeneratorSchema.parse(rawParams);
            }
            catch (error) {
                logger_js_1.logger.error('Invalid parameters received for generate-script prompt', { error, received: extra });
                return {
                    messages: [
                        {
                            role: 'assistant',
                            content: { type: 'text', text: 'Error: Invalid parameters received for script generator.' }
                        }
                    ]
                };
            }
            const { scriptType, functionality, includeComments, complexity, targetAudience } = params; // Destructure from validated params
            logger_js_1.logger.info(`Generating ${scriptType} prompt for functionality: ${functionality}`);
            // Build system message based on parameters
            let systemMessage = `You are an expert Roblex Studio developer specializing in creating ${scriptType} scripts. `;
            // Add complexity guidance
            if (complexity === 'Beginner') {
                systemMessage += 'Use simple code patterns, avoid complex structures, and focus on readability over optimization. ';
                systemMessage += 'Use basic Roblex APIs and avoid advanced techniques. ';
            }
            else if (complexity === 'Intermediate') {
                systemMessage += 'Use moderately complex code patterns with some optimization where appropriate. ';
                systemMessage += 'Use a mix of basic and advanced Roblex APIs. ';
            }
            else if (complexity === 'Advanced') {
                systemMessage += 'Use sophisticated code patterns, optimization techniques, and best practices. ';
                systemMessage += 'Use advanced Roblex APIs and demonstrate expert-level techniques. ';
            }
            // Add comment guidance
            if (includeComments) {
                systemMessage += 'Include detailed comments explaining the purpose and functionality of the code. ';
                systemMessage += 'Add comments for each major section and explain complex logic. ';
            }
            else {
                systemMessage += 'Keep comments minimal, focusing on essential information only. ';
            }
            // Add audience-specific guidance
            if (targetAudience === 'Child') {
                systemMessage += 'Write code that is safe and appropriate for children. Avoid any violent or mature themes. ';
                systemMessage += 'Use simple, educational examples and friendly language. ';
            }
            else if (targetAudience === 'Teen') {
                systemMessage += 'Write code that is appropriate for teenagers. Moderate content avoiding excessive violence or mature themes. ';
                systemMessage += 'Use examples relevant to teenage interests and learning. ';
            }
            else if (targetAudience === 'Adult') {
                systemMessage += 'Write code that is appropriate for adults. Professional examples are suitable. ';
                systemMessage += 'You can include more complex game mechanics, but still avoid explicit content. ';
            }
            // Specific guidance for script types
            if (scriptType === 'ServerScript') {
                systemMessage += 'This script will run on the server, so focus on server-side considerations like data persistence, ';
                systemMessage += 'security, and managing game state. Remember that server scripts have access to ServerStorage and can use ';
                systemMessage += 'server-only APIs. Do not include client-specific code in this script. ';
            }
            else if (scriptType === 'LocalScript') {
                systemMessage += 'This script will run on the client, so focus on client-side considerations like user interface, ';
                systemMessage += 'input handling, and local effects. Remember that local scripts have access to the LocalPlayer and PlayerGui ';
                systemMessage += 'but cannot directly modify game state without communicating with the server. ';
            }
            else if (scriptType === 'ModuleScript') {
                systemMessage += 'This script will be a reusable module, so create a well-structured module that returns functions or objects. ';
                systemMessage += 'Focus on encapsulation, clean interfaces, and reusability. Remember to return the module table at the end. ';
            }
            // Combine system message and user prompt into a single user message
            const userPromptText = `System Instructions:
${systemMessage}

User Request:
Please create a ${scriptType} for Roblex Studio that implements the following functionality: ${functionality}`;
            return {
                messages: [
                    // Remove the message with role: 'system'
                    // {
                    //   role: 'system',
                    //   content: {
                    //     type: 'text',
                    //     text: systemMessage
                    //   }
                    // },
                    {
                        role: 'user', // Only return user/assistant messages
                        content: {
                            type: 'text',
                            text: userPromptText // Combine instructions and request here
                        }
                    }
                ]
            };
        });
        logger_js_1.logger.debug('Script generator prompt registered');
    }
};
//# sourceMappingURL=scriptGenerator.js.map