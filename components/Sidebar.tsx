"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
	const { data: session } = useSession();
	const pathname = usePathname();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Don't show sidebar on login/register pages or home page when not logged in
	if (
		!session ||
		pathname === "/login" ||
		pathname === "/register" ||
		pathname === "/"
	) {
		return null;
	}

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(path + "/");
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<>
			{/* Mobile Menu Button */}
			<button
				onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
				className="md:hidden fixed left-4 top-20 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
				aria-label="Toggle menu"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					{isMobileMenuOpen ? (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					) : (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					)}
				</svg>
			</button>

			{/* Mobile Backdrop */}
			{isMobileMenuOpen && (
				<div
					className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
					onClick={closeMobileMenu}
				></div>
			)}

			{/* Sidebar */}
			<aside
				className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg overflow-y-auto z-40 transition-transform duration-300 ease-in-out ${
					isMobileMenuOpen
						? "translate-x-0"
						: "-translate-x-full md:translate-x-0"
				}`}
			>
				<nav className="p-4 space-y-2">
					{/* Logo/Brand */}
					<div className="mb-6 flex items-center">
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
					</div>

					{/* My Books */}
					<Link
						href="/my-books"
						className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
							isActive("/my-books")
								? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
								: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
						}`}
					>
						<svg
							className="w-5 h-5"
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
						<span className="font-medium">My Books</span>
					</Link>

					{/* Explore Books */}
					<Link
						href="/dashboard"
						className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
							isActive("/dashboard") &&
							!pathname.includes("/reservations") &&
							!pathname.includes("/users")
								? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
								: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
						}`}
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							/>
						</svg>
						<span className="font-medium">Explore Books</span>
					</Link>

					{/* Reservations (Librarian/Admin only) */}
					{(session.user.role === "librarian" ||
						session.user.role === "admin") && (
						<Link
							href="/dashboard/reservations"
							className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
								isActive("/dashboard/reservations")
									? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
									: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
							}`}
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
								/>
							</svg>
							<span className="font-medium">Reservations</span>
						</Link>
					)}
				</nav>
			</aside>
		</>
	);
}
