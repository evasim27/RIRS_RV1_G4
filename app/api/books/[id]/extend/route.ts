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

		// Check if current user is the one who borrowed it
		if (book.borrowedBy?.toString() !== session.user.id) {
			return NextResponse.json(
				{ error: "You can only extend books you borrowed" },
				{ status: 403 }
			);
		}

		// Check if book has a due date
		if (!book.dueDate) {
			return NextResponse.json(
				{ error: "Book has no due date set" },
				{ status: 400 }
			);
		}

		// Extend due date by 7 days from current due date
		const newDueDate = new Date(book.dueDate);
		newDueDate.setDate(newDueDate.getDate() + 7);

		book.dueDate = newDueDate;
		await book.save();

		return NextResponse.json(
			{
				message: "Borrowing period extended successfully",
				book,
				newDueDate: newDueDate.toISOString(),
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error extending borrowing period:", error);
		return NextResponse.json(
			{ error: "Failed to extend borrowing period" },
			{ status: 500 }
		);
	}
}
