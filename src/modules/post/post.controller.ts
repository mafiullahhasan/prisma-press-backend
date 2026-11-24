import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { postService } from "./post.service.js";
import httpStatus from "http-status"
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";



const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query

    const posts = await postService.getAllPosts(query)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, posts.data,
            "Post Retrieved Successfully",
            {
                page: posts.meta.page,
                limit: posts.meta.limit,
                total: posts.meta.totalPostCount
            })
    )
})

const getPostStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await postService.getPostStats()

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, stats, "Post Stats Retrived Successfully")
    )
})

const getMyPosts = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id

    const posts = await postService.getMyPosts(id as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, posts, "My Post Retrived Successfully")
    )
})

const getPostDetails = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId

    if (!postId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post Id required")
    }

    const post = await postService.getPostDetails(postId as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, post, "Post retrived Successfully")
    )
})

const createPost = asyncHandler(async (req: Request, res: Response) => {
    const id = req.user?.id
    const payload = req.body

    const result = await postService.createPost(payload, id as string)

    res.status(httpStatus.CREATED).json(
        new ApiResponse(httpStatus.CREATED, result, "Post Created Successfully")
    )
})

const updatePost = asyncHandler(async (req: Request, res: Response) => {

    const postId = req.params.postId
    const payload = req.body

    const authorId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN"

    if (!postId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post ID is required")
    }

    const result = await postService.updatePost(postId as string, payload, authorId as string, isAdmin)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result, "Post Updated Successfully")
    )
})

const deletePost = asyncHandler(async (req: Request, res: Response) => {
    const postId = req.params.postId

    const authorId = req.user?.id
    const isAdmin = req.user?.role === "ADMIN"

    if (!postId) {
        throw new ApiError(httpStatus.NOT_FOUND, "Post ID is required")
    }

    await postService.deletePost(postId as string, authorId as string, isAdmin)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, null, "Post Deleted Successfully")
    )
})


export const postController = {
    getAllPosts,
    getPostStats,
    getMyPosts,
    getPostDetails,
    createPost,
    updatePost,
    deletePost
}