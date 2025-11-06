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
	publicationDate?: string;
	isbn?: string;
	dueDate?: string;
	borrowedBy?: string | null;
}

export default function BooksPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [categories, setCategories] = useState<string[]>([]);
	const [borrowing, setBorrowing] = useState<string | null>(null);
	const [returning, setReturning] = useState<string | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const handleBorrow = async (bookId: string) => {
		setBorrowing(bookId);
		try {
			const response = await fetch(`/api/books/${bookId}/borrow`, {
				method: "POST",
			});
			const data = await response.json();

			if (response.ok) {
				// Refresh books list
				await fetchBooks();
			} else {
				alert(data.error || "Failed to borrow book");
			}
		} catch (error) {
			console.error("Error borrowing book:", error);
			alert("An error occurred while borrowing the book");
		} finally {
			setBorrowing(null);
		}
	};

	const handleReturn = async (bookId: string) => {
		setReturning(bookId);
		try {
			const response = await fetch(`/api/books/${bookId}/return`, {
				method: "POST",
			});
			const data = await response.json();

			if (response.ok) {
				// Refresh books list
				await fetchBooks();
			} else {
				alert(data.error || "Failed to return book");
			}
		} catch (error) {
			console.error("Error returning book:", error);
			alert("An error occurred while returning the book");
		} finally {
			setReturning(null);
		}
	};

	// Fetch books
	useEffect(() => {
		if (session) {
			fetchBooks();
		}
	}, [session, searchQuery, categoryFilter, statusFilter]);

	const fetchBooks = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (categoryFilter !== "all") params.append("category", categoryFilter);
			if (statusFilter !== "all") params.append("status", statusFilter);

			const response = await fetch(`/api/books?${params.toString()}`);
			const data = await response.json();

			if (response.ok) {
				setBooks(data.books);
				// Extract unique categories
				const uniqueCategories = Array.from(
					new Set(data.books.map((book: Book) => book.category))
				) as string[];
				setCategories(uniqueCategories);
			}
		} catch (error) {
			console.error("Error fetching books:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(e.target.value);
	};

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCategoryFilter(e.target.value);
	};

	const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setStatusFilter(e.target.value);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setCategoryFilter("all");
		setStatusFilter("all");
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
						Browse Books
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Search and explore our collection
					</p>
				</div>

				{/* Search and Filter Section */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
						{/* Search Bar */}
						<div className="md:col-span-2">
							<label
								htmlFor="search"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Search
							</label>
							<div className="relative">
								<input
									type="text"
									id="search"
									placeholder="Search by title, author, or category..."
									value={searchQuery}
									onChange={handleSearchChange}
									className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
								/>
								<svg
									className="absolute left-3 top-3 h-5 w-5 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
							</div>
						</div>

						{/* Category Filter */}
						<div>
							<label
								htmlFor="category"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Category
							</label>
							<select
								id="category"
								value={categoryFilter}
								onChange={handleCategoryChange}
								className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
							>
								<option value="all">All Categories</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						{/* Availability Filter */}
						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
							>
								Availability
							</label>
							<select
								id="status"
								value={statusFilter}
								onChange={handleStatusChange}
								className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent"
							>
								<option value="all">All</option>
								<option value="Available">Available</option>
								<option value="Borrowed">Borrowed</option>
							</select>
						</div>
					</div>

					{/* Active Filters and Clear Button */}
					{(searchQuery ||
						categoryFilter !== "all" ||
						statusFilter !== "all") && (
						<div className="mt-4 flex items-center justify-between">
							<div className="flex flex-wrap gap-2">
								{searchQuery && (
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
										Search: "{searchQuery}"
									</span>
								)}
								{categoryFilter !== "all" && (
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
										Category: {categoryFilter}
									</span>
								)}
								{statusFilter !== "all" && (
									<span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
										Status: {statusFilter}
									</span>
								)}
							</div>
							<button
								onClick={clearFilters}
								className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
							>
								Clear all filters
							</button>
						</div>
					)}
				</div>

				{/* Results Count */}
				<div className="mb-4">
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{loading
							? "Searching..."
							: `${books.length} book${books.length !== 1 ? "s" : ""} found`}
					</p>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
					</div>
				)}

				{/* No Results */}
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
								d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
							No results found
						</h3>
						<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
							We couldn't find any books matching your search criteria.
							<br />
							Try adjusting your filters or search terms.
						</p>
						{(searchQuery ||
							categoryFilter !== "all" ||
							statusFilter !== "all") && (
							<button
								onClick={clearFilters}
								className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600"
							>
								Clear filters
							</button>
						)}
					</div>
				)}

				{/* Books Grid */}
				{!loading && books.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{books.map((book) => (
							<div
								key={book._id}
								className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
							>
								{/* Book Cover */}
								<div className="relative h-64 bg-gray-200 dark:bg-gray-700">
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
									{/* Status Badge */}
									<div className="absolute top-2 right-2">
										<span
											className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
												book.status === "Available"
													? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
											}`}
										>
											{book.status}
										</span>
									</div>
								</div>

								{/* Book Details */}
								<div className="p-4">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
										{book.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
										by {book.author}
									</p>
									<p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">
										{book.description}
									</p>

									{/* Availability Status */}
									<div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
										<div className="flex items-center justify-between mb-2">
											<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
												Availability
											</span>
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
													book.status === "Available"
														? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
														: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
												}`}
											>
												{book.status === "Available" ? (
													<>
														<svg
															className="w-3 h-3 mr-1"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
																clipRule="evenodd"
															/>
														</svg>
														Available
													</>
												) : (
													<>
														<svg
															className="w-3 h-3 mr-1"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path
																fillRule="evenodd"
																d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
																clipRule="evenodd"
															/>
														</svg>
														Borrowed
													</>
												)}
											</span>
										</div>
										{book.status === "Borrowed" && book.dueDate && (
											<div className="text-xs text-gray-700 dark:text-gray-300">
												<span className="font-medium">Expected return:</span>{" "}
												<span className="text-gray-900 dark:text-white font-semibold">
													{formatDate(book.dueDate)}
												</span>
											</div>
										)}
										{book.status === "Available" && (
											<div className="text-xs text-green-700 dark:text-green-300">
												Ready to borrow immediately
											</div>
										)}
									</div>

									<div className="flex items-center justify-between mb-3">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
											{book.category}
										</span>
										<button
											onClick={() => router.push(`/books/${book._id}`)}
											className="text-sm font-medium text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
										>
											View Details →
										</button>
									</div>

									{/* Borrow/Return Button */}
									{book.status === "Available" ? (
										<button
											onClick={() => handleBorrow(book._id)}
											disabled={borrowing === book._id}
											className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
										>
											{borrowing === book._id ? "Borrowing..." : "Borrow Book"}
										</button>
									) : book.borrowedBy === session?.user.id ? (
										<button
											onClick={() => handleReturn(book._id)}
											disabled={returning === book._id}
											className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
										>
											{returning === book._id ? "Returning..." : "Return Book"}
										</button>
									) : (
										<div className="w-full px-4 py-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
											Borrowed by another user
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
