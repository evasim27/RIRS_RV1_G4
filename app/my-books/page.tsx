"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Book {
	_id: string;
	title: string;
	author: string;
	description: string;
	category: string;
	status: "Available" | "Borrowed";
	coverImage?: string;
	borrowedDate?: string;
	dueDate?: string;
	borrowedBy?: {
		firstName: string;
		lastName: string;
		email: string;
	};
}

export default function MyBooksPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (session) {
			fetchMyBooks();
		}
	}, [session]);

	const fetchMyBooks = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/books/my-books");
			const data = await response.json();

			if (response.ok) {
				setBooks(data.books);
			} else {
				console.error("Error fetching books:", data.error);
			}
		} catch (error) {
			console.error("Error fetching borrowed books:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getDaysRemaining = (dueDate?: string) => {
		if (!dueDate) return null;
		const due = new Date(dueDate);
		const today = new Date();
		const diffTime = due.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	if (status === "loading") {
		return (
			<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
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
						My Borrowed Books
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Keep track of all your borrowed books and due dates
					</p>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
					</div>
				)}

				{/* No Books State */}
				{!loading && books.length === 0 && (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
						<svg
							className="mx-auto h-16 w-16 text-gray-400"
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
						<h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
							You have no borrowed books
						</h3>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							Visit the books catalog to browse and borrow books from our
							collection.
						</p>
						<button
							onClick={() => router.push("/books")}
							className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600"
						>
							Browse Books
						</button>
					</div>
				)}

				{/* Books List */}
				{!loading && books.length > 0 && (
					<div className="space-y-4">
						{books.map((book) => {
							const daysRemaining = getDaysRemaining(book.dueDate);
							const isOverdue = daysRemaining !== null && daysRemaining < 0;
							const isDueSoon =
								daysRemaining !== null &&
								daysRemaining <= 3 &&
								daysRemaining >= 0;

							return (
								<div
									key={book._id}
									className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
								>
									<div className="flex flex-col sm:flex-row">
										{/* Book Cover */}
										<div className="relative w-full sm:w-48 h-64 sm:h-auto bg-gray-200 dark:bg-gray-700 flex-shrink-0">
											{book.coverImage ? (
												<Image
													src={book.coverImage}
													alt={book.title}
													fill
													className="object-cover"
												/>
											) : (
												<div className="flex items-center justify-center h-full">
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
											)}
										</div>

										{/* Book Details */}
										<div className="flex-1 p-6">
											<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
												<div className="flex-1">
													<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
														{book.title}
													</h3>
													<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
														by {book.author}
													</p>
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
														{book.category}
													</span>
												</div>
												<div className="mt-4 sm:mt-0">
													{isOverdue ? (
														<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
															Overdue
														</span>
													) : isDueSoon ? (
														<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
															Due Soon
														</span>
													) : (
														<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
															Borrowed
														</span>
													)}
												</div>
											</div>

											<p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
												{book.description}
											</p>

											{/* Dates Grid */}
											<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
												<div>
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
														Borrowed Date
													</p>
													<p className="text-sm text-gray-900 dark:text-white font-semibold">
														{formatDate(book.borrowedDate)}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
														Due Date
													</p>
													<p
														className={`text-sm font-semibold ${
															isOverdue
																? "text-red-600 dark:text-red-400"
																: isDueSoon
																? "text-yellow-600 dark:text-yellow-400"
																: "text-gray-900 dark:text-white"
														}`}
													>
														{formatDate(book.dueDate)}
													</p>
												</div>
												<div>
													<p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
														Days Remaining
													</p>
													<p
														className={`text-sm font-semibold ${
															isOverdue
																? "text-red-600 dark:text-red-400"
																: isDueSoon
																? "text-yellow-600 dark:text-yellow-400"
																: "text-gray-900 dark:text-white"
														}`}
													>
														{daysRemaining !== null
															? isOverdue
																? `${Math.abs(daysRemaining)} days overdue`
																: `${daysRemaining} days`
															: "N/A"}
													</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Summary */}
				{!loading && books.length > 0 && (
					<div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Summary
						</h3>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
								<p className="text-2xl font-bold text-gray-900 dark:text-white">
									{books.length}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Total Borrowed
								</p>
							</div>
							<div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
								<p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
									{
										books.filter((book) => {
											const days = getDaysRemaining(book.dueDate);
											return days !== null && days <= 3 && days >= 0;
										}).length
									}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Due Soon
								</p>
							</div>
							<div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
								<p className="text-2xl font-bold text-red-600 dark:text-red-400">
									{
										books.filter((book) => {
											const days = getDaysRemaining(book.dueDate);
											return days !== null && days < 0;
										}).length
									}
								</p>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Overdue
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
