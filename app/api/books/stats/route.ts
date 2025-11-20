import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const totalBooks = await Book.countDocuments();
		const availableBooks = await Book.countDocuments({ status: "Available" });
		const borrowedBooks = await Book.countDocuments({ status: "Borrowed" });

		return NextResponse.json(
			{
				total: totalBooks,
				available: availableBooks,
				borrowed: borrowedBooks,
			},
			{ status: 200 }
		);
	} catch (error: any) {
		console.error("Error fetching book statistics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch statistics" },
			{ status: 500 }
		);
	}
}
