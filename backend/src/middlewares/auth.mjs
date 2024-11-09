import jwt, { decode } from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.mjs";
import ApiError from "../utils/ApiError.mjs";
import { User } from "../models/user.model.mjs";

const verifyJWT = asyncHandler(async (req, _, next) => {
	try {
		const token = req.cookies?.accessToken;
		if (!token) {
			throw new ApiError(401, "token invalid or not found");
		}
		const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
		const user = await User.findById(decodeToken?._id).select(
			"-passcode -refreshToken"
		);
		if (!user) {
			throw new ApiError(401, "Unauthorized user");
		}

		req.user = user;
		next();
	} catch (error) {
		throw new ApiError(401, "Invalid Access Token : " + error.message);
	}
});

export default verifyJWT;
