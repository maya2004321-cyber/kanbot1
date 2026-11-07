import { AppError } from '../lib/errors.js';
export const notFoundHandler = (req, _res, next) => {
    next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`));
};
export const errorHandler = (err, _req, res, _next) => {
    // Malformed JSON body from express.json()
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request body is not valid JSON' } });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.status).json({
            error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) },
        });
        return;
    }
    console.error(err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong on our side.' } });
};
//# sourceMappingURL=errorHandler.js.map