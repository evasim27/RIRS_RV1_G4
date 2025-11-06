import connectDB from "../lib/mongodb";
import Book from "../models/Book";

async function seedBooks() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		// Sample books data
		const sampleBooks = [
			{
				title: "To Kill a Mockingbird",
				author: "Harper Lee",
				description:
					"A gripping tale of racial injustice and childhood innocence set in the Deep South during the 1930s.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-06-112008-4",
			},
			{
				title: "1984",
				author: "George Orwell",
				description:
					"A dystopian social science fiction novel that follows the life of Winston Smith in a totalitarian state.",
				category: "Science Fiction",
				status: "Available",
				isbn: "978-0-452-28423-4",
			},
			{
				title: "Pride and Prejudice",
				author: "Jane Austen",
				description:
					"A romantic novel of manners that follows the character development of Elizabeth Bennet.",
				category: "Romance",
				status: "Borrowed",
				isbn: "978-0-14-143951-8",
			},
			{
				title: "The Great Gatsby",
				author: "F. Scott Fitzgerald",
				description:
					"A tragic story of Jay Gatsby and his pursuit of the American Dream in the Jazz Age.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-7432-7356-5",
			},
			{
				title: "Sapiens: A Brief History of Humankind",
				author: "Yuval Noah Harari",
				description:
					"An exploration of the history of humanity from the Stone Age to the modern age.",
				category: "Non-Fiction",
				status: "Available",
				isbn: "978-0-06-231609-7",
			},
			{
				title: "The Hobbit",
				author: "J.R.R. Tolkien",
				description:
					"A fantasy novel about Bilbo Baggins' unexpected journey to help dwarves reclaim their mountain home.",
				category: "Fantasy",
				status: "Borrowed",
				isbn: "978-0-547-92822-7",
			},
			{
				title: "Educated",
				author: "Tara Westover",
				description:
					"A memoir about a woman who grows up in a strict survivalist family and eventually escapes to learn about the world through education.",
				category: "Biography",
				status: "Available",
				isbn: "978-0-399-59050-4",
			},
			{
				title: "The Catcher in the Rye",
				author: "J.D. Salinger",
				description:
					"A story about teenage rebellion and alienation narrated by Holden Caulfield.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-316-76948-0",
			},
			{
				title: "Harry Potter and the Philosopher's Stone",
				author: "J.K. Rowling",
				description:
					"The first novel in the Harry Potter series, introducing the magical world of Hogwarts.",
				category: "Fantasy",
				status: "Borrowed",
				isbn: "978-0-7475-3269-9",
			},
			{
				title: "Atomic Habits",
				author: "James Clear",
				description:
					"A practical guide to building good habits and breaking bad ones through tiny changes that deliver remarkable results.",
				category: "Self-Help",
				status: "Available",
				isbn: "978-0-7352-1129-2",
			},
			{
				title: "The Alchemist",
				author: "Paulo Coelho",
				description:
					"A philosophical tale about following your dreams and listening to your heart.",
				category: "Fiction",
				status: "Available",
				isbn: "978-0-06-112241-5",
			},
			{
				title: "Dune",
				author: "Frank Herbert",
				description:
					"A science fiction epic set on the desert planet Arrakis, following Paul Atreides.",
				category: "Science Fiction",
				status: "Available",
				isbn: "978-0-441-17271-9",
			},
		];

		// Check if books already exist
		const existingBooks = await Book.countDocuments();
		if (existingBooks > 0) {
			console.log(
				`Database already contains ${existingBooks} books. Skipping seed.`
			);
			console.log(
				"If you want to reseed, please clear the books collection first."
			);
			process.exit(0);
		}

		// Insert sample books
		await Book.insertMany(sampleBooks);
		console.log(`✓ Successfully added ${sampleBooks.length} sample books`);
		console.log("\nSample books:");
		sampleBooks.forEach((book, index) => {
			console.log(
				`  ${index + 1}. "${book.title}" by ${book.author} [${book.status}]`
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
