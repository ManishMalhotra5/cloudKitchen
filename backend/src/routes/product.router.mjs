import { Router } from "express";
import verifyJWT from "../middlewares/auth.mjs";
import AdminAuth from "../middlewares/AdminAuth.mjs";
import upload from "../middlewares/multer.middleware.mjs";

const router = Router();

import {
	addProduct,
	removeProduct,
	makeOrder,
	getSomeProducts,
	addToCart,
	search,
	addReview,
	downloadInvoice,
} from "../controllers/product.controller.mjs";

router
	.route("/add")
	.post(upload.single("picture"), verifyJWT, AdminAuth, addProduct);
router.route("/remove/:id").delete(verifyJWT, AdminAuth, removeProduct);
router.route("/get-some").get(getSomeProducts);
router.route("/buy/:id").post(verifyJWT, makeOrder);
router.route("/add-to-cart/:id").post(verifyJWT, addToCart);
router.route("/search").get(search);
router.route("/add-review").post(verifyJWT, addReview);
router.route("/download-invoice/:orderID").get(verifyJWT, downloadInvoice);

export default router;
