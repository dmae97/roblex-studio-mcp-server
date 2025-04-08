"use strict";
/**
 * Example of using WebSocket synchronization for real-time model updates
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const uuid_1 = require("uuid");
const readline_1 = __importDefault(require("readline"));
// Configuration
const WS_URL = 'ws://localhost:3000/sync';
const SESSION_ID = (0, uuid_1.v4)();
const GROUP = 'example-group';
// Models that we'll track
const MODELS = {
    player1: {
        name: 'player1',
        type: 'player',
        health: 100,
        position: { x: 0, y: 0, z: 0 },
        inventory: ['sword', 'potion']
    },
    healthBar: {
        name: 'healthBar',
        type: 'ui',
        value: 100,
        color: 'green',
        visible: true
    }
};
// Create connection URL with session ID and group
const connectionUrl = `${WS_URL}?sessionId=${SESSION_ID}&groups=${GROUP}`;
// Connect to the WebSocket server
console.log(`Connecting to ${connectionUrl}...`);
const ws = new ws_1.default(connectionUrl);
// Create readline interface for user input
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Message sequence counter for request IDs
let messageCounter = 0;
// Track requests we're waiting for responses to
const pendingRequests = new Map();
// Message handler
ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        console.log(`\nReceived: ${JSON.stringify(message, null, 2)}`);
        if (message.type === 'connection:established') {
            console.log(`Connection established. Connection ID: ${message.data.connectionId}`);
            showMenu();
        }
        else if (message.type === 'response' && message.data.requestId) {
            // Handle response to a request
            const resolver = pendingRequests.get(message.data.requestId);
            if (resolver) {
                resolver(message.data.results);
                pendingRequests.delete(message.data.requestId);
            }
            // Show the menu again after response
            showMenu();
        }
        else if (message.type === 'sync:modelUpdated') {
            // Handle model update notification
            console.log(`\nModel updated by another client:`);
            console.log(`Model ID: ${message.data.modelId}`);
            console.log(`Updated values: ${JSON.stringify(message.data.values, null, 2)}`);
            console.log(`Updated by: ${message.data.updatedBy}`);
            // Show the menu again after notification
            showMenu();
        }
    }
    catch (error) {
        console.error('Error parsing message:', error);
    }
});
// Connection open handler
ws.on('open', () => {
    console.log('WebSocket connection established.');
});
// Connection error handler
ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});
// Connection close handler
ws.on('close', () => {
    console.log('WebSocket connection closed.');
    rl.close();
    process.exit(0);
});
/**
 * Send a request to the server and return a promise for the response
 */
function sendRequest(type, data) {
    return new Promise((resolve) => {
        const requestId = `req-${messageCounter++}`;
        // Store the resolver function to call when we get a response
        pendingRequests.set(requestId, resolve);
        // Send the request
        ws.send(JSON.stringify({
            type,
            data,
            requestId
        }));
        console.log(`Sent ${type} request with ID ${requestId}`);
    });
}
/**
 * Display the user menu
 */
function showMenu() {
    setTimeout(() => {
        console.log('\n--- WebSocket Sync Example Menu ---');
        console.log('1. Subscribe to player1 model');
        console.log('2. Subscribe to all UI models');
        console.log('3. Get player1 state');
        console.log('4. Update player1 health');
        console.log('5. Update player1 position');
        console.log('6. Unsubscribe from everything');
        console.log('7. Send ping');
        console.log('0. Exit');
        rl.question('\nEnter choice: ', handleMenuChoice);
    }, 500); // Small delay to let other console output finish
}
/**
 * Handle menu choices
 */
async function handleMenuChoice(choice) {
    switch (choice) {
        case '1':
            // Subscribe to player1 model
            await sendRequest('sync:subscribe', { modelId: 'player1' });
            break;
        case '2':
            // Subscribe to all UI models
            await sendRequest('sync:subscribe', { modelType: 'ui' });
            break;
        case '3':
            // Get player1 state
            await sendRequest('sync:getState', { modelId: 'player1' });
            break;
        case '4':
            // Update player1 health
            rl.question('Enter new health value (0-100): ', async (value) => {
                const healthValue = parseInt(value, 10);
                if (isNaN(healthValue) || healthValue < 0 || healthValue > 100) {
                    console.log('Invalid health value. Must be between 0 and 100.');
                    showMenu();
                    return;
                }
                await sendRequest('sync:update', {
                    modelId: 'player1',
                    values: { health: healthValue }
                });
            });
            return; // Skip automatic menu display
        case '5':
            // Update player1 position
            rl.question('Enter new position (x,y,z): ', async (value) => {
                const parts = value.split(',').map(part => parseFloat(part.trim()));
                if (parts.length !== 3 || parts.some(isNaN)) {
                    console.log('Invalid position. Format should be x,y,z (e.g. 10,5,20).');
                    showMenu();
                    return;
                }
                await sendRequest('sync:update', {
                    modelId: 'player1',
                    values: {
                        position: {
                            x: parts[0],
                            y: parts[1],
                            z: parts[2]
                        }
                    }
                });
            });
            return; // Skip automatic menu display
        case '6':
            // Unsubscribe from everything
            await sendRequest('sync:unsubscribe', { all: true });
            break;
        case '7':
            // Send ping
            await sendRequest('ping', {});
            break;
        case '0':
            // Exit
            console.log('Exiting...');
            ws.close();
            rl.close();
            process.exit(0);
            break;
        default:
            console.log('Invalid choice');
            break;
    }
    // Show menu again for most choices
    showMenu();
}
// Handle process termination
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Closing connection...');
    ws.close();
    rl.close();
    process.exit(0);
});
// Notify user how to quit
console.log('Press Ctrl+C to exit at any time.');
// Run the example
console.log('WebSocket Sync Example');
console.log(`Session ID: ${SESSION_ID}`);
console.log(`Group: ${GROUP}`);
//# sourceMappingURL=syncExample.js.map