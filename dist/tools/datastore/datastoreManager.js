"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../utils/errorHandler");
const sqlite3_1 = __importDefault(require("sqlite3"));
const util_1 = require("util");
const zod_1 = require("zod");
const logger_1 = require("../../utils/logger");
// Initialize SQLite database connection at the module level
// Use :memory: for simplicity, replace with a file path for persistence
const db = new sqlite3_1.default.Database(':memory:', (err) => {
    if (err) {
        logger_1.logger.error('Error opening SQLite database:', { error: err });
        process.exit(1);
    }
    else {
        logger_1.logger.info('SQLite database connected successfully.');
        // Create the datastore table if it doesn't exist
        db.run('CREATE TABLE IF NOT EXISTS datastore (key TEXT PRIMARY KEY, value TEXT)', (createErr) => {
            if (createErr) {
                logger_1.logger.error('Error creating datastore table:', { error: createErr });
            }
            else {
                logger_1.logger.info('Datastore table checked/created.');
            }
        });
    }
});
// Promisify db methods *after* db initialization
const dbAll = (0, util_1.promisify)(db.all.bind(db));
const dbGet = (0, util_1.promisify)(db.get.bind(db));
// Custom promisify wrapper for db.run to handle its specific callback signature
const dbRun = (0, util_1.promisify)(function (sql, ...params) {
    const callback = params.pop(); // Get the callback injected by promisify
    this.run(sql, ...params, function (err) {
        if (err) {
            callback(err, null);
        }
        else {
            callback(null, this); // Resolve with the statement object
        }
    });
}.bind(db));
// Define Zod schemas for tool parameters
const listKeysSchema = zod_1.z.object({}); // Simplified for testing
const getValueSchema = zod_1.z.object({
    key: zod_1.z.string().describe('The key of the value to retrieve.'),
});
const setValueSchema = zod_1.z.object({
    key: zod_1.z.string().describe('The key to store the value under.'),
    value: zod_1.z.any().describe('The value to store (can be any JSON-serializable type).'),
});
const deleteKeySchema = zod_1.z.object({
    key: zod_1.z.string().describe('The key to delete from the datastore.'),
});
// Datastore Manager implementation
const datastoreManager = {
    // Registration method to be called from tools/index.ts
    register: (server) => {
        logger_1.logger.info('Registering Datastore Manager tools...');
        // Register 'datastore-list-keys' tool
        server.tool('datastore-list-keys', listKeysSchema.shape, // Pass the shape object
        async (params) => {
            try {
                logger_1.logger.info('Listing datastore keys', { params });
                // Call promisified dbAll correctly
                const rows = await dbAll('SELECT key FROM datastore');
                const keys = rows.map((row) => row.key);
                return {
                    content: [{ type: 'text', text: JSON.stringify(keys, null, 2) }],
                };
            }
            catch (error) {
                logger_1.logger.error('Error listing datastore keys', { error: error.message });
                throw new errorHandler_1.DatastoreError('Failed to list keys from datastore.');
            }
        });
        // Register 'datastore-get-value' tool
        server.tool('datastore-get-value', getValueSchema.shape, // Pass the shape object
        async ({ key }) => {
            try {
                logger_1.logger.info('Getting datastore value', { key });
                // Call promisified dbGet correctly
                const row = await dbGet('SELECT value FROM datastore WHERE key = ?', key);
                if (row?.value) {
                    let value;
                    try {
                        value = JSON.parse(row.value);
                        return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
                    }
                    catch (parseError) {
                        logger_1.logger.warn('Value is not JSON, returning as raw string', { key, value: row.value });
                        return { content: [{ type: 'text', text: row.value }] }; // Return raw string if not JSON
                    }
                }
                else {
                    throw new errorHandler_1.NotFoundError(`Key '${key}' not found in datastore.`);
                }
            }
            catch (error) {
                logger_1.logger.error('Error getting datastore value', { key, error: error.message });
                if (error instanceof errorHandler_1.NotFoundError)
                    throw error;
                throw new errorHandler_1.DatastoreError(`Failed to get value for key: ${key}.`);
            }
        });
        // Register 'datastore-set-value' tool
        server.tool('datastore-set-value', setValueSchema.shape, // Pass the shape object
        async ({ key, value }) => {
            try {
                logger_1.logger.info('Setting datastore value', { key });
                const jsonValue = JSON.stringify(value);
                // Call promisified dbRun correctly
                await dbRun('INSERT OR REPLACE INTO datastore (key, value) VALUES (?, ?)', key, jsonValue);
                return { content: [{ type: 'text', text: `Successfully set value for key: ${key}` }] };
            }
            catch (error) {
                logger_1.logger.error('Error setting datastore value', { key, error: error.message });
                throw new errorHandler_1.DatastoreError(`Failed to set value for key: ${key}.`);
            }
        });
        // Register 'datastore-delete-key' tool
        server.tool('datastore-delete-key', deleteKeySchema.shape, // Pass the shape object
        async ({ key }) => {
            try {
                logger_1.logger.info('Deleting datastore key', { key });
                // Call promisified dbRun correctly
                await dbRun('DELETE FROM datastore WHERE key = ?', key);
                return { content: [{ type: 'text', text: `Successfully deleted key: ${key}` }] };
            }
            catch (error) {
                logger_1.logger.error('Error deleting datastore key', { key, error: error.message });
                throw new errorHandler_1.DatastoreError(`Failed to delete key: ${key}.`);
            }
        });
        logger_1.logger.info('Datastore Manager tools registered.');
    },
};
exports.default = datastoreManager;
//# sourceMappingURL=datastoreManager.js.map