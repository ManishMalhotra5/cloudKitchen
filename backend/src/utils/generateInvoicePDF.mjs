import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { uploadOnCloudinary } from "./cloudinary.mjs";
import ApiError from "./ApiError.mjs";

const generateInvoicePDF = async (order) => {
	const tempDir = path.join(__dirname, "public", "temp");
	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir, { recursive: true });
	}

	const filePath = path.join(tempDir, `invoice_${order.id}.pdf`);
	const doc = new PDFDocument();

	doc.pipe(fs.createWriteStream(filePath));

	// PDF Header
	doc.fontSize(20).text("Invoice", { align: "center" });
	doc.moveDown();

	// Order Details
	doc.fontSize(12).text(`Order ID: ${order.id}`);
	doc.text(`Date: ${order.date.toDateString()}`);
	doc.moveDown();

	// Product Details
	doc.text(`Product: ${order.product.title}`);
	doc.text(`Price: $${order.product.price}`);
	doc.moveDown();

	// Address
	doc.text("Shipping Address:");
	doc.text(
		`${order.address.street}, ${order.address.city}, ${order.address.zip}`
	);
	doc.moveDown();

	doc.end();

	const file = await uploadOnCloudinary(filePath);
	if (!file) {
		throw new ApiError(500, "Failed to upload on cloudinary");
	}

	return file.url;
};

export default generateInvoicePDF;
