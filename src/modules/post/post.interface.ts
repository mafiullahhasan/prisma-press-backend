import { PostStatus } from "../../../generated/prisma/enums.js"
import { PostWhereInput } from "../../../generated/prisma/models.js"

export interface ICreatePostPayload {
    title: string
    content: string
    thumbnail?: string
    isFeatured?: boolean
    isPremium?: boolean
    status: PostStatus
    tags: string[]
}

export interface IUpdatePostPayload {
    title?: string
    content?: string
    thumbnail?: string
    isFeatured?: boolean
    status?: PostStatus
    tags?: string[]
}

export interface IPostQuery extends PostWhereInput {
    searchTerm?: string,
    sortBy?: string,
    sortOrder?: string,
    limit?: string,
    page?: string
}