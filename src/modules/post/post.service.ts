import { CommentStatus, PostStatus } from "../../../generated/prisma/enums"
import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { ApiError } from "../../utils/ApiError"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"
import httpStatus from "http-status"




const getAllPosts = async (query: IPostQuery) => {

    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 10
    const skip = (page - 1) * limit

    const sortBy = query.sortBy ? query.sortBy : "createdAt"
    const sortOrder = query.sortOrder ? query.sortOrder : "desc"

    const andConditions: PostWhereInput[] = []

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                {
                    title: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
                {
                    content: {
                        contains: query.searchTerm,
                        mode: "insensitive"
                    }
                },
            ]
        })
    }

    if (query.title) {
        andConditions.push({
            title: query.title
        })
    }

    if (query.content) {
        andConditions.push({
            content: query.content
        })
    }

    andConditions.push({
        isPremium: false,
        status: PostStatus.PUBLISHED
    })

    const [posts, totalPostCount] = await Promise.all([
        prisma.post.findMany({
            where: { AND: andConditions },
            take: limit,
            skip: skip,
            orderBy: { [sortBy]: sortOrder },
            include: {
                author: { omit: { password: true } },
                comment: { where: { status: "APPROVED" } }
            }
        }),
        prisma.post.count({
            where: { AND: andConditions }
        })
    ]);

    return {
        data: posts, 
        meta: {
            page: page,
            limit: limit,
            totalPostCount,
            totalPages: Math.ceil(totalPostCount / limit)
        }
    }
}

const getPostStats = async () => {
    const transactionResult = await prisma.$transaction(async (tx) => {
        const [
            totalPosts,
            totalPublishedPosts,
            totalArchivedPosts,
            totalDraftPosts,
            views,
            totalComments,
            totalApprovedComments,
            totalRejectComments
        ] = await Promise.all([
            await tx.post.count(),
            await tx.post.findMany({
                where: {
                    status: PostStatus.PUBLISHED
                }
            }),
            await tx.post.findMany({
                where: {
                    status: PostStatus.ARCHIVE
                }
            }),
            await tx.post.findMany({
                where: {
                    status: PostStatus.DRAFT
                }
            }),
            await tx.post.aggregate({
                _sum: {
                    views: true
                }
            }),
            await tx.comment.count(),
            await tx.comment.findMany({
                where: {
                    status: CommentStatus.APPROVED
                }
            }),
            await tx.comment.findMany({
                where: {
                    status: CommentStatus.REJECT
                }
            })

        ])

        return {
            totalPosts,
            totalPublishedPosts,
            totalArchivedPosts,
            totalDraftPosts,
            totalPostViews: views._sum.views,
            totalComments,
            totalApprovedComments,
            totalRejectComments
        }

    })
    return transactionResult
}

const getMyPosts = async (authorId: string) => {
    const posts = await prisma.post.findMany({
        where: {
            authorId
        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comment: true,
            _count: {
                select: {
                    comment: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        },
    })

    return posts
}

const getPostDetails = async (postId: string) => {

    const transactionResult = await prisma.$transaction(async (tx) => {
        // Check first, so premium/unpublished posts don't get their views bumped
        const exists = await tx.post.findFirst({
            where: {
                id: postId,
                isPremium: false,
                status: PostStatus.PUBLISHED
            },
            select: { id: true }
        })

        if (!exists) {
            throw new ApiError(httpStatus.NOT_FOUND, "Post Not Found")
        }

        const post = await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            },
            include: {
                author: {
                    omit: {
                        password: true
                    }
                },
                // Spec 9.3: return approved comments only, with a safe author summary
                comment: {
                    where: { status: CommentStatus.APPROVED },
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                profile: { select: { profilePhoto: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: "desc" }
                },
                _count: {
                    select: {
                        comment: { where: { status: CommentStatus.APPROVED } }
                    }
                }
            }
        })

        return post
    })

    return transactionResult
}

const createPost = async (payload: ICreatePostPayload, userId: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        include: {
            subscription: true
        }
    })

    if (payload.isPremium && user.subscription?.status !== "ACTIVE") {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not a premium user. so you can't create premium content")
    }

    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })
    return result
}

const updatePost = async (postId: string, payload: IUpdatePostPayload, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not the owner of this post")
    }

    const result = await prisma.post.update({
        where: {
            id: postId
        },
        data: payload,
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comment: true
        }
    })

    return result
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    const post = await prisma.post.findUniqueOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not the owner of this post")
    }

    await prisma.post.delete({
        where: {
            id: postId
        }
    })
}

export const postService = {
    getAllPosts,
    getPostStats,
    getMyPosts,
    getPostDetails,
    createPost,
    updatePost,
    deletePost
}