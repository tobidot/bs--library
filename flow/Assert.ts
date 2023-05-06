/**
 * Make sure the condition is true, otherwise throw an error.
 * @param condition 
 * @param message 
 */
export function assert(condition: boolean, message?: string): asserts condition {
    if (!condition) {
        throw new Error(message ?? 'Assert failed');
    }
}

export function assertNotNull<T extends object>(value: T | null | undefined, message?: string): asserts value is T {
    if (value === null || value === undefined) {
        throw new Error(message ?? 'Assert failed');
    }
}