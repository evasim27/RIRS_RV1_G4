import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Reservation from "@/models/Reservation";
import Book from "@/models/Book";
import User from "@/models/User";

// GET - Retrieve all reservations (librarian/admin only)
export async function GET(request: NextRequest) {
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

		const { searchParams } = new URL(request.url);
		const statusFilter = searchParams.get("status") || "all";
		const search = searchParams.get("search") || "";

		// Build query
		const query: any = {};

		// Filter by status
		if (statusFilter !== "all") {
			query.status = statusFilter;
		}

		// Get all reservations with populated user and book data
		let reservations = await Reservation.find(query)
			.populate({
				path: "userId",
				select: "firstName lastName email",
			})
			.populate({
				path: "bookId",
				select: "title author coverImage",
			})
			.sort({ createdAt: -1 });

		// Apply search filter if provided
		if (search) {
			reservations = reservations.filter((reservation: any) => {
				const userName =
					`${reservation.userId?.firstName} ${reservation.userId?.lastName}`.toLowerCase();
				const bookTitle = reservation.bookId?.title?.toLowerCase() || "";
				const searchLower = search.toLowerCase();
				return (
					userName.includes(searchLower) || bookTitle.includes(searchLower)
				);
			});
		}

		return NextResponse.json(reservations);
	} catch (error: unknown) {
		console.error("Get reservations error:", error);
		return NextResponse.json(
			{
				message: "Failed to retrieve reservations",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// POST - Create a new reservation (for users)
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const body = await request.json();
		const { bookId } = body;

		if (!bookId) {
			return NextResponse.json(
				{ message: "Book ID is required" },
				{ status: 400 }
			);
		}

		// Check if book exists
		const book = await Book.findById(bookId);
		if (!book) {
			return NextResponse.json({ message: "Book not found" }, { status: 404 });
		}

		// Check if user already has an active reservation for this book
		const existingReservation = await Reservation.findOne({
			userId: session.user.id,
			bookId: bookId,
			status: { $in: ["Pending", "Confirmed"] },
		});

		if (existingReservation) {
			return NextResponse.json(
				{ message: "You already have an active reservation for this book" },
				{ status: 400 }
			);
		}

		// Create reservation
		const reservation = await Reservation.create({
			userId: session.user.id,
			bookId: bookId,
			status: "Pending",
			reservationDate: new Date(),
		});

		const populatedReservation = await Reservation.findById(reservation._id)
			.populate("userId", "firstName lastName email")
			.populate("bookId", "title author coverImage");

		return NextResponse.json({
			message: "Reservation created successfully",
			reservation: populatedReservation,
		});
	} catch (error: unknown) {
		console.error("Create reservation error:", error);
		return NextResponse.json(
			{
				message: "Failed to create reservation",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
