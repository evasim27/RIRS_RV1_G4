import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					throw new Error("Please enter email and password");
				}

				try {
					await connectDB();

					// Find user by email
					const user = await User.findOne({
						email: credentials.email.toLowerCase(),
					});

					if (!user) {
						throw new Error("Invalid email or password");
					}

					// Check if user is blocked
					if (user.blocked) {
						throw new Error(
							"Your account has been blocked. Please contact an administrator."
						);
					}

					// Verify password
					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!isPasswordValid) {
						throw new Error("Invalid email or password");
					}

					// Log user role for debugging
					console.log("🔐 User logging in:", {
						email: user.email,
						role: user.role,
						firstName: user.firstName,
					});

					// Return user object (excluding password)
					const userObject = {
						id: (user._id as any).toString(),
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
						role: user.role,
					};

					console.log("✅ Returning user object:", userObject);
					return userObject;
				} catch (error: any) {
					throw new Error(error.message || "Authentication failed");
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user, trigger }) {
			// If user object exists (during sign in), update token
			if (user) {
				token.id = user.id;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.role = user.role;
				console.log("🎫 JWT callback - Setting token from user:", {
					id: token.id,
					role: token.role,
				});
			}
			// If role is missing from existing token, fetch from database
			else if (!token.role && token.id) {
				console.log("⚠️ Role missing in token, fetching from database...");
				try {
					await connectDB();
					const dbUser = await User.findById(token.id);
					if (dbUser) {
						token.role = dbUser.role;
						token.firstName = dbUser.firstName;
						token.lastName = dbUser.lastName;
						console.log("✅ Updated token with role from DB:", token.role);
					}
				} catch (error) {
					console.error("❌ Error fetching user role:", error);
				}
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.firstName = token.firstName as string;
				session.user.lastName = token.lastName as string;
				session.user.role = token.role as "user" | "librarian" | "admin";
				console.log("📋 Session callback - Setting session:", {
					id: session.user.id,
					email: session.user.email,
					role: session.user.role,
				});
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
		error: "/login",
	},
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
