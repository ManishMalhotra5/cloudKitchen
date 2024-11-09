import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	id: {
		type: String,
		required: [true, "Product ID is required"],
		unique: [true, "Product ID has to be unique"],
	},
	title: {
		type: String,
		required: [true, "Product Title is required"],
	},
	discription: {
		type: String,
	},
	picture: {
		type: String,
		required: [true, "Product picture is required"],
	},
	provider: {
		type: String,
	},
	price: {
		type: Number,
		required: [true, "Product price is required"],
	},
	rating: {
		type: Number,
	},
	reviews: [
		{
			author: {
				type: String,
				required: true,
			},
			review: {
				type: String,
				required: [true, "Empty review is not allowed"],
			},
		},
	],
});

export const Product = mongoose.model("Product", productSchema);
