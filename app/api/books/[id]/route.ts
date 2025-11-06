import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

// GET single book
export async function GET(request: NextRequest, { params }: { params: any }) {
	try {
		await connectDB();

		// params can be a Promise in the App Router — unwrap it before use
		const { id } = await params;

		const book = await Book.findById(id);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		return NextResponse.json({ book }, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching book:", error);
		return NextResponse.json(
			{ error: "Failed to fetch book" },
			{ status: 500 }
		);
	}
}

// PUT update book
export async function PUT(request: NextRequest, { params }: { params: any }) {
	try {
		const body = await request.json();
		const {
			title,
			author,
			description,
			category,
			status,
			coverImage,
			publicationDate,
			isbn,
		} = body;

		// Validate required fields
		if (!title || !author || !description || !category || !status) {
			return NextResponse.json(
				{
					error:
						"Title, author, description, category, and status are required",
				},
				{ status: 400 }
			);
		}

		await connectDB();

		// params may be a Promise — unwrap to get the id
		const { id } = await params;

		const book = await Book.findByIdAndUpdate(
			id,
			{
				title,
				author,
				description,
				category,
				status,
				coverImage,
				publicationDate: publicationDate
					? new Date(publicationDate)
					: undefined,
				isbn,
			},
			{ new: true, runValidators: true }
		);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ message: "Book updated successfully", book },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error updating book:", error);

		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map(
				(err: any) => err.message
			);
			return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to update book" },
			{ status: 500 }
		);
	}
}

// DELETE book
export async function DELETE(
	request: NextRequest,
	{ params }: { params: any }
) {
	try {
		await connectDB();

		// unwrap params before accessing
		const { id } = await params;

		const book = await Book.findByIdAndDelete(id);

		if (!book) {
			return NextResponse.json({ error: "Book not found" }, { status: 404 });
		}

		return NextResponse.json(
			{ message: "Book deleted successfully" },
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error deleting book:", error);
		return NextResponse.json(
			{ error: "Failed to delete book" },
			{ status: 500 }
		);
	}
}
