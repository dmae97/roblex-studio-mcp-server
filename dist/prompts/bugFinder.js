"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bugFinder = void 0;
const zod_1 = require("zod");
const logger_js_1 = require("../utils/logger.js");
// Define Zod schema separately for validation inside the callback
const bugFinderSchema = zod_1.z.object({
    scriptContent: zod_1.z.string().describe('The Lua script content to analyze'),
    scriptType: zod_1.z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script'),
    checkPerformance: zod_1.z.boolean().default(true).describe('Whether to check for performance issues'),
    checkSecurity: zod_1.z.boolean().default(true).describe('Whether to check for security issues'),
    suggestImprovements: zod_1.z.boolean().default(true).describe('Whether to suggest improvements')
});
/**
 * Prompt for finding bugs and suggesting improvements in Roblex scripts
 */
exports.bugFinder = {
    register: (server) => {
        server.prompt('find-bugs', 'Find bugs and suggest improvements in a Roblex script', (extra) => {
            let params;
            try {
                const rawParams = extra?.parameters ?? extra;
                params = bugFinderSchema.parse(rawParams);
            }
            catch (error) {
                logger_js_1.logger.error('Invalid parameters received for find-bugs prompt', { error, received: extra });
                return {
                    messages: [
                        {
                            role: 'assistant',
                            content: { type: 'text', text: 'Error: Invalid parameters received for bug finder.' }
                        }
                    ]
                };
            }
            const { scriptContent, scriptType, checkPerformance, checkSecurity, suggestImprovements } = params;
            logger_js_1.logger.info(`Generating bug finder prompt for ${scriptType} (${scriptContent.length} characters)`);
            let systemMessage = `You are an expert Roblex Studio developer specializing in code review and debugging. `;
            systemMessage += `Your task is to identify issues and potential bugs in the provided ${scriptType}. `;
            if (scriptType === 'ServerScript') {
                systemMessage += 'Focus on server-side concerns like security, data persistence, and game state management. ';
                systemMessage += 'Watch for potential exploits that could be used by clients to manipulate game state. ';
                systemMessage += 'Check for proper error handling and validation of client inputs. ';
            }
            else if (scriptType === 'LocalScript') {
                systemMessage += 'Focus on client-side concerns like UI responsiveness, input handling, and client performance. ';
                systemMessage += 'Watch for unnecessary network calls and client-side lag sources. ';
                systemMessage += 'Check for proper handling of loading states and disconnections. ';
            }
            else if (scriptType === 'ModuleScript') {
                systemMessage += 'Focus on module structure, reusability, and API design. ';
                systemMessage += 'Watch for proper encapsulation, clear interfaces, and module returns. ';
                systemMessage += 'Check for potential memory leaks and cleanup routines. ';
            }
            if (checkPerformance) {
                systemMessage += 'Analyze the code for performance issues such as: ';
                systemMessage += 'Inefficient loops, excessive memory usage, string concatenation in loops, ';
                systemMessage += 'excessive use of table.insert instead of direct indexing, excessive event connections, ';
                systemMessage += 'and unnecessary calculations. ';
            }
            if (checkSecurity) {
                systemMessage += 'Identify security vulnerabilities such as: ';
                systemMessage += 'Insecure remote events without validation, trusting client data without verification, ';
                systemMessage += 'giving clients access to sensitive data or functionality, and not sanitizing user inputs. ';
            }
            if (suggestImprovements) {
                systemMessage += 'Suggest improvements to the code, including: ';
                systemMessage += 'Better code organization, more readable variable names, adopting best practices, ';
                systemMessage += 'better error handling, more efficient algorithms, and design pattern implementations. ';
            }
            systemMessage += `
Format your response in the following sections:
1. Summary of Issues - A brief overview of the main problems found
2. Critical Bugs - Issues that will cause errors or break functionality
3. Logic Issues - Problems with the code\'s logic or algorithm${checkPerformance ? `
4. Performance Issues - Inefficiencies and performance bottlenecks` : ''}${checkSecurity ? `
5. Security Concerns - Potential security vulnerabilities` : ''}${suggestImprovements ? `
6. Suggested Improvements - Ways to enhance the code beyond fixing bugs` : ''}
7. Fixed Code - Provide a corrected version of the code with your fixes

For each issue, include:
- Line number(s) where the issue occurs
- Description of the problem
- How it might affect the game/system
- How to fix it

In the Fixed Code section, include comments with // FIXED: descriptions where you made changes.
`;
            return {
                messages: [
                    {
                        role: 'assistant',
                        content: { type: 'text', text: systemMessage }
                    }
                ]
            };
        });
        logger_js_1.logger.debug('Bug finder prompt registered');
    }
};
//# sourceMappingURL=bugFinder.js.map