import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authService } from "./auth.service";
import { ApiResponse } from "../../utils/ApiResponse";
import httpStatus from "http-status"


const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body

    const { accessToken, refreshToken } = await authService.loginUser(payload)

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 * 7
    })

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, {
            accessToken,
            refreshToken
        }, "User Logged in Successfully")
    )
})

const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken

    const { accessToken } = await authService.refreshToken(refreshToken)

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    })
    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, { accessToken }, "New Access Token Generated")
    )

})

export const authController = {
    loginUser,
    refreshToken
}