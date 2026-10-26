import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/jwt';
import config from '../config';
import { asyncHandler } from '../utils/asyncHandler';
import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../../generated/prisma/enums';
import { prisma } from '../lib/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name?: string;
                email?: string;
                role?: string;
            };
        }
    }
}

export const authMiddleware = (...requiredRoles: Role[]) => {
    return asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // 1. Extract token from cookie or headers
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized request");
        }

        // 2. Verify token (your verifyToken function throws ApiError if expired/invalid)
        const decodedUser = verifyToken(token, config.jwt_access_secret);

        const { id, name, email, role } = decodedUser as JwtPayload

        // 3. Role validation check
        if (requiredRoles.length && (!requiredRoles.includes(role))) {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                'You do not have permission to perform this action'
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                id,
                email,
                name,
                role
            }
        })

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, "User Not Found. Please log in again!")
        }

        if (user.activeStatus === "BLOCKED") {
            throw new ApiError(
                httpStatus.FORBIDDEN,
                "Your account has been blocked. Please contact support."
            );
        }

        req.user = decodedUser;

        next();
    });
};
