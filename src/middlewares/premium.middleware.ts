
import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../lib/prisma";
import { ApiError } from "../utils/ApiError";
import httpStatus from "http-status";

export const subscriptionGuard = () => {
    return asyncHandler(
        async (req: Request, res: Response, next: NextFunction) => {
            const userId = req.user?.id;

            if (!userId) {
                throw new ApiError(
                    httpStatus.UNAUTHORIZED,
                    "Please login to access premium content"
                );
            }

            const subscription = await prisma.subscription.findUnique({
                where: {
                    userId,
                },
            });

            if (!subscription) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    "Please subscribe to access premium content"
                );
            }

            if (subscription.status !== "ACTIVE") {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    "Your subscription is inactive. Please subscribe again to access premium content"
                );
            }

            // Subscription-এর মেয়াদ শেষ হয়েছে কি না check
            if (
                !subscription.currentPeriodEnd ||
                new Date(subscription.currentPeriodEnd) <= new Date()
            ) {
                throw new ApiError(
                    httpStatus.FORBIDDEN,
                    "Your Premium subscription has expired. Please renew to access premium content"
                );
            }

            next();
        }
    );
};
