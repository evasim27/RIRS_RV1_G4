"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
	const { data: session, status } = useSession();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
	};

	return (
		<nav className="bg-white dark:bg-gray-800 shadow-lg">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					<div className="flex items-center">
						{/* Logo */}
						<Link href="/" className="flex items-center">
							<svg
								className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
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
							<span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
								Library
							</span>
						</Link>

						{/* Desktop Navigation Links */}
						<div className="hidden md:ml-10 md:flex md:space-x-8">
							<Link
								href="/"
								className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors"
							>
								Home
							</Link>
							{session && (
								<>
									<Link
										href="/dashboard"
										className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors"
									>
										Dashboard
									</Link>
									<Link
										href="/books"
										className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors"
									>
										Books
									</Link>
									<Link
										href="/my-books"
										className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium transition-colors"
									>
										My Books
									</Link>
								</>
							)}
						</div>
					</div>{" "}
					{/* Desktop Auth Section */}
					<div className="hidden md:flex md:items-center md:space-x-4">
						{status === "loading" ? (
							<div className="animate-pulse flex space-x-4">
								<div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
							</div>
						) : session ? (
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
										<span className="text-white text-sm font-medium">
											{session.user.firstName?.[0]}
											{session.user.lastName?.[0]}
										</span>
									</div>
									<div className="text-sm">
										<p className="text-gray-900 dark:text-white font-medium">
											{session.user.firstName} {session.user.lastName}
										</p>
										<p className="text-gray-500 dark:text-gray-400 text-xs">
											{session.user.email}
										</p>
									</div>
								</div>
								<button
									onClick={handleLogout}
									className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<Link
									href="/login"
									className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
								>
									Login
								</Link>
								<Link
									href="/register"
									className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
								>
									Register
								</Link>
							</div>
						)}
					</div>
					{/* Mobile menu button */}
					<div className="flex items-center md:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
						>
							<span className="sr-only">Open main menu</span>
							{isMenuOpen ? (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{isMenuOpen && (
				<div className="md:hidden">
					<div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
						<Link
							href="/"
							className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-base font-medium"
							onClick={() => setIsMenuOpen(false)}
						>
							Home
						</Link>
						{session && (
							<>
								<Link
									href="/dashboard"
									className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-base font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Dashboard
								</Link>
								<Link
									href="/books"
									className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-base font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									Books
								</Link>
								<Link
									href="/my-books"
									className="block text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-base font-medium"
									onClick={() => setIsMenuOpen(false)}
								>
									My Books
								</Link>
							</>
						)}
					</div>
					<div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
						{session ? (
							<div className="px-5">
								<div className="flex items-center mb-3">
									<div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
										<span className="text-white font-medium">
											{session.user.firstName?.[0]}
											{session.user.lastName?.[0]}
										</span>
									</div>
									<div className="ml-3">
										<p className="text-base font-medium text-gray-900 dark:text-white">
											{session.user.firstName} {session.user.lastName}
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											{session.user.email}
										</p>
									</div>
								</div>
								<button
									onClick={handleLogout}
									className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="px-5 space-y-2">
								<Link
									href="/login"
									className="block w-full px-4 py-2 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-md hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors"
									onClick={() => setIsMenuOpen(false)}
								>
									Login
								</Link>
								<Link
									href="/register"
									className="block w-full px-4 py-2 text-center text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
									onClick={() => setIsMenuOpen(false)}
								>
									Register
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</nav>
	);
}
