import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBook extends Document {
	title: string;
	author: string;
	description: string;
	category: string;
	status: "Available" | "Borrowed";
	coverImage?: string;
	publicationDate?: Date;
	isbn?: string;
	createdAt: Date;
	updatedAt: Date;
}

const BookSchema: Schema<IBook> = new Schema(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			minlength: [1, "Title must be at least 1 character"],
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		author: {
			type: String,
			required: [true, "Author is required"],
			trim: true,
			minlength: [1, "Author must be at least 1 character"],
			maxlength: [100, "Author cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters"],
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		status: {
			type: String,
			required: [true, "Status is required"],
			enum: {
				values: ["Available", "Borrowed"],
				message: "Status must be either Available or Borrowed",
			},
			default: "Available",
		},
		coverImage: {
			type: String,
			trim: true,
		},
		publicationDate: {
			type: Date,
		},
		isbn: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

// Prevent model recompilation during hot reload in development
const Book: Model<IBook> =
	mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);

export default Book;
