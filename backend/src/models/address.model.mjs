import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
	state: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	pincode: {
		type: String,
		required: true,
	},
	locality: {
		type: String,
	},
});

export const Address = mongoose.model("Address", addressSchema);
