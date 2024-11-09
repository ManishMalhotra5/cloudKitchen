import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));

import userRoutes from "./routes/user.router.mjs";
import productRoutes from "./routes/product.router.mjs";

app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);

export default app;
