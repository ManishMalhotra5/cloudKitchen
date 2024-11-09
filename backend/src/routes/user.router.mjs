import { Router } from "express";

const router = Router();

import {
	deleteUser,
	deleteUserByAdmin,
	getCurrentUser,
	loginUser,
	logoutUser,
	makeAdminExistedUser,
	refreshAcessToken,
	registerUser,
	removeAdminExistedUser,
	updatePassword,
	updateProfile,
	updateUsername,
	updateUserName,
} from "../controllers/user.controller.mjs";

import verifyJWT from "../middlewares/auth.mjs";
import SuperAdminAuth from "../middlewares/SuperAdminAuth.mjs";
import AdminAuth from "../middlewares/AdminAuth.mjs";
import upload from "../middlewares/multer.middleware.mjs";
import createAdmin from "../config/createAdmin.mjs";

router.route("/register").post(upload.single("profile"), registerUser);
router.route("/login").post(loginUser);

router.route("/refresh-access-token").post(verifyJWT, refreshAcessToken);
router.route("/delete-account").delete(verifyJWT, deleteUser);
router.route("/get-current-user").get(verifyJWT, getCurrentUser);
router.route("/update-name").put(verifyJWT, updateUserName);
router.route("/update-password").put(verifyJWT, updatePassword);
router.route("/update-username").put(verifyJWT, updateUsername);
router
	.route("/update-profile")
	.put(verifyJWT, upload.single("profile"), updateProfile);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/register-admin").post(verifyJWT, SuperAdminAuth, createAdmin);
router
	.route("/admin/delete-account")
	.delete(verifyJWT, AdminAuth, deleteUserByAdmin);
router
	.route("/admin/make-admin")
	.put(verifyJWT, AdminAuth, makeAdminExistedUser);
router
	.route("/super-admin/remove-admin")
	.put(verifyJWT, SuperAdminAuth, removeAdminExistedUser);

export default router;
