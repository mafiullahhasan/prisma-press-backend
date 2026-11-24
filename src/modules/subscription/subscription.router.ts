import { Router } from "express";
import { subscriptionController } from "./subscription.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router()

router.post("/checkout", authMiddleware(Role.USER, Role.AUTHOR, Role.ADMIN), subscriptionController.createCheckOutSession)
router.post("/webhook", subscriptionController.handleWebhook),
router.post("/cancel", authMiddleware(Role.USER, Role.AUTHOR, Role.ADMIN), subscriptionController.cancelSubscription);
router.get("/status", authMiddleware(Role.USER, Role.AUTHOR, Role.ADMIN), subscriptionController.getSubscriptionStatus)

export const subscriptionRoutes = router