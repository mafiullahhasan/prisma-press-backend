import { Router } from "express"
import { userController } from "./user.controller.js"
import { authMiddleware } from "../../middlewares/auth.middleware.js"
import { Role } from "../../../generated/prisma/enums.js"



const router = Router()

router.post("/register", userController.registerUser)
router.get("/me", authMiddleware(Role.ADMIN, Role.AUTHOR, Role.USER), userController.getMyProfile)
router.put("/my-profile",authMiddleware(Role.ADMIN,Role.AUTHOR,Role.USER),userController.updateMyProfile)


export const userRoutes = router