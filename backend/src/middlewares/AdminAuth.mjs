import ApiError from "../utils/ApiError.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";

const AdminAuth = asyncHandler(async (req, _, next) => {
	if (req.user.isAdmin || req.user.isSuperAdmin) {
		return next();
	} else {
		throw new ApiError(
			403,
			"Unauthorized Access Super user login required"
		);
	}
});

export default AdminAuth;
