import { Router } from "express";
import { postController } from "./post.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { Role } from "../../../generated/prisma/enums.js";

const router = Router()

// GET
router.get("/", postController.getAllPosts)
router.get("/stats", authMiddleware(Role.ADMIN), postController.getPostStats)
router.get("/my-posts", authMiddleware(Role.ADMIN, Role.USER), postController.getMyPosts)
router.get("/:postId", postController.getPostDetails)

// POST
router.post("/", authMiddleware(Role.ADMIN, Role.USER), postController.createPost)
// PATCH
router.patch("/:postId", authMiddleware(Role.ADMIN, Role.USER), postController.updatePost)
// DELETE
router.delete("/:postId", authMiddleware(Role.ADMIN, Role.USER), postController.deletePost)


export const postRoutes = router