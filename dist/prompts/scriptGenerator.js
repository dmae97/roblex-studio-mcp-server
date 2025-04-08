import { z } from 'zod';
import { logger } from '../utils/logger.js';
/**
 * Prompt for generating Roblex scripts with AI assistance
 */
export const scriptGenerator = {
    register: (server) => {
        server.prompt('generate-script', {
            // Input schema using Zod
            scriptType: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script to generate'),
            functionality: z.string().describe('Description of what the script should do'),
            includeComments: z.boolean().default(true).describe('Whether to include comments in the code'),
            complexity: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('Complexity level of the code'),
            targetAudience: z.enum(['Child', 'Teen', 'Adult']).default('Teen').describe('Target audience for the script')
        }, ({ scriptType, functionality, includeComments, complexity, targetAudience }) => {
            logger.info(`Generating ${scriptType} prompt for functionality: ${functionality}`);
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
            return {
                messages: [
                    {
                        role: 'system',
                        content: {
                            type: 'text',
                            text: systemMessage
                        }
                    },
                    {
                        role: 'user',
                        content: {
                            type: 'text',
                            text: `Please create a ${scriptType} for Roblex Studio that implements the following functionality: ${functionality}`
                        }
                    }
                ]
            };
        });
        logger.debug('Script generator prompt registered');
    }
};
//# sourceMappingURL=scriptGenerator.js.map