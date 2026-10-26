import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";
import { premiumController } from "./premium.controller";
import { subscriptionGuard } from "../../middlewares/premium.middleware";

const router = Router()

router.get("/", authMiddleware(Role.USER, Role.AUTHOR, Role.ADMIN), subscriptionGuard(), premiumController.getPremiumPost)

export const premiumRoutes = router