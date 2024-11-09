import mongoose from "mongoose";

const connectDB = async () => {
	try {
		console.log("Connecting to Database...");
		const connectionString = `${process.env.DB_URI}/${process.env.DB_NAME}`;
		const connectionObj = await mongoose.connect(connectionString);
		console.log("Connected to Database : " + connectionObj.connection.host);
	} catch (error) {
		console.log("Failed to connect with Database " + error);
	}
};

export default connectDB;
