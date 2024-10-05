import jsonwebtoken from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import apiError from "../utils/apiError.js";
import { User } from "../models/user.models.js";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return next(new apiError(200, 'Cookie or Authorization header is missing'));
    }
    const decodedToken = jsonwebtoken.verify(token, process.env.ACCESS_TOKEN);
    if (!decodedToken) {
      return next(new apiError(200, 'Invalid token'));
    }
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
      return next(new apiError(401, "Invalid Access Token"));
    }
    req.user = user;
    next();
  } catch (error) {
    return next(new apiError(401, error?.message || "Invalid access token"));
  }
});