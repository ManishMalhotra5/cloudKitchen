import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		id: {
			type: String,
			required: [true, "Order Id is required"],
			unique: true,
		},
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
		invoicePDF: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

export const Order = mongoose.model("Order", orderSchema);
