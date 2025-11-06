import bcrypt from "bcryptjs";
import connectDB from "../lib/mongodb";
import User from "../models/User";

async function seedUsers() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		// Check if admin already exists
		const existingAdmin = await User.findOne({ email: "admin@library.com" });
		if (existingAdmin) {
			console.log("Admin user already exists");
		} else {
			// Create admin user
			const adminPassword = await bcrypt.hash("admin123", 10);
			await User.create({
				firstName: "Admin",
				lastName: "User",
				email: "admin@library.com",
				password: adminPassword,
				role: "admin",
			});
			console.log("✓ Admin user created successfully");
			console.log("  Email: admin@library.com");
			console.log("  Password: admin123");
		}

		// Check if librarian already exists
		const existingLibrarian = await User.findOne({
			email: "librarian@library.com",
		});
		if (existingLibrarian) {
			console.log("Librarian user already exists");
		} else {
			// Create librarian user
			const librarianPassword = await bcrypt.hash("librarian123", 10);
			await User.create({
				firstName: "Librarian",
				lastName: "User",
				email: "librarian@library.com",
				password: librarianPassword,
				role: "librarian",
			});
			console.log("✓ Librarian user created successfully");
			console.log("  Email: librarian@library.com");
			console.log("  Password: librarian123");
		}

		console.log("\nSeeding completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("Error seeding users:", error);
		process.exit(1);
	}
}

seedUsers();
