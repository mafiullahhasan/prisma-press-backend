import { PostWhereInput } from "../../../generated/prisma/models"
import { prisma } from "../../lib/prisma"
import { IPostQuery } from "../post/post.interface"

const getPremiumPost = async (query: IPostQuery) => {

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
        isPremium: true
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


export const premiumService = {
    getPremiumPost
}