import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
	try {
		const session = await getServerSession(authOptions);

		if (!session) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}

		// Get user from database
		await connectDB();
		const dbUser = await User.findById(session.user.id).select("-password");

		return NextResponse.json({
			session: {
				user: session.user,
			},
			dbUser: dbUser,
			comparison: {
				sessionRole: session.user.role,
				dbRole: dbUser?.role,
				rolesMatch: session.user.role === dbUser?.role,
			},
		});
	} catch (error: any) {
		console.error("Debug session error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to get debug info" },
			{ status: 500 }
		);
	}
}
