import connectDB from "../lib/mongodb";
import User from "../models/User";

async function checkUsers() {
	try {
		console.log("Connecting to database...");
		await connectDB();

		const librarian = await User.findOne({ email: "librarian@library.com" });
		const admin = await User.findOne({ email: "admin@library.com" });

		console.log("\n=== LIBRARIAN USER ===");
		if (librarian) {
			console.log("Found:", {
				email: librarian.email,
				firstName: librarian.firstName,
				lastName: librarian.lastName,
				role: librarian.role,
				id: (librarian._id as any).toString(),
			});
		} else {
			console.log("❌ Librarian not found!");
		}

		console.log("\n=== ADMIN USER ===");
		if (admin) {
			console.log("Found:", {
				email: admin.email,
				firstName: admin.firstName,
				lastName: admin.lastName,
				role: admin.role,
				id: (admin._id as any).toString(),
			});
		} else {
			console.log("❌ Admin not found!");
		}

		console.log("\n=== ALL USERS ===");
		const allUsers = await User.find({}).select("-password");
		console.log(`Total users: ${allUsers.length}`);
		allUsers.forEach((user) => {
			console.log(`- ${user.email}: ${user.role}`);
		});

		process.exit(0);
	} catch (error) {
		console.error("Error checking users:", error);
		process.exit(1);
	}
}

checkUsers();
