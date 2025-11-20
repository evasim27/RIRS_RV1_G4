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

		// Check if book is borrowed
		if (book.status !== "Borrowed") {
			return NextResponse.json(
				{ error: "Book is not currently borrowed" },
				{ status: 400 }
			);
		}

		// Check if current user is the one who borrowed it (or is admin/librarian)
		const userRole = session.user.role;
		if (
			book.borrowedBy?.toString() !== session.user.id &&
			userRole !== "admin" &&
			userRole !== "librarian"
		) {
			return NextResponse.json(
				{ error: "You can only return books you borrowed" },
				{ status: 403 }
			);
		}

		// Update book to available
		book.status = "Available";
		book.borrowedBy = undefined;
		book.borrowedDate = undefined;
		book.dueDate = undefined;
		await book.save();

		return NextResponse.json(
			{
				message: "Book returned successfully",
				book,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error returning book:", error);
		return NextResponse.json(
			{ error: "Failed to return book" },
			{ status: 500 }
		);
	}
}
