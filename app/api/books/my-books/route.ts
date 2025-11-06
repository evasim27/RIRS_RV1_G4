import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";

// GET books borrowed by the current user
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const books = await Book.find({
			borrowedBy: session.user.id,
			status: "Borrowed",
		})
			.populate("borrowedBy", "firstName lastName email")
			.sort({ borrowedDate: -1 });

		return NextResponse.json({ books }, { status: 200 });
	} catch (error: any) {
		console.error("Error fetching user's borrowed books:", error);
		return NextResponse.json(
			{ error: "Failed to fetch borrowed books" },
			{ status: 500 }
		);
	}
}
