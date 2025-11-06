import connectDB from "../lib/mongodb";
import Book from "../models/Book";
import User from "../models/User";

async function updateBooksWithBorrowData() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		// Find a regular user (not admin or librarian)
		const user = await User.findOne({ role: "user" });

		if (!user) {
			console.log("No regular user found. Please create a user first.");
			process.exit(1);
		}

		console.log(
			`Found user: ${user.firstName} ${user.lastName} (${user.email})`
		);

		// Find some books with "Borrowed" status
		const borrowedBooks = await Book.find({ status: "Borrowed" }).limit(3);

		if (borrowedBooks.length === 0) {
			console.log("No borrowed books found. Updating some books...");

			// Update some books to borrowed status
			const availableBooks = await Book.find({ status: "Available" }).limit(3);

			for (const book of availableBooks) {
				const borrowedDate = new Date();
				const dueDate = new Date();
				dueDate.setDate(dueDate.getDate() + 14); // Due in 14 days

				await Book.findByIdAndUpdate(book._id, {
					status: "Borrowed",
					borrowedBy: user._id,
					borrowedDate: borrowedDate,
					dueDate: dueDate,
				});

				console.log(
					`✓ Updated "${book.title}" - Borrowed by ${user.firstName}`
				);
			}
		} else {
			// Update existing borrowed books with user info
			for (const book of borrowedBooks) {
				const borrowedDate = new Date();
				borrowedDate.setDate(borrowedDate.getDate() - 5); // Borrowed 5 days ago

				const dueDate = new Date();
				dueDate.setDate(dueDate.getDate() + 9); // Due in 9 days

				await Book.findByIdAndUpdate(book._id, {
					borrowedBy: user._id,
					borrowedDate: borrowedDate,
					dueDate: dueDate,
				});

				console.log(`✓ Updated "${book.title}" with borrow data`);
			}
		}

		console.log("\n✅ Successfully updated books with borrow data!");
		console.log(
			`\nYou can now login as ${user.email} to see borrowed books in "My Books" page.`
		);
		process.exit(0);
	} catch (error) {
		console.error("Error updating books:", error);
		process.exit(1);
	}
}

updateBooksWithBorrowData();
