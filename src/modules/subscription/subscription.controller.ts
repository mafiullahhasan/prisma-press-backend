import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { subscriptionService } from "./subscription.service";
import httpStatus from "http-status"
import { ApiResponse } from "../../utils/ApiResponse";


const createCheckOutSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const result = await subscriptionService.createCheckOutSession(userId as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Checkout completed Successfully")
    )
})

const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const event = req.body as Buffer
    const signature = req.headers['stripe-signature'] as string;

    const result = await subscriptionService.handleWebhook(event, signature)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, null, "Webhook triggered Successfully")
    )
})

const getSubscriptionStatus = asyncHandler(async (req: Request, res: Response) => {

    const userId = req.user?.id

    const result = await subscriptionService.getSubscriptionStatus(userId as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Subscription Status Retrived Successfully")
    )
})

const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const result = await subscriptionService.cancelSubscription(userId as string);

    res.status(httpStatus.OK).json(
        new ApiResponse(
            httpStatus.OK,
            {
                cancelAtPeriodEnd: result.cancelAtPeriodEnd,
                currentPeriodEnd: result.currentPeriodEnd,
            },
            result.message
        )
    );
}
);

export const subscriptionController = {
    createCheckOutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
}