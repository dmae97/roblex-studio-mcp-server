import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { NotFoundError, DatastoreError } from '../../utils/errorHandler';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { z } from 'zod';
import { logger } from '../../utils/logger';

// Define the structure of a row in the datastore
interface DatastoreRow {
  key: string;
  value: string; // Store values as JSON strings
}

// Initialize SQLite database connection at the module level
// Use :memory: for simplicity, replace with a file path for persistence
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    logger.error('Error opening SQLite database:', { error: err });
    process.exit(1);
  } else {
    logger.info('SQLite database connected successfully.');
    // Create the datastore table if it doesn't exist
    db.run(
      'CREATE TABLE IF NOT EXISTS datastore (key TEXT PRIMARY KEY, value TEXT)',
      (createErr) => {
        if (createErr) {
          logger.error('Error creating datastore table:', { error: createErr });
        } else {
          logger.info('Datastore table checked/created.');
        }
      }
    );
  }
});

// Promisify db methods *after* db initialization
const dbAll: (sql: string, ...params: any[]) => Promise<DatastoreRow[]> = promisify(db.all.bind(db));
const dbGet: (sql: string, ...params: any[]) => Promise<DatastoreRow | undefined> = promisify(db.get.bind(db));

// Custom promisify wrapper for db.run to handle its specific callback signature
const dbRun: (sql: string, ...params: any[]) => Promise<sqlite3.Statement> = promisify(function (this: sqlite3.Database, sql: string, ...params: any[]) {
  const callback = params.pop(); // Get the callback injected by promisify
  this.run(sql, ...params, function (this: sqlite3.Statement, err: Error | null) { // Added types for `this` and `err`
    if (err) {
      callback(err, null);
    } else {
      callback(null, this); // Resolve with the statement object
    }
  });
}.bind(db));

// Define Zod schemas for tool parameters
const listKeysSchema = z.object({}); // Simplified for testing

const getValueSchema = z.object({
    key: z.string().describe('The key of the value to retrieve.'),
  });

const setValueSchema = z.object({
    key: z.string().describe('The key to store the value under.'),
    value: z.any().describe('The value to store (can be any JSON-serializable type).'),
  });

const deleteKeySchema = z.object({
    key: z.string().describe('The key to delete from the datastore.'),
  });

// Datastore Manager implementation
const datastoreManager = {
  // Registration method to be called from tools/index.ts
  register: (server: McpServer) => {
    logger.info('Registering Datastore Manager tools...');

    // Register 'datastore-list-keys' tool
    (server as any).tool(
      'datastore-list-keys',
      listKeysSchema.shape, // Pass the shape object
      async (params: z.infer<typeof listKeysSchema>) => {
        try {
          logger.info('Listing datastore keys', { params });
          // Call promisified dbAll correctly
          const rows = await dbAll('SELECT key FROM datastore');
          const keys = rows.map((row) => row.key);
          return {
            content: [{ type: 'text', text: JSON.stringify(keys, null, 2) }],
          };
        } catch (error: any) {
          logger.error('Error listing datastore keys', { error: error.message });
          throw new DatastoreError('Failed to list keys from datastore.');
        }
      }
    );

    // Register 'datastore-get-value' tool
    (server as any).tool(
      'datastore-get-value',
      getValueSchema.shape, // Pass the shape object
      async ({ key }: z.infer<typeof getValueSchema>) => {
        try {
          logger.info('Getting datastore value', { key });
          // Call promisified dbGet correctly
          const row = await dbGet('SELECT value FROM datastore WHERE key = ?', key);

          if (row?.value) {
            let value: any;
            try {
              value = JSON.parse(row.value);
              return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }] };
            } catch (parseError: any) {
              logger.warn('Value is not JSON, returning as raw string', { key, value: row.value });
              return { content: [{ type: 'text', text: row.value }] }; // Return raw string if not JSON
            }
          } else {
            throw new NotFoundError(`Key '${key}' not found in datastore.`);
          }
        } catch (error: any) {
          logger.error('Error getting datastore value', { key, error: error.message });
          if (error instanceof NotFoundError) throw error;
          throw new DatastoreError(`Failed to get value for key: ${key}.`);
        }
      }
    );

    // Register 'datastore-set-value' tool
    (server as any).tool(
      'datastore-set-value',
      setValueSchema.shape, // Pass the shape object
      async ({ key, value }: z.infer<typeof setValueSchema>) => {
        try {
          logger.info('Setting datastore value', { key });
          const jsonValue = JSON.stringify(value);
          // Call promisified dbRun correctly
          await dbRun('INSERT OR REPLACE INTO datastore (key, value) VALUES (?, ?)', key, jsonValue);
          return { content: [{ type: 'text', text: `Successfully set value for key: ${key}` }] };
        } catch (error: any) {
          logger.error('Error setting datastore value', { key, error: error.message });
          throw new DatastoreError(`Failed to set value for key: ${key}.`);
        }
      }
    );

    // Register 'datastore-delete-key' tool
    (server as any).tool(
      'datastore-delete-key',
      deleteKeySchema.shape, // Pass the shape object
      async ({ key }: z.infer<typeof deleteKeySchema>) => {
        try {
          logger.info('Deleting datastore key', { key });
          // Call promisified dbRun correctly
          await dbRun('DELETE FROM datastore WHERE key = ?', key);
          return { content: [{ type: 'text', text: `Successfully deleted key: ${key}` }] };
        } catch (error: any) {
          logger.error('Error deleting datastore key', { key, error: error.message });
          throw new DatastoreError(`Failed to delete key: ${key}.`);
        }
      }
    );

    logger.info('Datastore Manager tools registered.');
  },
};

export default datastoreManager;
