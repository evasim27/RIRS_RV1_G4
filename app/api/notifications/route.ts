import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Notification from "@/models/Notification";
import Book from "@/models/Book";

// GET - Retrieve user's notifications
export async function GET(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const unreadOnly = searchParams.get("unreadOnly") === "true";

		// Build query
		const query: { userId: string; read?: boolean } = {
			userId: session.user.id,
		};

		if (unreadOnly) {
			query.read = false;
		}

		// Get notifications and populate book details
		const notifications = await Notification.find(query)
			.populate({
				path: "bookId",
				select: "title author coverImage",
			})
			.sort({ createdAt: -1 })
			.limit(50);

		return NextResponse.json(notifications);
	} catch (error: unknown) {
		console.error("Get notifications error:", error);
		return NextResponse.json(
			{
				message: "Failed to retrieve notifications",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// PATCH - Mark notification(s) as read
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
		const { notificationId, markAllAsRead } = body;

		if (markAllAsRead) {
			// Mark all user's notifications as read
			await Notification.updateMany(
				{ userId: session.user.id, read: false },
				{ $set: { read: true } }
			);

			return NextResponse.json({
				message: "All notifications marked as read",
			});
		} else if (notificationId) {
			// Mark specific notification as read
			const notification = await Notification.findOne({
				_id: notificationId,
				userId: session.user.id,
			});

			if (!notification) {
				return NextResponse.json(
					{ message: "Notification not found" },
					{ status: 404 }
				);
			}

			notification.read = true;
			await notification.save();

			return NextResponse.json({
				message: "Notification marked as read",
				notification,
			});
		} else {
			return NextResponse.json(
				{ message: "Invalid request parameters" },
				{ status: 400 }
			);
		}
	} catch (error: unknown) {
		console.error("Update notification error:", error);
		return NextResponse.json(
			{
				message: "Failed to update notification",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// DELETE - Delete notification(s)
export async function DELETE(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const { searchParams } = new URL(request.url);
		const notificationId = searchParams.get("id");
		const deleteAll = searchParams.get("deleteAll") === "true";

		if (deleteAll) {
			// Delete all user's notifications
			await Notification.deleteMany({ userId: session.user.id });

			return NextResponse.json({
				message: "All notifications deleted",
			});
		} else if (notificationId) {
			// Delete specific notification
			const notification = await Notification.findOneAndDelete({
				_id: notificationId,
				userId: session.user.id,
			});

			if (!notification) {
				return NextResponse.json(
					{ message: "Notification not found" },
					{ status: 404 }
				);
			}

			return NextResponse.json({
				message: "Notification deleted",
			});
		} else {
			return NextResponse.json(
				{ message: "Invalid request parameters" },
				{ status: 400 }
			);
		}
	} catch (error: unknown) {
		console.error("Delete notification error:", error);
		return NextResponse.json(
			{
				message: "Failed to delete notification",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
