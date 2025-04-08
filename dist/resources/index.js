import { ResourceRegistry } from '../server/McpHelpers.js';
import { documentation } from './documentation.js';
import { templates } from './templates.js';
import { logger } from '../utils/logger.js';
// Create a new resource registry
const resourceRegistry = new ResourceRegistry();
// 간소화된 등록
if (documentation && typeof documentation.register === 'function') {
    try {
        resourceRegistry.add('documentation', documentation);
    }
    catch (error) {
        logger.warn('Failed to register documentation', { error: String(error) });
    }
}
if (templates && typeof templates.register === 'function') {
    try {
        resourceRegistry.add('templates', templates);
    }
    catch (error) {
        logger.warn('Failed to register templates', { error: String(error) });
    }
}
/**
 * Registry for all Roblex Studio resources
 */
export const roblexResources = {
    register: (server) => {
        logger.info('Registering Roblex Studio resources...');
        // Register all resources from the registry
        resourceRegistry.register(server);
        logger.info('Roblex Studio resources registered successfully');
    }
};
//# sourceMappingURL=index.js.map