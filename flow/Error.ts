/**
 * Throws an error as a function.
 * @param error 
 */
export function throwError(error: Error | string): never {
    if (typeof error === "string") {
        throw new Error(error);
    }
    throw error;
}