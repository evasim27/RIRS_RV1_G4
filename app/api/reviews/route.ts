import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Review from "@/models/Review";
import Book from "@/models/Book";

// Helper function to recalculate book average rating
async function updateBookRating(bookId: string) {
	const reviews = await Review.find({ bookId });
	const reviewCount = reviews.length;
	const averageRating =
		reviewCount > 0
			? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
			: 0;

	await Book.findByIdAndUpdate(bookId, {
		averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
		reviewCount,
	});
}

// GET - Fetch reviews for a book
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const searchParams = request.nextUrl.searchParams;
		const bookId = searchParams.get("bookId");

		if (!bookId) {
			return NextResponse.json(
				{ error: "Book ID is required" },
				{ status: 400 }
			);
		}

		const reviews = await Review.find({ bookId })
			.populate("userId", "firstName lastName email")
			.sort({ createdAt: -1 });

		return NextResponse.json({ reviews }, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching reviews:", error);
		return NextResponse.json(
			{ error: "Failed to fetch reviews" },
			{ status: 500 }
		);
	}
}

// POST - Create a new review
export async function POST(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { bookId, rating, comment } = body;

		// Validate required fields
		if (!bookId || !rating || !comment) {
			return NextResponse.json(
				{ error: "Book ID, rating, and comment are required" },
				{ status: 400 }
			);
		}

		// Validate rating
		if (rating < 1 || rating > 5) {
			return NextResponse.json(
				{ error: "Rating must be between 1 and 5" },
				{ status: 400 }
			);
		}

		await connectDB();

		// Check if book exists
		const book = await Book.findById(bookId);
		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		// Check if user already reviewed this book
		const existingReview = await Review.findOne({
			bookId,
			userId: session.user.id,
		});

		if (existingReview) {
			return NextResponse.json(
				{ error: "You have already reviewed this book" },
				{ status: 400 }
			);
		}

		// Create review
		const review = await Review.create({
			bookId,
			userId: session.user.id,
			rating,
			comment,
		});

		// Update book's average rating
		await updateBookRating(bookId);

		// Populate user data
		await review.populate("userId", "firstName lastName email");

		return NextResponse.json(
			{ message: "Review created successfully", review },
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Error creating review:", error);

		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map(
				(err: any) => err.message
			);
			return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to create review" },
			{ status: 500 }
		);
	}
}
