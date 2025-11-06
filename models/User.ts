import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	role: "user" | "librarian" | "admin";
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
	{
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
			minlength: [2, "First name must be at least 2 characters"],
			maxlength: [50, "First name cannot exceed 50 characters"],
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
			minlength: [2, "Last name must be at least 2 characters"],
			maxlength: [50, "Last name cannot exceed 50 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email address",
			],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
		},
		role: {
			type: String,
			enum: ["user", "librarian", "admin"],
			default: "user",
			required: [true, "Role is required"],
		},
	},
	{
		timestamps: true,
	}
);

// Prevent model recompilation during hot reload in development
const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
