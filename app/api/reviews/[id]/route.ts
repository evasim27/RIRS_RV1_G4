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

// PUT - Update a review
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = await params;
		const body = await request.json();
		const { rating, comment } = body;

		// Validate required fields
		if (!rating || !comment) {
			return NextResponse.json(
				{ error: "Rating and comment are required" },
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

		// Find the review
		const review = await Review.findById(id);

		if (!review) {
			return NextResponse.json({ error: "Review not found" }, { status: 404 });
		}

		// Check if current user is the owner
		if (review.userId.toString() !== session.user.id) {
			return NextResponse.json(
				{ error: "You can only edit your own reviews" },
				{ status: 403 }
			);
		}

		// Update review
		review.rating = rating;
		review.comment = comment;
		await review.save();

		// Update book's average rating
		await updateBookRating(review.bookId.toString());

		// Populate user data
		await review.populate("userId", "firstName lastName email");

		return NextResponse.json(
			{ message: "Review updated successfully", review },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating review:", error);

		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map(
				(err: any) => err.message
			);
			return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to update review" },
			{ status: 500 }
		);
	}
}

// DELETE - Delete a review
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

		// Find the review
		const review = await Review.findById(id);

		if (!review) {
			return NextResponse.json({ error: "Review not found" }, { status: 404 });
		}

		// Check if current user is the owner or admin/librarian
		const userRole = session.user.role;
		if (
			review.userId.toString() !== session.user.id &&
			userRole !== "admin" &&
			userRole !== "librarian"
		) {
			return NextResponse.json(
				{ error: "You can only delete your own reviews" },
				{ status: 403 }
			);
		}

		const bookId = review.bookId.toString();

		// Delete review
		await Review.findByIdAndDelete(id);

		// Update book's average rating
		await updateBookRating(bookId);

		return NextResponse.json(
			{ message: "Review deleted successfully" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error deleting review:", error);
		return NextResponse.json(
			{ error: "Failed to delete review" },
			{ status: 500 }
		);
	}
}
