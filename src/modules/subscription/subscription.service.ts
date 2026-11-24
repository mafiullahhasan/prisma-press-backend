import Stripe from "stripe"
import config from "../../config/index.js"
import { prisma } from "../../lib/prisma.js"
import { stripe } from "../../lib/stripe.js"
import { ApiError } from "../../utils/ApiError.js"
import { getPeriodEnd, handleChangeSubscription, handleCheckoutCompleted } from "./subscription.utils.js"
import httpStatus from "http-status"

const createCheckOutSession = async (userId: string) => {
    const transactionResult = await prisma.$transaction(async (tx) => {

        const user = await tx.user.findUniqueOrThrow({
            where: {
                id: userId
            },
            include: {
                subscription: true
            }
        })

        const subscription = user.subscription;

        if (
            subscription?.status === "ACTIVE" &&
            subscription.currentPeriodEnd > new Date()
        ) {
            throw new ApiError(
                httpStatus.CONFLICT,
                "You already have an active subscription"
            );
        }

        // existed user
        let stripeCustomerId = user.subscription?.stripeCustomerId

        if (!stripeCustomerId) {
            // new subscriber
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { userId: user.id }
            })

            stripeCustomerId = customer.id
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: config.stripe_product_price_id,
                    quantity: 1
                }
            ],
            mode: "subscription",
            customer: stripeCustomerId,
            allowed_payment_method_types: ["card"],
            success_url: `${config.app_url}/premium?success=true`,
            cancel_url: `${config.app_url}/payment?success=false`,
            metadata: { userId: user.id }
        })


        return session.url

    })

    return {
        paymentUrl: transactionResult
    }
}

const handleWebhook = async (payload: Buffer, signature: string) => {
    
    const endpointSecret = config.stripe_webhook_secret;

    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
    );

    switch (event.type) {
        case "checkout.session.completed":
            await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
            break;

        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await handleChangeSubscription(event.data.object as Stripe.Subscription);
            break;

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
            break;
    }
};

const getSubscriptionStatus = async (userId: string) => {

    const isSubscriptionExist = await prisma.subscription.findUniqueOrThrow({
        where: {
            userId
        }
    })

    const isActive = isSubscriptionExist.status === "ACTIVE"
        && isSubscriptionExist.currentPeriodEnd
        && new Date(isSubscriptionExist.currentPeriodEnd) > new Date()

    return {
        status: isSubscriptionExist.status,
        isSubscribed: isActive,
        currentPeriodEnd: isSubscriptionExist.currentPeriodEnd
    }
}

const cancelSubscription = async (userId: string) => {
    const subscription = await prisma.subscription.findUnique({
        where: { userId },
    });

    // 1. Subscription আছে কি না
    if (!subscription) {
        throw new ApiError(
            httpStatus.NOT_FOUND,
            "Subscription not found"
        );
    }

    // 2. Subscription active কি না
    if (subscription.status !== "ACTIVE") {
        throw new ApiError(
            httpStatus.CONFLICT,
            "No active subscription to cancel"
        );
    }

    // 3. Paid period শেষ হয়েছে কি না
    if (
        !subscription.currentPeriodEnd ||
        new Date(subscription.currentPeriodEnd) <= new Date()
    ) {
        throw new ApiError(
            httpStatus.CONFLICT,
            "Subscription period has ended"
        );
    }

    // 4. আগেই cancellation schedule করা হয়েছে কি না
    if (subscription.cancelAtPeriodEnd) {
        return {
            message: "Cancellation is already scheduled",
            cancelAtPeriodEnd: true,
            currentPeriodEnd: subscription.currentPeriodEnd,
        };
    }

    // 5. Stripe-এ period end cancellation schedule করো
    const stripeSubscription = await stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
            cancel_at_period_end: true,
        }
    );

    // 6. Stripe-এর latest state database-এ sync করো
    const updatedSubscription = await prisma.subscription.update({
        where: { userId },
        data: {
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            currentPeriodEnd: getPeriodEnd(stripeSubscription),
        },
    });

    return {
        message: "Subscription cancellation scheduled successfully",
        cancelAtPeriodEnd: updatedSubscription.cancelAtPeriodEnd,
        currentPeriodEnd: updatedSubscription.currentPeriodEnd,
    };
};



export const subscriptionService = {
    createCheckOutSession,
    handleWebhook,
    getSubscriptionStatus,
    cancelSubscription
}