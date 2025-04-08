import { z } from 'zod';
import { logger } from '../utils/logger.js';
/**
 * Tool for validating Roblex scripts for syntax errors and best practices
 */
export const scriptValidator = {
    register: (server) => {
        server.tool('validate-roblex-script', {
            // Input schema using Zod
            scriptContent: z.string().describe('The Lua script content to validate'),
            scriptType: z.enum(['ServerScript', 'LocalScript', 'ModuleScript']).describe('Type of script'),
            checkBestPractices: z.boolean().default(true).describe('Whether to check for best practices'),
            checkPerformance: z.boolean().default(false).describe('Whether to check for performance issues')
        }, async ({ scriptContent, scriptType, checkBestPractices, checkPerformance }) => {
            logger.info(`Validating ${scriptType} (${scriptContent.length} characters)`);
            try {
                // In a real implementation, this would use a Lua parser or linter
                // Here we'll do some basic validation with regex
                const issues = [];
                // Basic syntax checks
                if (!scriptContent.trim()) {
                    issues.push({
                        type: 'error',
                        message: 'Script content is empty',
                        line: 0,
                        column: 0
                    });
                }
                // Check for unbalanced parentheses
                const openParens = (scriptContent.match(/\(/g) || []).length;
                const closeParens = (scriptContent.match(/\)/g) || []).length;
                if (openParens !== closeParens) {
                    issues.push({
                        type: 'error',
                        message: 'Unbalanced parentheses',
                        line: -1,
                        column: -1
                    });
                }
                // Module script specific check
                if (scriptType === 'ModuleScript' && !scriptContent.includes('return')) {
                    issues.push({
                        type: 'error',
                        message: 'ModuleScript must return something',
                        line: -1,
                        column: -1
                    });
                }
                // Best practices checks (if enabled)
                if (checkBestPractices) {
                    // Check for global variables (not recommended)
                    const lines = scriptContent.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        // Simple check for assignments without local keyword
                        if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(line) && !line.includes('local') && !line.includes('.')) {
                            issues.push({
                                type: 'warning',
                                message: 'Avoid using global variables',
                                line: i + 1,
                                column: 1
                            });
                        }
                    }
                    // Check for print statements (usually not in production)
                    if (scriptContent.includes('print(')) {
                        issues.push({
                            type: 'info',
                            message: 'Consider removing print statements in production code',
                            line: -1,
                            column: -1
                        });
                    }
                }
                // Performance checks (if enabled)
                if (checkPerformance) {
                    // Check for loops that create tables
                    if (scriptContent.match(/for.*do.*\{/)) {
                        issues.push({
                            type: 'warning',
                            message: 'Creating tables inside loops may cause performance issues',
                            line: -1,
                            column: -1
                        });
                    }
                    // Check for string concatenation in loops (could use table.concat)
                    if (scriptContent.match(/for.*do.*\.\./) || scriptContent.match(/while.*do.*\.\./)) {
                        issues.push({
                            type: 'warning',
                            message: 'String concatenation in loops may cause performance issues, consider using table.concat',
                            line: -1,
                            column: -1
                        });
                    }
                }
                // Prepare validation result
                const validationResult = {
                    valid: issues.filter(issue => issue.type === 'error').length === 0,
                    issues: issues,
                    scriptType: scriptType,
                    summary: issues.length === 0
                        ? 'No issues found! Script looks good.'
                        : `Found ${issues.length} issue${issues.length === 1 ? '' : 's'} (${issues.filter(i => i.type === 'error').length} errors, ${issues.filter(i => i.type === 'warning').length} warnings, ${issues.filter(i => i.type === 'info').length} info)`
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(validationResult, null, 2)
                        }
                    ]
                };
            }
            catch (error) {
                logger.error('Error validating script:', error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error validating script: ${error instanceof Error ? error.message : String(error)}`
                        }
                    ],
                    isError: true
                };
            }
        });
        logger.debug('Script validator tool registered');
    }
};
//# sourceMappingURL=scriptValidator.js.map