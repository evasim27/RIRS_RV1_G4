import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET - Retrieve all users (admin only)
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		// Check if user is authenticated and is an admin
		if (!session || session.user.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized access. Admin privileges required." },
				{ status: 401 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const search = searchParams.get("search") || "";
		const status = searchParams.get("status") || "all";

		// Build query
		const query: any = {};

		// Search by name or email
		if (search) {
			query.$or = [
				{ firstName: { $regex: search, $options: "i" } },
				{ lastName: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } },
			];
		}

		// Filter by status
		if (status === "active") {
			query.blocked = false;
		} else if (status === "blocked") {
			query.blocked = true;
		}

		// Get all users (excluding passwords)
		const users = await User.find(query)
			.select("-password")
			.sort({ createdAt: -1 });

		return NextResponse.json(users);
	} catch (error: unknown) {
		console.error("Get users error:", error);
		return NextResponse.json(
			{
				message: "Failed to retrieve users",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// PATCH - Block or unblock a user (admin only)
export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		// Check if user is authenticated and is an admin
		if (!session || session.user.role !== "admin") {
			return NextResponse.json(
				{ message: "Unauthorized access. Admin privileges required." },
				{ status: 401 }
			);
		}

		await connectDB();

		const body = await request.json();
		const { userId, blocked } = body;

		// Validate input
		if (!userId || typeof blocked !== "boolean") {
			return NextResponse.json(
				{ message: "Invalid request parameters" },
				{ status: 400 }
			);
		}

		// Prevent admin from blocking themselves
		if (userId === session.user.id) {
			return NextResponse.json(
				{ message: "You cannot block your own account" },
				{ status: 400 }
			);
		}

		// Find user
		const user = await User.findById(userId);

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Update blocked status
		user.blocked = blocked;
		await user.save();

		return NextResponse.json({
			message: `User ${blocked ? "blocked" : "unblocked"} successfully`,
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role,
				blocked: user.blocked,
			},
		});
	} catch (error: unknown) {
		console.error("Update user status error:", error);
		return NextResponse.json(
			{
				message: "Failed to update user status",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
