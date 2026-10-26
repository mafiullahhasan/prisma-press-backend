import { Router } from "express";
import { commentsController } from "./comment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router()

router.get("/author/:authorId", commentsController.getCommentByAuthorId)
router.get("/:commentId", commentsController.getCommentById)
router.post("/", authMiddleware(Role.ADMIN, Role.USER), commentsController.createComment)
router.patch("/:commentId", authMiddleware(Role.USER, Role.ADMIN), commentsController.updateCommentById)
router.delete("/:commentId", authMiddleware(Role.USER, Role.ADMIN), commentsController.deleteCommentById)
router.patch("/:commentId/moderate", authMiddleware(Role.ADMIN), commentsController.moderateCommentStatus)


export const commentRoutes = router