/**
 * Execute a function with exclusive access to a resource
 */
export declare function withLock<T>(resourceId: string, fn: () => Promise<T>, timeout?: number): Promise<T>;
/**
 * A simple semaphore implementation for limiting concurrent operations
 */
export declare class Semaphore {
    private permits;
    private queue;
    constructor(permits: number);
    /**
     * Acquire a permit from the semaphore
     */
    acquire(): Promise<void>;
    /**
     * Release a permit back to the semaphore
     */
    release(): void;
    /**
     * Execute a function with a semaphore permit
     */
    execute<T>(fn: () => Promise<T>): Promise<T>;
}
