"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Semaphore = void 0;
exports.withLock = withLock;
const logger_1 = require("./logger");
// Timeout for sync operations (default: 30 seconds)
const SYNC_TIMEOUT = Number(process.env.SYNC_TIMEOUT || 30000);
/**
 * A simple promise-based lock mechanism
 */
class Lock {
    locked = false;
    queue = [];
    /**
     * Acquire the lock
     */
    async acquire(timeout = SYNC_TIMEOUT) {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        }
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                // Remove from queue
                this.queue = this.queue.filter(item => item.timeoutId !== timeoutId);
                reject(new Error('Lock acquisition timed out'));
            }, timeout);
            this.queue.push({ resolve, reject, timeoutId });
        });
    }
    /**
     * Release the lock
     */
    release() {
        if (this.queue.length > 0) {
            const { resolve, timeoutId } = this.queue.shift();
            clearTimeout(timeoutId);
            resolve();
        }
        else {
            this.locked = false;
        }
    }
}
// Global locks for various resources
const locks = new Map();
/**
 * Get a lock for a specific resource
 */
function getLock(resourceId) {
    if (!locks.has(resourceId)) {
        locks.set(resourceId, new Lock());
    }
    return locks.get(resourceId);
}
/**
 * Execute a function with exclusive access to a resource
 */
async function withLock(resourceId, fn, timeout = SYNC_TIMEOUT) {
    const lock = getLock(resourceId);
    try {
        await lock.acquire(timeout);
        logger_1.logger.debug(`Acquired lock for resource: ${resourceId}`);
        const result = await fn();
        return result;
    }
    finally {
        lock.release();
        logger_1.logger.debug(`Released lock for resource: ${resourceId}`);
    }
}
/**
 * A simple semaphore implementation for limiting concurrent operations
 */
class Semaphore {
    permits;
    queue = [];
    constructor(permits) {
        this.permits = permits;
    }
    /**
     * Acquire a permit from the semaphore
     */
    async acquire() {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        return new Promise(resolve => {
            this.queue.push(resolve);
        });
    }
    /**
     * Release a permit back to the semaphore
     */
    release() {
        if (this.queue.length > 0) {
            const resolve = this.queue.shift();
            resolve();
        }
        else {
            this.permits++;
        }
    }
    /**
     * Execute a function with a semaphore permit
     */
    async execute(fn) {
        try {
            await this.acquire();
            return await fn();
        }
        finally {
            this.release();
        }
    }
}
exports.Semaphore = Semaphore;
//# sourceMappingURL=sync.js.map