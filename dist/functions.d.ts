export declare function withoutSpawnRef(arg?: any): {};
export declare function getAllIndexes<T extends readonly string[]>(arr: T, val: string): number[];
export declare function getReferences<T extends readonly string[]>(args: T): { [key in T[number]]: number[]; };
export declare function createInvite(args: string[]): string[];
