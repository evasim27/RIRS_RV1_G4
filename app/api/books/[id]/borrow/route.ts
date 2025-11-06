import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

export async function POST(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id } = params;

		await connectDB();

		// Find the book
		const book = await Book.findById(id);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		// Check if book is available
		if (book.status === "Borrowed") {
			return NextResponse.json(
				{ error: "Book is already borrowed" },
				{ status: 400 }
			);
		}

		// Set borrow dates
		const borrowedDate = new Date();
		const dueDate = new Date();
		dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

		// Update book
		book.status = "Borrowed";
		book.borrowedBy = session.user.id as any;
		book.borrowedDate = borrowedDate;
		book.dueDate = dueDate;
		await book.save();

		return NextResponse.json(
			{
				message: "Book borrowed successfully",
				book,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error borrowing book:", error);
		return NextResponse.json(
			{ error: "Failed to borrow book" },
			{ status: 500 }
		);
	}
}
