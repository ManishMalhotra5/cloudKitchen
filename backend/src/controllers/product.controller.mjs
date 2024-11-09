import { Address } from "../models/address.model.mjs";
import { Order } from "../models/order.model.mjs";
import { Product } from "../models/product.model.mjs";
import { User } from "../models/user.model.mjs";
import ApiError from "../utils/ApiError.mjs";
import ApiResponse from "../utils/ApiResponse.mjs";
import asyncHandler from "../utils/asyncHandler.mjs";
import { uploadOnCloudinary } from "../utils/cloudinary.mjs";
import { v4 as uuidv4 } from "uuid";
import generateInvoicePDF from "../utils/generateInvoicePDF.mjs";

const addProduct = asyncHandler(async (req, res) => {
	if (!(req.user && req.user.isAdmin)) {
		throw new ApiError(
			403,
			"Unauthorized request : Only admin can add product"
		);
	}
	const { id, title, discription, provider, price } = req.body;
	const product = await Product.findOne({ id });
	if (product) {
		throw new ApiError(401, "Product with id already exist");
	}
	if (!req.file) {
		throw new ApiError(404, "Product picture not found");
	}
	const localFilePath = req.file.path;
	if (!localFilePath) {
		throw new ApiError(500, "Failed to load to picture");
	}

	const picture = await uploadOnCloudinary(localFilePath);
	if (!picture) {
		throw new ApiError(500, "Failed to upload product picture on cloud");
	}

	const newProduct = await Product.create({
		id: id,
		title: title,
		discription: discription,
		provider: provider,
		price: price,
		picture: picture.url,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Product added successfully"));
});

const removeProduct = asyncHandler(async (req, res) => {
	if (!(req.user && req.user.isAdmin)) {
		throw new ApiError(
			403,
			"Unauthorized request : Only admin can remove the product"
		);
	}

	const { id } = req.params;
	if (!id) {
		throw new ApiError(404, "Product Id not found");
	}
	await Product.findOneAndDelete({ id });

	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Product removed successfully"));
});

const makeOrder = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request : You need to login");
	}
	const { id } = req.params;
	const { state, city, pincode, locality } = req.body;
	if (!id) {
		throw new ApiError(404, "Product Id not found");
	}
	if (!(state && city && pincode)) {
		throw new ApiError(404, "Address is not found missing details");
	}

	const address = await Address.create({
		state: state,
		city: city,
		pincode: pincode,
		locality: locality,
	});
	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ApiError(500, "Failed to fetch the user");
	}
	const product = await Product.findOne({ id });
	if (!product) {
		throw new ApiError(404, "Product with given Id is not found");
	}
	const orderID = uuidv4();
	const order = await Order.create({
		id: orderID,
		product: product,
		address: address,
		date: new Date(),
	});
	const invoicePDF = await generateInvoicePDF(order);
	if (!invoicePDF) {
		throw new ApiError(500, "Failed to generate Invoice document");
	}
	order.invoicePDF = invoicePDF;
	order.save({ validateBeforeSave: false });
	user.orders.push(order);
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ product },
				"Congratulations! Product is your's"
			)
		);
});

const addToCart = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request : You need to login");
	}
	const { id } = req.params;
	if (!id) {
		throw new ApiError(404, "Product Id not found");
	}
	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ApiError(500, "Failed to fetch the user");
	}
	const product = await Product.findOne({ id });
	if (!product) {
		throw new ApiError(404, "Product with given Id is not found");
	}
	user.cart.push(product);
	await user.save({ validateBeforeSave: false });

	return res
		.status(200)
		.json(new ApiResponse(200, { product }, "Successfully added to cart"));
});

const getSomeProducts = asyncHandler(async (req, res) => {
	const products = await Product.find().limit(20);
	if (!products || products.length === 0) {
		throw new ApiError(404, "No movies found");
	}
	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				{ products },
				"Fetched some products successfully"
			)
		);
});

const search = asyncHandler(async (req, res) => {
	const { title } = req.query;
	if (!title) {
		throw new ApiError(404, "Please provide title ");
	}
	const query = {};
	if (title) {
		query.title = { $regex: title, $options: "i" };
	}
	const products = await Product.find({ query });

	if (products.length === 0) {
		throw new ApiError(404, "Movie not found");
	}

	res.status(200).json(
		new ApiResponse(200, { products }, "Movies fetched successfully")
	);
});

const addReview = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request : You need to login");
	}
	const { id } = req.params;
	const { review, rating } = req.body;
	if (!review) {
		throw new ApiError(404, "Empty shouldn't be empty");
	}
	if (!rating) {
		throw new ApiError(404, "Please provide rating");
	}
	if (!id) {
		throw new ApiError(404, "Product Id not found");
	}

	const user = await User.findById(req.user._id);
	if (!user) {
		throw new ApiError(500, "Failed to fetch the user");
	}
	const product = await Product.findOne({ id });
	if (!product) {
		throw new ApiError(404, "Product with given Id is not found");
	}

	const newReview = {
		author: user.username,
		review: review,
	};
	product.reviews.push(newReview);
	product.rating = rating;
	await product.save({ validateBeforeSave: false });
	return res
		.status(200)
		.json(new ApiResponse(200, {}, "Successfully added the review"));
});

const downloadInvoice = asyncHandler(async (req, res) => {
	if (!req.user) {
		throw new ApiError(403, "Unauthorized request : You need to login");
	}
	const { orderID } = req.params;
	if (!orderID) {
		throw new ApiError(404, "Order Id not found");
	}
	const order = await Order.findOne({ id: orderID });
	if (!order.invoicePDF) {
		throw new ApiError(404, "Invoice document not found");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, { invoice: order.invoicePDF }),
			"Invoice fetched successfully"
		);
});

export {
	addProduct,
	removeProduct,
	makeOrder,
	getSomeProducts,
	addToCart,
	search,
	addReview,
	downloadInvoice,
};
