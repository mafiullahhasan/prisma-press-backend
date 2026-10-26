import Stripe from "stripe"
import { SubscriptionStatus } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe"

export const getPeriodEnd = (payload: Stripe.Subscription) => {
    const currentPeriodEndInMilliSeconds = payload.items.data[0]?.current_period_end!
    const currentPeriodEnd = new Date(currentPeriodEndInMilliSeconds * 1000)

    return currentPeriodEnd
}

export const handleCheckoutCompleted = async (session: Stripe.Checkout.Session) => {

    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer as string | null;
    const stripeSubscriptionId = session.subscription as string | null;

    if (!userId || !stripeCustomerId || !stripeSubscriptionId) {
        throw new Error(
            "Missing userId, customerId, or subscriptionId in checkout session"
        );
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);

    const currentPeriodEnd = getPeriodEnd(stripeSubscription);

    await prisma.subscription.upsert({
        where: {
            userId,
        },
        create: {
            userId,
            stripeCustomerId,
            stripeSubscriptionId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
        },
        update: {
            stripeCustomerId,
            stripeSubscriptionId,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd,
            cancelAtPeriodEnd: false,
        },
    });
};


export const handleChangeSubscription = async (payload: Stripe.Subscription) => {
    
    const stripeSubscriptionId = payload.id;
    const currentPeriodEnd = getPeriodEnd(payload);
    const isPeriodEnded = currentPeriodEnd <= new Date();

    let status: SubscriptionStatus;

    if (
        payload.status === "active" ||
        payload.status === "trialing"
    ) {
        status = isPeriodEnded
            ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.ACTIVE;
    } else if (payload.status === "canceled") {
        status = isPeriodEnded
            ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.CANCELED;
    } else {
        status = SubscriptionStatus.EXPIRED;
    }

    const subscription = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
    });

    if (!subscription) {
        console.error(
            `Webhook: subscription not found: ${stripeSubscriptionId}`
        );
        return;
    }

    await prisma.subscription.update({
        where: { stripeSubscriptionId },
        data: {
            status,
            currentPeriodEnd,
            cancelAtPeriodEnd:
                payload.status !== "canceled" &&
                payload.cancel_at_period_end,
        },
    });
};
