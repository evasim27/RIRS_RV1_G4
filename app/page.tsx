"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/dashboard");
		}
	}, [status, router]);

	// Show loading state while checking authentication
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

	// Only show landing page if not authenticated
	if (status === "authenticated") {
		return null;
	}

	return (
		<div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="container mx-auto px-4 py-16">
				{/* Header */}
				<header className="text-center mb-16">
					<div className="inline-block p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-6">
						<svg
							className="w-12 h-12 text-indigo-600 dark:text-indigo-400"
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
					<h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
						Library Management System
					</h1>
					<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
						Your gateway to seamless book reservations and library management
					</p>
				</header>

				{/* Main Content */}
				<main className="max-w-6xl mx-auto">
					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
						<Link
							href="/register"
							className="px-8 py-4 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl text-center"
						>
							Get Started - Register
						</Link>
						<Link
							href="/login"
							className="px-8 py-4 text-lg font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 border-2 border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors shadow-lg hover:shadow-xl text-center"
						>
							Sign In
						</Link>
					</div>

					{/* Features Grid */}
					<div className="grid md:grid-cols-3 gap-8 mb-16">
						<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
							<div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-blue-600 dark:text-blue-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Easy Registration
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Create your account in seconds with our simple registration
								form. Just provide your basic information and you're ready to
								go.
							</p>
						</div>

						<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
							<div className="w-14 h-14 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-green-600 dark:text-green-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
									/>
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Secure Authentication
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Your credentials are protected with industry-standard
								encryption. Stay logged in securely until you choose to log out.
							</p>
						</div>

						<div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
							<div className="w-14 h-14 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-purple-600 dark:text-purple-400"
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
							<h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
								Manage Reservations
							</h3>
							<p className="text-gray-600 dark:text-gray-300">
								Reserve and manage your book borrowings effortlessly from your
								personalized dashboard.
							</p>
						</div>
					</div>

					{/* Info Section */}
					<div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
						<div className="max-w-3xl mx-auto text-center">
							<h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
							<p className="text-lg mb-6 text-indigo-100">
								Join our library system today and enjoy seamless access to our
								extensive book collection. Register now or sign in to manage
								your reservations.
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									href="/register"
									className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-center"
								>
									Create Account
								</Link>
								<Link
									href="/login"
									className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors text-center"
								>
									Sign In
								</Link>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
