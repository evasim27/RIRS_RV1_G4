import connectDB from "../lib/mongodb";
import Book from "../models/Book";
import User from "../models/User";
import type { IBook } from "../models/Book";

async function seedBooks() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		// Sample books data (extended with full object fields)
		// All books will include `coverImage` set to the provided image URL.
		const coverImageUrl =
			"https://img.pikbest.com/templates/20241024/creative-and-minimalist-book-cover-template-page-design-for-your-business-_10998934.jpg!sw800";

		const sampleBooks: Partial<IBook>[] = [
			{
				title: "To Kill a Mockingbird",
				author: "Harper Lee",
				description:
					"A gripping tale of racial injustice and childhood innocence set in the Deep South during the 1930s.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-06-112008-4",
				coverImage: coverImageUrl,
				publicationDate: new Date("1960-07-11"),
			},
			{
				title: "1984",
				author: "George Orwell",
				description:
					"A dystopian social science fiction novel that follows the life of Winston Smith in a totalitarian state.",
				category: "Science Fiction",
				status: "Available",
				isbn: "978-0-452-28423-4",
				coverImage: coverImageUrl,
				publicationDate: new Date("1949-06-08"),
			},
			{
				title: "Pride and Prejudice",
				author: "Jane Austen",
				description:
					"A romantic novel of manners that follows the character development of Elizabeth Bennet.",
				category: "Romance",
				status: "Borrowed",
				isbn: "978-0-14-143951-8",
				coverImage: coverImageUrl,
				publicationDate: new Date("1813-01-28"),
			},
			{
				title: "The Great Gatsby",
				author: "F. Scott Fitzgerald",
				description:
					"A tragic story of Jay Gatsby and his pursuit of the American Dream in the Jazz Age.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-7432-7356-5",
				coverImage: coverImageUrl,
				publicationDate: new Date("1925-04-10"),
			},
			{
				title: "Sapiens: A Brief History of Humankind",
				author: "Yuval Noah Harari",
				description:
					"An exploration of the history of humanity from the Stone Age to the modern age.",
				category: "Non-Fiction",
				status: "Available",
				isbn: "978-0-06-231609-7",
				coverImage: coverImageUrl,
				publicationDate: new Date("2011-09-04"),
			},
			{
				title: "The Hobbit",
				author: "J.R.R. Tolkien",
				description:
					"A fantasy novel about Bilbo Baggins' unexpected journey to help dwarves reclaim their mountain home.",
				category: "Fantasy",
				status: "Borrowed",
				isbn: "978-0-547-92822-7",
				coverImage: coverImageUrl,
				publicationDate: new Date("1937-09-21"),
			},
			{
				title: "Educated",
				author: "Tara Westover",
				description:
					"A memoir about a woman who grows up in a strict survivalist family and eventually escapes to learn about the world through education.",
				category: "Biography",
				status: "Available",
				isbn: "978-0-399-59050-4",
				coverImage: coverImageUrl,
				publicationDate: new Date("2018-02-20"),
			},
			{
				title: "The Catcher in the Rye",
				author: "J.D. Salinger",
				description:
					"A story about teenage rebellion and alienation narrated by Holden Caulfield.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-316-76948-0",
				coverImage: coverImageUrl,
				publicationDate: new Date("1951-07-16"),
			},
			{
				title: "Harry Potter and the Philosopher's Stone",
				author: "J.K. Rowling",
				description:
					"The first novel in the Harry Potter series, introducing the magical world of Hogwarts.",
				category: "Fantasy",
				status: "Borrowed",
				isbn: "978-0-7475-3269-9",
				coverImage: coverImageUrl,
				publicationDate: new Date("1997-06-26"),
			},
			{
				title: "Atomic Habits",
				author: "James Clear",
				description:
					"A practical guide to building good habits and breaking bad ones through tiny changes that deliver remarkable results.",
				category: "Self-Help",
				status: "Available",
				isbn: "978-0-7352-1129-2",
				coverImage: coverImageUrl,
				publicationDate: new Date("2018-10-16"),
			},
			{
				title: "The Alchemist",
				author: "Paulo Coelho",
				description:
					"A philosophical tale about following your dreams and listening to your heart.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-06-112241-5",
				coverImage: coverImageUrl,
				publicationDate: new Date("1988-04-15"),
			},
			{
				title: "Dune",
				author: "Frank Herbert",
				description:
					"A science fiction epic set on the desert planet Arrakis, following Paul Atreides.",
				category: "Science Fiction",
				status: "Available",
				isbn: "978-0-441-17271-9",
				coverImage: coverImageUrl,
				publicationDate: new Date("1965-08-01"),
			},
		];
		// Find a borrower user (if present) to attach to borrowed books
		const borrowerUser = await User.findOne({ email: "librarian@library.com" });
		const borrowerId = borrowerUser ? borrowerUser._id : undefined;

		// If a book's status is Borrowed, add borrowedBy/borrowedDate/dueDate if possible
		const now = new Date();
		const sevenDaysAgo = new Date(now);
		sevenDaysAgo.setDate(now.getDate() - 7);
		const sevenDaysFromNow = new Date(now);
		sevenDaysFromNow.setDate(now.getDate() + 7);

		const enrichedBooks = sampleBooks.map((b) => {
			// Ensure every book has the optional fields present (may be null)
			const base = {
				...b,
				coverImage: b.coverImage || coverImageUrl,
				publicationDate: b.publicationDate || undefined,
				isbn: b.isbn || undefined,
				borrowedBy: undefined,
				borrowedDate: undefined,
				dueDate: undefined,
			} as Partial<IBook>;

			if (b.status === "Borrowed") {
				return {
					...base,
					borrowedBy: borrowerId,
					borrowedDate: sevenDaysAgo,
					dueDate: sevenDaysFromNow,
				};
			}

			return base;
		});

		// Check if books already exist
		const existingBooks = await Book.countDocuments();
		const forceSeed = process.env.FORCE_SEED === "true";
		if (existingBooks > 0 && !forceSeed) {
			console.log(
				`Database already contains ${existingBooks} books. Skipping seed.`
			);
			console.log(
				"If you want to reseed, set the environment variable FORCE_SEED=true and re-run this script."
			);
			process.exit(0);
		}

		if (existingBooks > 0 && forceSeed) {
			console.log(
				"FORCE_SEED=true detected — clearing existing books collection..."
			);
			await Book.deleteMany({});
			console.log("Existing books cleared.");
		}
		// Insert sample books
		await Book.insertMany(enrichedBooks);
		console.log(`✓ Successfully added ${enrichedBooks.length} sample books`);
		console.log("\nSample books:");
		enrichedBooks.forEach((book, index) => {
			const b = book as Partial<IBook>;
			console.log(
				`  ${index + 1}. "${b.title}" by ${b.author} [${b.status}] cover=${
					b.coverImage ? "yes" : "no"
				} isbn=${b.isbn ? b.isbn : "(none)"}`
			);
		});

		console.log("\nSeeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding books:", error);
		process.exit(1);
	}
}

seedBooks();
