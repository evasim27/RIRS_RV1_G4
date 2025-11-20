import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		await connectDB();

		// Find the book
		const book = await Book.findById(id);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		// Check if user already reserved this book
		if (book.reservedBy?.toString() === session.user.id) {
			return NextResponse.json(
				{ error: "You have already reserved this book" },
				{ status: 400 }
			);
		}

		// Check if book already has a reservation
		if (book.reservedBy) {
			return NextResponse.json(
				{ error: "Book is already reserved by another user" },
				{ status: 400 }
			);
		}

		// Set reservation
		const reservedDate = new Date();

		book.reservedBy = session.user.id as any;
		book.reservedDate = reservedDate;
		await book.save();

		return NextResponse.json(
			{
				message: "Book reserved successfully",
				book,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error reserving book:", error);
		return NextResponse.json(
			{ error: "Failed to reserve book" },
			{ status: 500 }
		);
	}
}

// Cancel reservation
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;

		await connectDB();

		// Find the book
		const book = await Book.findById(id);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		// Check if book has a reservation
		if (!book.reservedBy) {
			return NextResponse.json(
				{ error: "Book is not currently reserved" },
				{ status: 400 }
			);
		}

		// Check if current user is the one who reserved it (or is admin/librarian)
		const userRole = session.user.role;
		if (
			book.reservedBy?.toString() !== session.user.id &&
			userRole !== "admin" &&
			userRole !== "librarian"
		) {
			return NextResponse.json(
				{ error: "You can only cancel your own reservations" },
				{ status: 403 }
			);
		}

		// Clear reservation
		book.reservedBy = undefined;
		book.reservedDate = undefined;
		await book.save();

		return NextResponse.json(
			{
				message: "Reservation cancelled successfully",
				book,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error cancelling reservation:", error);
		return NextResponse.json(
			{ error: "Failed to cancel reservation" },
			{ status: 500 }
		);
	}
}
