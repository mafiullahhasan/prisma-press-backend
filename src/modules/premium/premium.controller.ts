import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { premiumService } from "./premium.service";
import httpStatus from "http-status"
import { ApiResponse } from "../../utils/ApiResponse";

const getPremiumPost = asyncHandler(async (req: Request, res: Response) => {

    const query = req.query

    const result = await premiumService.getPremiumPost(query)

    res.status(httpStatus.OK).json(
        new ApiResponse(httpStatus.OK, result.data,
            "Premium Posts Retrieved Successfully",
            {
                page: result.meta.page,
                limit: result.meta.limit,
                total: result.meta.totalPostCount
            })
    )
})


export const premiumController = {
    getPremiumPost
}