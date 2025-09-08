export declare class HttpError extends Error {
    readonly status: number;
    readonly details?: unknown;
    constructor(status: number, message: string, details?: unknown);
}
//# sourceMappingURL=http-error.d.ts.map