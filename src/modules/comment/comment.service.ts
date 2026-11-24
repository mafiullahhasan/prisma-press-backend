import { prisma } from "../../lib/prisma.js"
import { ApiError } from "../../utils/ApiError.js"
import httpStatus from "http-status"
import { ICommentUpdateInput } from "./comment.interface.js"


const getCommentsByAuthorId = async (id: string) => {

    const existUser = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        }
    })


    const comments = await prisma.comment.findMany({
        where: {
            authorId: id
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })

    return comments
}

const getCommentById = async (id: string) => {
    const result = await prisma.comment.findUniqueOrThrow({
        where: {
            id
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                    views: true
                }
            }
        }
    })

    return result
}

const createComment = async (postId: string, authorId: string, payload: string) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })


    const comment = await prisma.comment.create({
        data: {
            content: payload,
            postId: postId,
            authorId: authorId
        }
    })

    return comment

}

const updateCommentById = async (commentId: string, payload: ICommentUpdateInput, authorId: string, isAdmin: boolean) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        }
    })

    if (!isAdmin && comment.authorId !== authorId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not the owner of this post")
    }

    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: payload,
        include: {
            post: true
        }
    })
    return result
}

const deleteCommentById = async (commentId: string, authorId: string, isAdmin: boolean) => {
    const comment = await prisma.comment.findUniqueOrThrow({
        where: {
            id: commentId
        }
    })

    if (!isAdmin && comment.authorId !== authorId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not the owner of this post")
    }

    await prisma.comment.delete({
        where: {
            id: commentId
        }
    })
}

const moderateCommentStatus = async (commentId: string) => {
    const result = await prisma.comment.update({
        where: {
            id: commentId
        },
        data: {
            status: "REJECT"
        }
    })

    return result
}


export const commentsService = {
    getCommentsByAuthorId,
    getCommentById,
    createComment,
    updateCommentById,
    deleteCommentById,
    moderateCommentStatus
}