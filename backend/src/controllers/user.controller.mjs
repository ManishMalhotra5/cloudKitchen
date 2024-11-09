import ApiError from "../utils/ApiError.mjs";
import ApiResponse from "../utils/ApiResponse.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { User } from "../models/user.model.mjs";
import { uploadOnCloudinary } from "../utils/cloudinary.mjs";

const generateTokens = async (userId) => {
	try {
		const user = await User.findById(userId);
		const accessToken = user.generateAccessToken();
		const refreshToken = user.generateRefreshToken();
		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });
		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Unable to generate Access and refresh token " + error.message
		);
	}
};

const options = {
	httpOnly: true,
	secure: true,
};

const registerUser = asyncHandler(async (req, res) => {
	const { email, password, username } = req.body;
	if (!email) {
		throw new ApiError(402, "Email is required");
	}
	if (!password) {
		throw new ApiError(402, "Password is required");
	}
	if (!username) {
		throw new ApiError(402, "Username is required");
	}
	const existedUser = await User.findOne({ email });
	if (existedUser) {
		throw new ApiError(403, "User with email already existed");
	}

	let profile;

	if (req.file) {
		const localFilePath = req.file.path;
		profile = await uploadOnCloudinary(localFilePath);
	}
	const user = await User.create({
		email: email,
		password: password,
		username: username,
	});

	if (profile) {
		user.profile = profile.url;
		await user.save({ validateBeforeSave: false });
	}

	return res.status(200).json(new ApiResponse(200, "Register successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
	const { email, password } = req.body;

	if (!email) {
		throw new ApiError(403, "Email is required to login");
	}
	if (!password) {
		throw new ApiError(403, "Password is required");
	}

	const user = await User.findOne({ email });
	if (!user) {
		throw new ApiError(404, "User with this email doesn't exist");
	}
	const isPasswordValid = user.isPasswordCorrect(password);
	if (!isPasswordValid) {
		throw new ApiError(401, "Password is incorrect");
	}
	const { accessToken, refreshToken } = await generateTokens(user._id);
	const loggedUser = await User.findById(user._id).select(
		"-password -refreshToken -isAdmin -isSuperAdmin"
	);
	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user: loggedUser,
					accessToken,
					refreshToken,
				},
				"User loged in successfully"
			)
		);
});

const refreshAcessToken = asyncHandler(async (req, res) => {
	const incommingToken = req.cookies.refreshToken;
	if (!incommingToken) {
		throw new ApiError(401, "Refresh token not found");
	}
	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ApiError(403, "Unauthoried user");
	}
	if (incommingToken !== user.refreshToken) {
		throw new ApiError(403, "unauthorized user wrong token");
	}

	const { accessToken, refreshToken } = await generateTokens(user._id);

	return res.status(200).json(
		new ApiResponse(
			200,
			{
				refresToken: accessToken,
				accessToken: refreshToken,
			},
			" Access token refreshed successfully"
		)
	);
});

const getCurrentUser = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(401, "unauthorized request no user is logged in");
	}
	const user = await User.findById(req.user._id).select(
		"-passcode -refreshToken -isAdmn -isSuperAdmin"
	);

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ user },
				"successfully fetch the current user"
			)
		);
});

const deleteUser = asyncHandler(async (req, res) => {
	const user = req.user;
	if (!user) {
		throw new ApiError(403, "unauthorized request");
	}
	await User.findByIdAndDelete(user._id);
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{},
				"User Account has been deleted successfully"
			)
		);
});

const updateUserName = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unathorized request you can't make updation");
	}
	const { firstName, lastName } = req.body;

	if (!firstName) {
		throw new ApiError(401, "Can't set name to empty ");
	}

	const user = await User.findById(req.user?._id).select(
		"-passcode -refreshToken -isAdmn -isSuperAdmin"
	);
	user.firstName = firstName;
	user.lastName = lastName;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User name changed successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}
	if (!req.file) {
		throw new ApiError(404, "Profile not");
	}

	const localFilePath = req.file.path;

	if (!localFilePath) {
		throw new ApiError(500, "Failed to load to profile");
	}

	const profile = await uploadOnCloudinary(localFilePath);

	if (!profile) {
		throw new ApiError(500, "Failed to upload on cloud");
	}

	const user = await User.findById(req.user._id);
	user.profile = profile;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Profile updated successfully"));
});

const updateUsername = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request");
	}
	const { username } = req.body;
	if (!username) {
		throw new ApiError(401, "Can't set username empty");
	}
	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ApiError(403, "Unable to locate user unathorized request");
	}
	user.username = username;
	await user.save({ validateBeforeSave: false });
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{},
				`Username has been changed to ${username} successfully`
			)
		);
});

const updatePassword = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unathorized request you can't make updation");
	}
	const { currentPassword, newPassword } = req.body;
	console.log(currentPassword, newPassword);
	if (!currentPassword) {
		throw new ApiError(401, "Please Enter current passcode");
	}

	const user = await User.findById(req.user?._id);

	const isPasswordValid = await user.isPasswordCorrect(currentPassword);

	if (!isPasswordValid) {
		throw new ApiError(
			403,
			"Passcode is wrong please provide right passcode"
		);
	}

	if (!newPassword) {
		throw new ApiError(401, "Can't set passcode to empty ");
	}

	user.password = newPassword;

	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "User passcode changed successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
	await User.findByIdAndUpdate(req.user?._id, {
		$unset: {
			refreshToken: "",
		},
	});
	return res
		.status(200)
		.clearCookie("accessToken", options)
		.clearCookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "Logout successfully"));
});

const deleteUserByAdmin = asyncHandler(async (req, res) => {
	if (!req.user.isAdmin) {
		throw new ApiError(401, "You are not authorized to delete the user");
	}
	const { username } = req.params;

	if (!username) {
		throw new ApiError(404, "username is required");
	}

	await User.findOneAndDelete({ username });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Successfully deleted the user"));
});

const makeAdminExistedUser = asyncHandler(async (req, res) => {
	if (!req.user.isAdmin) {
		throw new ApiError(401, "You are not authorized to delete the user");
	}
	const { username } = req.params;
	if (!username) {
		throw new ApiError(404, "username is required");
	}
	const user = await User.findOne({ user });
	if (!user) {
		throw new ApiError(404, "User with give username not found");
	}
	user.isAdmin = true;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Successfully made admin"));
});

const removeAdminExistedUser = asyncHandler(async (req, res) => {
	if (!req.user.isSuperAdmin) {
		throw new ApiError(401, "You are not authorized to delete the user");
	}
	const { username } = req.params;
	if (!username) {
		throw new ApiError(404, "username is required");
	}
	const user = await User.findOne({ user });
	if (!user) {
		throw new ApiError(404, "User with give username not found");
	}
	user.isAdmin = false;
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Successfully removed admin"));
});

export {
	registerUser,
	loginUser,
	deleteUser,
	refreshAcessToken,
	getCurrentUser,
	updateUserName,
	updatePassword,
	updateUsername,
	logoutUser,
	deleteUserByAdmin,
	updateProfile,
	removeAdminExistedUser,
	makeAdminExistedUser,
};
