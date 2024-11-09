import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import ApiError from "./ApiError.mjs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateInvoicePDF = async (order, user) => {
	try {
		const tempDir = path.join(__dirname, "..", "..", "public", "temp");
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

		doc.text(`Customer: ${user.firstName || user.username}`);
		doc.text(`email: ${user.email}`);
		doc.moveDown();
		// Address
		doc.text("Shipping Address:");
		doc.text(
			`${order.address.state}, ${order.address.city}, ${order.address.pincode}`
		);
		doc.moveDown();

		// End PDF document creation
		doc.end();

		return filePath;
	} catch (error) {
		throw new ApiError(500, "Failed to generate invoice for order" + error);
	}
};

export default generateInvoicePDF;
