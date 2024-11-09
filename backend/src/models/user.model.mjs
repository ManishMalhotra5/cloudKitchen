import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, "Username is required"],
			unique: [true, "Username has to be unique"],
			lowercase: true,
			trim: true,
		},
		firstName: {
			type: String,
		},
		lastName: {
			type: String,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: [true, "Email has to be unique"],
			lowercase: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
		},
		profile: {
			type: String,
		},
		refreshToken: {
			type: String,
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
		isSuperAdmin: {
			type: Boolean,
			default: false,
		},
		address: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Address",
		},
		cart: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Product",
			},
		],
		orders: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Order",
			},
		],
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next;
	this.password = await bcrypt.hash(this.password, 10);
	next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
		},
		process.env.ACCESS_TOKEN_KEY,
		{
			expiresIn: process.env.ACCESS_TOKEN_EX,
		}
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_KEY,
		{
			expiresIn: process.env.REFRESH_TOKEN_EX,
		}
	);
};

export const User = mongoose.model("User", userSchema);
