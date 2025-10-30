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

					// Verify password
					const isPasswordValid = await bcrypt.compare(
						credentials.password,
						user.password
					);

					if (!isPasswordValid) {
						throw new Error("Invalid email or password");
					}

					// Return user object (excluding password)
					return {
						id: (user._id as any).toString(),
						email: user.email,
						firstName: user.firstName,
						lastName: user.lastName,
					};
				} catch (error: any) {
					throw new Error(error.message || "Authentication failed");
				}
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
			}
			return token;
		},
		async session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
				session.user.firstName = token.firstName as string;
				session.user.lastName = token.lastName as string;
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
