import { Request, Response } from "express"
import httpStatus from "http-status"
import { userService } from "./user.service.js"
import { asyncHandler } from "../../utils/asyncHandler.js"
import { ApiResponse } from "../../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = await userService.registerUser(payload);

    res.status(httpStatus.CREATED).json(
        new ApiResponse(
            httpStatus.CREATED,
            user,
            "User Registered Successfully"
        )
    );
});

const getMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id

    const user = await userService.getMyProfile(userId as string)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, user, "User Retrived successfully")
    )

})

const updateMyProfile = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id
    const payload = req.body

    const updateProfile = await userService.updateMyProfile(userId as string, payload)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, updateProfile, "User Updated Successfully!")
    )
})



export const userController = {
    registerUser,
    getMyProfile,
    updateMyProfile
}