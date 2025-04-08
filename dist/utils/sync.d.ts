/// <reference types="node" />
import http from 'http';
/**
 * Initialize WebSocket server
 * @param server HTTP server instance
 * @param path WebSocket endpoint path
 */
export declare function init(server: http.Server, path?: string): void;
/**
 * Register a message handler
 * @param messageType Type of message to handle
 * @param handler Handler function
 */
export declare function registerHandler(messageType: string, handler: (data: any, connectionId: string) => Promise<any>): void;
/**
 * Send a message to a specific connection
 * @param connectionId Connection ID
 * @param type Message type
 * @param data Message data
 * @returns true if sent, false if connection not found or closed
 */
export declare function sendToConnection(connectionId: string, type: string, data: any): boolean;
/**
 * Broadcast a message to all connections
 * @param type Message type
 * @param data Message data
 */
export declare function broadcastToAll(type: string, data: any): void;
/**
 * Broadcast a message to a specific group
 * @param groupName Group name
 * @param type Message type
 * @param data Message data
 * @returns Number of connections the message was sent to
 */
export declare function broadcastToGroup(groupName: string, type: string, data: any): number;
/**
 * Add a connection to a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
export declare function joinGroup(connectionId: string, groupName: string): void;
/**
 * Remove a connection from a group
 * @param connectionId Connection ID
 * @param groupName Group name
 */
export declare function leaveGroup(connectionId: string, groupName: string): void;
/**
 * Get all groups a connection belongs to
 * @param connectionId Connection ID
 * @returns Array of group names
 */
export declare function getConnectionGroups(connectionId: string): string[];
