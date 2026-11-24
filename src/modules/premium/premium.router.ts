import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { Role } from "../../../generated/prisma/enums.js";
import { premiumController } from "./premium.controller.js";
import { subscriptionGuard } from "../../middlewares/premium.middleware.js";

const router = Router()

router.get("/", authMiddleware(Role.USER, Role.AUTHOR, Role.ADMIN), subscriptionGuard(), premiumController.getPremiumPost)

export const premiumRoutes = router