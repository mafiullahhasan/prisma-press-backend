import { prisma } from "../../lib/prisma"
import config from "../../config"
import bcrypt from "bcryptjs"
import { IRegisterUser } from "./user.interface"
import { ApiError } from "../../utils/ApiError"
import httpStatus from "http-status"


const registerUser = async (payload: IRegisterUser) => {
    const { name, email, password, profilePhoto } = payload;

    const existedUser = await prisma.user.findUnique({
        where: { email }
    })

    if (existedUser) {
        throw new ApiError(httpStatus.CONFLICT, "User already exists with this email")
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_Salt_rounds))

    // Nested create runs as one atomic query: user + profile are created together or not at all
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            profile: {
                create: { profilePhoto }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })

    return user

}

const getMyProfile = async (userId: string) => {

    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id: userId
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })

    return user

}

const updateMyProfile = async (userId: string, payload: any) => {
    const { name, email, profilePhoto, bio } = payload

    const updatedUser = await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            name,
            email,
            profile: {
                update: {
                    profilePhoto,
                    bio
                }
            }
        },
        omit: {
            password: true
        },
        include: {
            profile: true
        }
    })

    return updatedUser
}

export const userService = {
    registerUser,
    getMyProfile,
    updateMyProfile
}