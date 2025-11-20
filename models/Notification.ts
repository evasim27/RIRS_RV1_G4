import mongoose, { Document, Model, Schema } from "mongoose";

export interface INotification extends Document {
	userId: mongoose.Types.ObjectId;
	bookId: mongoose.Types.ObjectId;
	type: "reminder" | "overdue";
	message: string;
	read: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
		},
		bookId: {
			type: Schema.Types.ObjectId,
			ref: "Book",
			required: [true, "Book ID is required"],
		},
		type: {
			type: String,
			enum: {
				values: ["reminder", "overdue"],
				message: "Type must be either reminder or overdue",
			},
			required: [true, "Type is required"],
		},
		message: {
			type: String,
			required: [true, "Message is required"],
			trim: true,
		},
		read: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, bookId: 1, type: 1 });

// Prevent model recompilation during hot reload in development
const Notification: Model<INotification> =
	mongoose.models.Notification ||
	mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
