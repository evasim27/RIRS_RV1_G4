import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import Book from "@/models/Book";
import User from "@/models/User";
import Notification from "@/models/Notification";

// This endpoint checks for books with upcoming due dates or overdue books
// and creates notifications for users who have enabled them
export async function POST() {
	try {
		const session = await getServerSession(authOptions);

		// Only librarians and admins can trigger notification checks
		if (
			!session ||
			(session.user.role !== "librarian" && session.user.role !== "admin")
		) {
			return NextResponse.json(
				{ message: "Unauthorized access" },
				{ status: 401 }
			);
		}

		await connectDB();

		const currentDate = new Date();
		const twoDaysFromNow = new Date();
		twoDaysFromNow.setDate(currentDate.getDate() + 2);

		// Find all borrowed books
		const borrowedBooks = await Book.find({
			status: "Borrowed",
			borrowedBy: { $ne: null },
			dueDate: { $ne: null },
		}).populate("borrowedBy");

		let remindersCreated = 0;
		let overdueCreated = 0;

		for (const book of borrowedBooks) {
			if (!book.borrowedBy || !book.dueDate) continue;

			const userId =
				typeof book.borrowedBy === "object"
					? book.borrowedBy._id
					: book.borrowedBy;

			// Get user to check notification preferences
			const user = await User.findById(userId);
			if (!user) continue;

			const dueDate = new Date(book.dueDate);

			// Check if book is overdue
			if (dueDate < currentDate) {
				// Check if user has overdue notices enabled
				if (user.notificationPreferences?.overdueNotices !== false) {
					// Check if overdue notification already exists
					const existingOverdue = await Notification.findOne({
						userId: userId,
						bookId: book._id,
						type: "overdue",
					});

					if (!existingOverdue) {
						await Notification.create({
							userId: userId,
							bookId: book._id,
							type: "overdue",
							message: `Book "${
								book.title
							}" is overdue! It was due on ${dueDate.toLocaleDateString()}.`,
						});
						overdueCreated++;
					}
				}
			}
			// Check if book is due within 2 days
			else if (dueDate <= twoDaysFromNow) {
				// Check if user has due date reminders enabled
				if (user.notificationPreferences?.dueDateReminders !== false) {
					// Check if reminder notification already exists
					const existingReminder = await Notification.findOne({
						userId: userId,
						bookId: book._id,
						type: "reminder",
					});

					if (!existingReminder) {
						const daysUntilDue = Math.ceil(
							(dueDate.getTime() - currentDate.getTime()) /
								(1000 * 60 * 60 * 24)
						);
						await Notification.create({
							userId: userId,
							bookId: book._id,
							type: "reminder",
							message: `Book "${
								book.title
							}" is due in ${daysUntilDue} day(s) on ${dueDate.toLocaleDateString()}.`,
						});
						remindersCreated++;
					}
				}
			}
		}

		return NextResponse.json({
			message: "Notification check completed",
			remindersCreated,
			overdueCreated,
		});
	} catch (error: unknown) {
		console.error("Notification check error:", error);
		return NextResponse.json(
			{
				message: "Failed to check notifications",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}

// GET endpoint to automatically check notifications (can be called by a cron job)
export async function GET() {
	try {
		await connectDB();

		const currentDate = new Date();
		const twoDaysFromNow = new Date();
		twoDaysFromNow.setDate(currentDate.getDate() + 2);

		// Find all borrowed books
		const borrowedBooks = await Book.find({
			status: "Borrowed",
			borrowedBy: { $ne: null },
			dueDate: { $ne: null },
		});

		let remindersCreated = 0;
		let overdueCreated = 0;

		for (const book of borrowedBooks) {
			if (!book.borrowedBy || !book.dueDate) continue;

			const userId = book.borrowedBy;

			// Get user to check notification preferences
			const user = await User.findById(userId);
			if (!user) continue;

			const dueDate = new Date(book.dueDate);

			// Check if book is overdue
			if (dueDate < currentDate) {
				// Check if user has overdue notices enabled
				if (user.notificationPreferences?.overdueNotices !== false) {
					// Check if overdue notification already exists
					const existingOverdue = await Notification.findOne({
						userId: userId,
						bookId: book._id,
						type: "overdue",
					});

					if (!existingOverdue) {
						await Notification.create({
							userId: userId,
							bookId: book._id,
							type: "overdue",
							message: `Book "${
								book.title
							}" is overdue! It was due on ${dueDate.toLocaleDateString()}.`,
						});
						overdueCreated++;
					}
				}
			}
			// Check if book is due within 2 days
			else if (dueDate <= twoDaysFromNow) {
				// Check if user has due date reminders enabled
				if (user.notificationPreferences?.dueDateReminders !== false) {
					// Check if reminder notification already exists
					const existingReminder = await Notification.findOne({
						userId: userId,
						bookId: book._id,
						type: "reminder",
					});

					if (!existingReminder) {
						const daysUntilDue = Math.ceil(
							(dueDate.getTime() - currentDate.getTime()) /
								(1000 * 60 * 60 * 24)
						);
						await Notification.create({
							userId: userId,
							bookId: book._id,
							type: "reminder",
							message: `Book "${
								book.title
							}" is due in ${daysUntilDue} day(s) on ${dueDate.toLocaleDateString()}.`,
						});
						remindersCreated++;
					}
				}
			}
		}

		return NextResponse.json({
			message: "Notification check completed",
			remindersCreated,
			overdueCreated,
		});
	} catch (error: unknown) {
		console.error("Notification check error:", error);
		return NextResponse.json(
			{
				message: "Failed to check notifications",
				error: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 }
		);
	}
}
