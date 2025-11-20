import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET - Retrieve user's notification preferences
export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			notificationPreferences: user.notificationPreferences || {
				dueDateReminders: true,
				overdueNotices: true,
			},
		});
	} catch (error: unknown) {
		console.error("Get notification settings error:", error);
		return NextResponse.json(
			{
				message: "Failed to retrieve notification settings",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// PATCH - Update user's notification preferences
export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const body = await request.json();
		const { dueDateReminders, overdueNotices } = body;

		// Validate input
		if (
			typeof dueDateReminders !== "boolean" &&
			typeof overdueNotices !== "boolean"
		) {
			return NextResponse.json(
				{ message: "Invalid notification preferences" },
				{ status: 400 }
			);
		}

		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Update preferences
		const updatedPreferences = {
			dueDateReminders:
				typeof dueDateReminders === "boolean"
					? dueDateReminders
					: user.notificationPreferences?.dueDateReminders ?? true,
			overdueNotices:
				typeof overdueNotices === "boolean"
					? overdueNotices
					: user.notificationPreferences?.overdueNotices ?? true,
		};

		user.notificationPreferences = updatedPreferences;
		await user.save();

		return NextResponse.json({
			message: "Notification preferences updated successfully",
			notificationPreferences: updatedPreferences,
		});
	} catch (error: unknown) {
		console.error("Update notification settings error:", error);
		return NextResponse.json(
			{
				message: "Failed to update notification settings",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
