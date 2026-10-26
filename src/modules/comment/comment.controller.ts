import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { commentsService } from "./comment.service";
import httpStatus from "http-status"
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";

const getCommentByAuthorId = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.authorId

    const result = await commentsService.getCommentsByAuthorId(id as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comments Retrived Successfully by author id")
    )
})

const getCommentById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.commentId as string

    if (!id) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment ID's required!")
    }
    const result = await commentsService.getCommentById(id)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comment Retrived successfully by comment ID")
    )
})

const createComment = asyncHandler(async (req: Request, res: Response) => {
    const { postId, content } = req.body
    const authorId = req.user?.id as string

    const result = await commentsService.createComment(postId as string, authorId, content)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comment Post Successfully")
    )
})

const updateCommentById = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body

    const authorId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"

    const commentId = req.params.commentId as string
    if (!commentId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment ID's required!")
    }
    const result = await commentsService.updateCommentById(commentId, payload, authorId, isAdmin)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comment Updated Successfully")
    )
})

const deleteCommentById = asyncHandler(async (req: Request, res: Response) => {

    const authorId = req.user?.id as string
    const isAdmin = req.user?.role === "ADMIN"

    const commentId = req.params.commentId as string
    if (!commentId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment ID's required!")
    }

    const result = await commentsService.deleteCommentById(commentId, authorId, isAdmin)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comment Deleted Successfully")
    )
})

const moderateCommentStatus = asyncHandler(async (req: Request, res: Response) => {
    const commentId = req.params.commentId as string
    if (!commentId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Comment ID's required!")
    }
    const result = await commentsService.moderateCommentStatus(commentId)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Comments Status Updated Successfully")
    )
})


export const commentsController = {
    getCommentByAuthorId,
    getCommentById,
    createComment,
    updateCommentById,
    deleteCommentById,
    moderateCommentStatus
}