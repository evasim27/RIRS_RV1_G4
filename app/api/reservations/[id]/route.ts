import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Book from "@/models/Book";

// PATCH - Confirm pickup (converts reservation to borrowed book)
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		// Check if user is authenticated and is a librarian or admin
		if (
			!session ||
			(session.user.role !== "librarian" && session.user.role !== "admin")
		) {
			return NextResponse.json(
				{
					message:
						"Unauthorized access. Librarian or Admin privileges required.",
				},
				{ status: 401 }
			);
		}

		await connectDB();

		const { id } = await params;
		const reservationId = id;

		// Find reservation
		const reservation = await Reservation.findById(reservationId).populate(
			"bookId userId"
		);

		if (!reservation) {
			return NextResponse.json(
				{ message: "Reservation not found" },
				{ status: 404 }
			);
		}

		if (reservation.status !== "Pending") {
			return NextResponse.json(
				{
					message: `Cannot confirm ${reservation.status.toLowerCase()} reservation`,
				},
				{ status: 400 }
			);
		}

		// Get the book
		const book = await Book.findById(reservation.bookId);

		if (!book) {
			return NextResponse.json({ message: "Book not found" }, { status: 404 });
		}

		if (book.status === "Borrowed") {
			return NextResponse.json(
				{ message: "Book is already borrowed" },
				{ status: 400 }
			);
		}

		// Update book to borrowed status
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 14); // 14 days borrowing period

		book.status = "Borrowed";
		book.borrowedBy = reservation.userId;
		book.borrowedDate = new Date();
		book.dueDate = dueDate;
		await book.save();

		// Update reservation status to Confirmed
		reservation.status = "Confirmed";
		await reservation.save();

		return NextResponse.json({
			message: "Pickup confirmed. Book is now borrowed.",
			reservation,
			book: {
				_id: book._id,
				title: book.title,
				status: book.status,
				borrowedBy: book.borrowedBy,
				dueDate: book.dueDate,
			},
		});
	} catch (error: unknown) {
		console.error("Confirm pickup error:", error);
		return NextResponse.json(
			{
				message: "Failed to confirm pickup",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Cancel reservation
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		// Check if user is authenticated and is a librarian or admin
		if (
			!session ||
			(session.user.role !== "librarian" && session.user.role !== "admin")
		) {
			return NextResponse.json(
				{
					message:
						"Unauthorized access. Librarian or Admin privileges required.",
				},
				{ status: 401 }
			);
		}

		await connectDB();

		const { id } = await params;
		const reservationId = id;

		// Find reservation
		const reservation = await Reservation.findById(reservationId);

		if (!reservation) {
			return NextResponse.json(
				{ message: "Reservation not found" },
				{ status: 404 }
			);
		}

		// Update reservation status to Cancelled
		reservation.status = "Cancelled";
		await reservation.save();

		return NextResponse.json({
			message: "Reservation cancelled successfully",
			reservation,
		});
	} catch (error: unknown) {
		console.error("Cancel reservation error:", error);
		return NextResponse.json(
			{
				message: "Failed to cancel reservation",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
