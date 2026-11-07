/** An error that maps directly to an HTTP response: `{ error: { code, message, details? } }`. */
export class AppError extends Error {
    status;
    code;
    details;
    constructor(status, code, message, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = 'AppError';
    }
}
export const notFound = (what) => new AppError(404, 'NOT_FOUND', `${what} not found`);
export const conflict = (message) => new AppError(409, 'CONFLICT', message);
export const badRequest = (message, path) => new AppError(400, 'VALIDATION_ERROR', message, path ? [{ path, message }] : undefined);
/** The AI provider failed. Never 401: the frontend treats 401 as "session expired". */
export const aiError = (message) => new AppError(502, 'AI_ERROR', message);
//# sourceMappingURL=errors.js.map