import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReview extends Document {
	bookId: mongoose.Types.ObjectId;
	userId: mongoose.Types.ObjectId;
	rating: number;
	comment: string;
	createdAt: Date;
	updatedAt: Date;
}

const ReviewSchema: Schema<IReview> = new Schema(
	{
		bookId: {
			type: Schema.Types.ObjectId,
			ref: "Book",
			required: [true, "Book ID is required"],
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
		},
		comment: {
			type: String,
			required: [true, "Comment is required"],
			trim: true,
			minlength: [10, "Comment must be at least 10 characters"],
			maxlength: [1000, "Comment cannot exceed 1000 characters"],
		},
	},
	{
		timestamps: true,
	}
);

// Create compound index to ensure one review per user per book
ReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true });

// Prevent model recompilation during hot reload in development
const Review: Model<IReview> =
	mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
