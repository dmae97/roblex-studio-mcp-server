import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

/**
 * Prompt for finding bugs and suggesting improvements in Roblex scripts
 */
export const bugFinder = {
  register: (server: McpServer) => {
    server.prompt(
      'find-bugs',
      {
        // Input schema using Zod
        scriptContent: z.string().describe('The Lua script content to analyze'),
        scriptType: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script'),
        checkPerformance: z.boolean().default(true).describe('Whether to check for performance issues'),
        checkSecurity: z.boolean().default(true).describe('Whether to check for security issues'),
        suggestImprovements: z.boolean().default(true).describe('Whether to suggest improvements')
      },
      ({ scriptContent, scriptType, checkPerformance, checkSecurity, suggestImprovements }) => {
        logger.info(`Generating bug finder prompt for ${scriptType} (${scriptContent.length} characters)`);
        
        // Build system message based on parameters
        let systemMessage = `You are an expert Roblex Studio developer specializing in code review and debugging. `;
        systemMessage += `Your task is to identify issues and potential bugs in the provided ${scriptType}. `;
        
        // Add specific guidance for script types
        if (scriptType === 'ServerScript') {
          systemMessage += 'Focus on server-side concerns like security, data persistence, and game state management. ';
          systemMessage += 'Watch for potential exploits that could be used by clients to manipulate game state. ';
          systemMessage += 'Check for proper error handling and validation of client inputs. ';
        } else if (scriptType === 'LocalScript') {
          systemMessage += 'Focus on client-side concerns like UI responsiveness, input handling, and client performance. ';
          systemMessage += 'Watch for unnecessary network calls and client-side lag sources. ';
          systemMessage += 'Check for proper handling of loading states and disconnections. ';
        } else if (scriptType === 'ModuleScript') {
          systemMessage += 'Focus on module structure, reusability, and API design. ';
          systemMessage += 'Watch for proper encapsulation, clear interfaces, and module returns. ';
          systemMessage += 'Check for potential memory leaks and cleanup routines. ';
        }
        
        // Add performance check guidance
        if (checkPerformance) {
          systemMessage += 'Analyze the code for performance issues such as: ';
          systemMessage += 'Inefficient loops, excessive memory usage, string concatenation in loops, ';
          systemMessage += 'excessive use of table.insert instead of direct indexing, excessive event connections, ';
          systemMessage += 'and unnecessary calculations. ';
        }
        
        // Add security check guidance
        if (checkSecurity) {
          systemMessage += 'Identify security vulnerabilities such as: ';
          systemMessage += 'Insecure remote events without validation, trusting client data without verification, ';
          systemMessage += 'giving clients access to sensitive data or functionality, and not sanitizing user inputs. ';
        }
        
        // Add improvement guidance
        if (suggestImprovements) {
          systemMessage += 'Suggest improvements to the code, including: ';
          systemMessage += 'Better code organization, more readable variable names, adopting best practices, ';
          systemMessage += 'better error handling, more efficient algorithms, and design pattern implementations. ';
        }
        
        systemMessage += `
Format your response in the following sections:
1. Summary of Issues - A brief overview of the main problems found
2. Critical Bugs - Issues that will cause errors or break functionality
3. Logic Issues - Problems with the code's logic or algorithm${checkPerformance ? `
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
                text: `Please analyze this ${scriptType} for bugs and issues:\n\n\`\`\`lua\n${scriptContent}\n\`\`\``
              }
            }
          ]
        };
      }
    );
    
    logger.debug('Bug finder prompt registered');
  }
};
