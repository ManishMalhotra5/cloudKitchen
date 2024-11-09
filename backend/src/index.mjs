import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/connectDB.mjs";
import app from "./app.mjs";
import createSuperAdmin from "./config/createSuperAdmin.mjs";

const PORT = `${process.env.PORT}`;

connectDB().then(() => {
	try {
		console.log("Starting  Server...");
		app.listen(PORT, () => {
			console.log(`Server started successfully at ${PORT}`);
			createSuperAdmin();
		});
	} catch (error) {
		console.log("Failed to start Server : " + error);
	}
});
