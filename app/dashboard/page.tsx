"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
		<div className="bg-gray-50 dark:bg-gray-900">
			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Card */}
				<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
						Welcome back, {session.user.firstName} {session.user.lastName}!
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Email: {session.user.email}
					</p>
					<p className="text-gray-600 dark:text-gray-400 mt-1">
						You are successfully logged in to the library system.
					</p>
				</div>

				{/* Feature Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
							<svg
								className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							Browse Books
						</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm">
							Explore our collection of books available for reservation.
						</p>
					</div>

					<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
							<svg
								className="w-6 h-6 text-green-600 dark:text-green-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							My Reservations
						</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm">
							View and manage your current book reservations.
						</p>
					</div>

					<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 hover:shadow-lg transition-shadow">
						<div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
							<svg
								className="w-6 h-6 text-purple-600 dark:text-purple-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
								/>
							</svg>
						</div>
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
							Profile Settings
						</h3>
						<p className="text-gray-600 dark:text-gray-400 text-sm">
							Update your account information and preferences.
						</p>
					</div>
				</div>

				{/* Info Section */}
				<div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<div className="flex items-start">
						<svg
							className="w-6 h-6 text-blue-600 dark:text-blue-400 mt-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
								Authentication Status
							</h3>
							<p className="mt-2 text-sm text-blue-700 dark:text-blue-400">
								You are authenticated and will remain logged in until you
								explicitly log out. Your session is secure and managed by
								NextAuth.js.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
