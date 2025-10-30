import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
	try {
		const { firstName, lastName, email, password } = await request.json();

		// Validate input
		if (!firstName || !lastName || !email || !password) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Validate email format
		const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		if (!emailRegex.test(email)) {
			return NextResponse.json(
				{ error: "Please provide a valid email address" },
				{ status: 400 }
			);
		}

		// Validate password length
		if (password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters long" },
				{ status: 400 }
			);
		}

		// Connect to database
		await connectDB();

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return NextResponse.json(
				{ error: "An account with this email already exists" },
				{ status: 409 }
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const user = await User.create({
			firstName,
			lastName,
			email: email.toLowerCase(),
			password: hashedPassword,
		});

		// Return success response (exclude password)
		return NextResponse.json(
			{
				message: "Registration successful! You can now log in.",
				user: {
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
				},
			},
			{ status: 201 }
		);
	} catch (error: any) {
		console.error("Registration error:", error);

		// Handle mongoose validation errors
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map(
				(err: any) => err.message
			);
			return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
		}

		return NextResponse.json(
			{ error: "An error occurred during registration. Please try again." },
			{ status: 500 }
		);
	}
}
