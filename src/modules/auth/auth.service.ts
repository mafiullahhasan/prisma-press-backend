import bcrypt from "bcryptjs"
import { prisma } from "../../lib/prisma.js"
import { ILoginUser } from "./auth.interface.js"
import { ApiError } from "../../utils/ApiError.js"
import httpStatus from "http-status"
import config from "../../config/index.js"
import { createToken, verifyToken } from "../../utils/jwt.js"


const loginUser = async (payload: ILoginUser) => {

    const { email, password } = payload
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            email
        },
    })

    if (user.activeStatus === "BLOCKED") {
        throw new ApiError(
            httpStatus.FORBIDDEN,
            "Your account has been blocked. Please contact support."
        );
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password)

    if (!isPasswordMatched) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid user credentials")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const accessToken = createToken(jwtPayload, config.jwt_access_secret, config.jwt_access_expires_in)

    const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret, config.jwt_refresh_expires_in)

    return {
        accessToken,
        refreshToken
    }
}

const refreshToken = async (refreshToken: string) => {
    const verifiedRefreshToken = verifyToken(refreshToken, config.jwt_refresh_secret)

    if (!verifiedRefreshToken) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid Refresh Token!")
    }

    const { id } = verifiedRefreshToken

    const user = await prisma.user.findUniqueOrThrow({
        where: { id },
    })

    if (user.activeStatus === "BLOCKED") {
        throw new ApiError(httpStatus.UNAUTHORIZED, "User is blocked!")
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

    const accessToken = createToken(
        jwtPayload,
        config.jwt_access_secret,
        config.jwt_access_expires_in
    )

    return { accessToken }


}


export const authService = {
    loginUser,
    refreshToken
}