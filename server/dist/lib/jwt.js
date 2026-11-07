import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function signToken(userId) {
    return jwt.sign({ sub: userId }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
    });
}
export function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        return typeof decoded === 'object' && typeof decoded.sub === 'string' ? { sub: decoded.sub } : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map