import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { ApiError } from './ApiError';

// 1. Define a strict type for your user payload so you don't make typos
export interface IJwtPayload extends JwtPayload {
    id: string;
    role?: string;
    email?: string;
    name?: string;
}

/*
    Reusable function to Create/Sign a Token
*/
export const createToken = (
    payload: IJwtPayload,
    secret: string,
    expiresIn: string
): string => {
    return jwt.sign(payload, secret, {
        expiresIn,
    } as SignOptions);
};

/*
     Reusable function to Verify a Token (Used in Auth Middlewares)
*/
export const verifyToken = (token: string, secret: string): IJwtPayload => {
    try {
        return jwt.verify(token, secret) as IJwtPayload;
    } catch (error: any) {
        console.error("JWT Verification Error:", error.message);
        throw new ApiError(401, 'Invalid or expired token');
    }
};
