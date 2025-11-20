"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown";

export default function TopNavbar() {
	const { data: session, status } = useSession();
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const handleLogout = async () => {
		await signOut({ callbackUrl: "/" });
	};

	return (
		<nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 shadow-lg z-40">
			<div className="h-full px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-full">
					{/* Logo - Only show when not logged in */}
					{!session && (
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
					)}

					{/* Empty div to push content to the right when logged in */}
					{session && <div className="flex-1"></div>}

					{/* Right side - Auth Section */}
					<div className="flex items-center space-x-4">
						{status === "loading" ? (
							<div className="animate-pulse flex space-x-4">
								<div className="h-8 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
							</div>
						) : session ? (
							<>
								{/* Notification Bell */}
								<NotificationDropdown />

								{/* User Menu */}
								<div className="relative">
									<button
										onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
										className="flex items-center space-x-2 focus:outline-none"
									>
										<div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center">
											<span className="text-white text-sm font-medium">
												{session.user.firstName?.[0]}
												{session.user.lastName?.[0]}
											</span>
										</div>
									</button>

									{/* Dropdown Menu */}
									{isUserMenuOpen && (
										<>
											{/* Backdrop */}
											<div
												className="fixed inset-0 z-10"
												onClick={() => setIsUserMenuOpen(false)}
											></div>
											{/* Menu */}
											<div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
												<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
													<p className="text-sm font-medium text-gray-900 dark:text-white">
														{session.user.firstName} {session.user.lastName}
													</p>
													<p className="text-xs text-gray-500 dark:text-gray-400 truncate">
														{session.user.email}
													</p>
													<p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
														{session.user.role}
													</p>
												</div>
												<div className="py-2">
													{session.user.role === "admin" && (
														<Link
															href="/dashboard/users"
															className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
															onClick={() => setIsUserMenuOpen(false)}
														>
															<div className="flex items-center space-x-2">
																<svg
																	className="w-4 h-4"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
																	/>
																</svg>
																<span>User Management</span>
															</div>
														</Link>
													)}
													<button
														onClick={() => {
															setIsUserMenuOpen(false);
															handleLogout();
														}}
														className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
													>
														<div className="flex items-center space-x-2">
															<svg
																className="w-4 h-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
																/>
															</svg>
															<span>Logout</span>
														</div>
													</button>
												</div>
											</div>
										</>
									)}
								</div>
							</>
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
				</div>
			</div>
		</nav>
	);
}
