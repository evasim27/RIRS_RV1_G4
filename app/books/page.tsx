"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BooksPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Browse Books
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Explore our collection and manage your reservations
					</p>
				</div>

				{/* Placeholder Content */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
					<div className="flex justify-center mb-4">
						<svg
							className="w-16 h-16 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
							/>
						</svg>
					</div>
					<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
						Books Catalog Coming Soon
					</h2>
					<p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
						The books catalog feature is currently under development. You'll be
						able to browse, search, and reserve books from our extensive
						collection.
					</p>
				</div>
			</div>
		</div>
	);
}
