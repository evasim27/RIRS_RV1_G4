import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

// GET all books
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status");
		const category = searchParams.get("category");
		const search = searchParams.get("search");

		let query: any = {};

		if (status && status !== "all") {
			query.status = status;
		}

		if (category && category !== "all") {
			query.category = category;
		}

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ author: { $regex: search, $options: "i" } },
				{ category: { $regex: search, $options: "i" } },
			];
		}

		const books = await Book.find(query).sort({ createdAt: -1 }).lean();

		// Manually populate borrowedBy for books that have it
		const populatedBooks = books.map((book: any) => {
			return {
				...book,
				borrowedBy: book.borrowedBy
					? typeof book.borrowedBy === "object"
						? book.borrowedBy._id?.toString()
						: book.borrowedBy.toString()
					: null,
			};
		});

		return NextResponse.json({ books: populatedBooks }, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching books:", error);
		return NextResponse.json(
			{ error: "Failed to fetch books" },
			{ status: 500 }
		);
	}
}

// POST create new book
export async function POST(request: NextRequest) {
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

		const book = await Book.create({
			title,
			author,
			description,
			category,
			status,
			coverImage,
			publicationDate: publicationDate ? new Date(publicationDate) : undefined,
			isbn,
		});

		return NextResponse.json(
			{ message: "Book created successfully", book },
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Error creating book:", error);

		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map(
				(err: any) => err.message
			);
			return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "Failed to create book" },
			{ status: 500 }
		);
	}
}
