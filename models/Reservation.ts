import mongoose, { Document, Model, Schema } from "mongoose";

export interface IReservation extends Document {
	userId: mongoose.Types.ObjectId;
	bookId: mongoose.Types.ObjectId;
	status: "Pending" | "Confirmed" | "Cancelled";
	reservationDate: Date;
	createdAt: Date;
	updatedAt: Date;
}

const ReservationSchema: Schema<IReservation> = new Schema(
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
		status: {
			type: String,
			enum: {
				values: ["Pending", "Confirmed", "Cancelled"],
				message: "Status must be Pending, Confirmed, or Cancelled",
			},
			default: "Pending",
			required: [true, "Status is required"],
		},
		reservationDate: {
			type: Date,
			required: [true, "Reservation date is required"],
		},
	},
	{
		timestamps: true,
	}
);

// Index for faster queries
ReservationSchema.index({ userId: 1, status: 1 });
ReservationSchema.index({ bookId: 1, status: 1 });
ReservationSchema.index({ status: 1, createdAt: -1 });

// Prevent model recompilation during hot reload in development
const Reservation: Model<IReservation> =
	mongoose.models.Reservation ||
	mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
