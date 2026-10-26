import { prisma } from "../../lib/prisma"
import config from "../../config"
import bcrypt from "bcryptjs"
import { IRegisterUser } from "./user.interface"


const registerUser = async (payload: IRegisterUser) => {
    const { name, email, password, profilePhoto } = payload;
    const existedUser = await prisma.user.findUniqueOrThrow({
        where: {
            email: email
        }
    })

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_Salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    })

    if (!createdUser) {
        throw new Error("User created failed")
    }

    await prisma.profile.create({
        data: {
            userId: createdUser.id,
            profilePhoto: profilePhoto
        }
    })

    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email
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