import { PromptRegistry } from '../server/McpHelpers.js';
import { scriptGenerator } from './scriptGenerator.js';
import { bugFinder } from './bugFinder.js';
import { logger } from '../utils/logger.js';
// Create a new prompt registry
const promptRegistry = new PromptRegistry();
// 간소화된 등록
if (scriptGenerator && typeof scriptGenerator.register === 'function') {
    try {
        promptRegistry.add('scriptGenerator', scriptGenerator);
    }
    catch (error) {
        logger.warn('Failed to register scriptGenerator', { error: String(error) });
    }
}
if (bugFinder && typeof bugFinder.register === 'function') {
    try {
        promptRegistry.add('bugFinder', bugFinder);
    }
    catch (error) {
        logger.warn('Failed to register bugFinder', { error: String(error) });
    }
}
/**
 * Registry for all Roblex Studio prompts
 */
export const roblexPrompts = {
    register: (server) => {
        logger.info('Registering Roblex Studio prompts...');
        // Register all prompts from the registry
        promptRegistry.register(server);
        logger.info('Roblex Studio prompts registered successfully');
    }
};
//# sourceMappingURL=index.js.map