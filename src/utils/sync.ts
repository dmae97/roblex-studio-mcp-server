import { logger } from './logger';

// Timeout for sync operations (default: 30 seconds)
const SYNC_TIMEOUT = Number(process.env.SYNC_TIMEOUT || 30000);

/**
 * A simple promise-based lock mechanism
 */
class Lock {
    private locked: boolean = false;
    private queue: Array<{
        resolve: () => void;
        reject: (error: Error) => void;
        timeoutId: NodeJS.Timeout;
    }> = [];
    
    /**
     * Acquire the lock
     */
    async acquire(timeout: number = SYNC_TIMEOUT): Promise<void> {
        if (!this.locked) {
            this.locked = true;
            return Promise.resolve();
        }
        
        return new Promise<void>((resolve, reject) => {
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
    release(): void {
        if (this.queue.length > 0) {
            const { resolve, timeoutId } = this.queue.shift()!;
            clearTimeout(timeoutId);
            resolve();
        } else {
            this.locked = false;
        }
    }
}

// Global locks for various resources
const locks: Map<string, Lock> = new Map();

/**
 * Get a lock for a specific resource
 */
function getLock(resourceId: string): Lock {
    if (!locks.has(resourceId)) {
        locks.set(resourceId, new Lock());
    }
    
    return locks.get(resourceId)!;
}

/**
 * Execute a function with exclusive access to a resource
 */
export async function withLock<T>(
    resourceId: string, 
    fn: () => Promise<T>, 
    timeout: number = SYNC_TIMEOUT
): Promise<T> {
    const lock = getLock(resourceId);
    
    try {
        await lock.acquire(timeout);
        logger.debug(`Acquired lock for resource: ${resourceId}`);
        
        const result = await fn();
        return result;
    } finally {
        lock.release();
        logger.debug(`Released lock for resource: ${resourceId}`);
    }
}

/**
 * A simple semaphore implementation for limiting concurrent operations
 */
export class Semaphore {
    private permits: number;
    private queue: Array<() => void> = [];
    
    constructor(permits: number) {
        this.permits = permits;
    }
    
    /**
     * Acquire a permit from the semaphore
     */
    async acquire(): Promise<void> {
        if (this.permits > 0) {
            this.permits--;
            return Promise.resolve();
        }
        
        return new Promise<void>(resolve => {
            this.queue.push(resolve);
        });
    }
    
    /**
     * Release a permit back to the semaphore
     */
    release(): void {
        if (this.queue.length > 0) {
            const resolve = this.queue.shift()!;
            resolve();
        } else {
            this.permits++;
        }
    }
    
    /**
     * Execute a function with a semaphore permit
     */
    async execute<T>(fn: () => Promise<T>): Promise<T> {
        try {
            await this.acquire();
            return await fn();
        } finally {
            this.release();
        }
    }
} 