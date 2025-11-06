"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface BookStats {
	total: number;
	available: number;
	borrowed: number;
}

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

export default function DashboardPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [stats, setStats] = useState<BookStats>({
		total: 0,
		available: 0,
		borrowed: 0,
	});
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("all");
	const [statusFilter, setStatusFilter] = useState("all");
	const [categories, setCategories] = useState<string[]>([]);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [bookToDelete, setBookToDelete] = useState<string | null>(null);
	const [borrowing, setBorrowing] = useState<string | null>(null);
	const [returning, setReturning] = useState<string | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated") {
			fetchStats();
			fetchBooks();
		}
	}, [status, router]);

	useEffect(() => {
		if (status === "authenticated") {
			fetchBooks();
		}
	}, [searchQuery, categoryFilter, statusFilter, status]);

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/books/stats");
			if (response.ok) {
				const data = await response.json();
				setStats(data);
			}
		} catch (error) {
			console.error("Error fetching stats:", error);
		}
	};

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

	const handleBorrow = async (bookId: string) => {
		setBorrowing(bookId);
		try {
			const response = await fetch(`/api/books/${bookId}/borrow`, {
				method: "POST",
			});
			const data = await response.json();

			if (response.ok) {
				// Refresh books list and stats
				await fetchBooks();
				await fetchStats();
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
				// Refresh books list and stats
				await fetchBooks();
				await fetchStats();
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

	const handleDelete = async () => {
		if (!bookToDelete) return;

		try {
			const response = await fetch(`/api/books/${bookToDelete}`, {
				method: "DELETE",
			});

			if (response.ok) {
				// Refresh data
				fetchStats();
				fetchBooks();
				setDeleteModalOpen(false);
				setBookToDelete(null);
			} else {
				console.error("Failed to delete book");
			}
		} catch (error) {
			console.error("Error deleting book:", error);
		}
	};

	const openDeleteModal = (bookId: string) => {
		setBookToDelete(bookId);
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDeleteModalOpen(false);
		setBookToDelete(null);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setCategoryFilter("all");
		setStatusFilter("all");
	};

	// Check if user is librarian or admin
	const userRole = session?.user?.role;
	const isLibrarianOrAdmin = userRole === "librarian" || userRole === "admin";

	// Debug function
	const debugSession = async () => {
		console.log("=== CLIENT SESSION DEBUG ===");
		console.log("Full session:", session);
		console.log("User role:", userRole);
		console.log("Is librarian or admin:", isLibrarianOrAdmin);

		try {
			const response = await fetch("/api/debug/session");
			const data = await response.json();
			console.log("=== SERVER SESSION DEBUG ===");
			console.log(data);
			alert(`Role: ${userRole}\nCheck console for full debug info`);
		} catch (error) {
			console.error("Debug error:", error);
		}
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
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
								Library Dashboard
							</h1>
							<span
								className={`px-3 py-1 text-xs font-semibold rounded-full ${
									userRole === "admin"
										? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
										: userRole === "librarian"
										? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
								}`}
							>
								{userRole?.toUpperCase() || "USER"}
							</span>
							<button
								onClick={debugSession}
								className="px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800 rounded-md transition-colors"
								title="Click to debug session"
							>
								🐛 Debug
							</button>
						</div>
						<p className="mt-2 text-gray-600 dark:text-gray-400">
							{isLibrarianOrAdmin
								? "Manage your library collection"
								: "Browse and borrow books"}
						</p>
					</div>
					{isLibrarianOrAdmin && (
						<Link
							href="/dashboard/books/add"
							className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2"
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
									d="M12 4v16m8-8H4"
								/>
							</svg>
							Add New Book
						</Link>
					)}
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
								<svg
									className="h-6 w-6 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
										Total Books
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{stats.total}
									</dd>
								</dl>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-green-500 rounded-md p-3">
								<svg
									className="h-6 w-6 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
										Available Books
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{stats.available}
									</dd>
								</dl>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
								<svg
									className="h-6 w-6 text-white"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="ml-5 w-0 flex-1">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
										Borrowed Books
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{stats.borrowed}
									</dd>
								</dl>
							</div>
						</div>
					</div>
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
									onChange={(e) => setSearchQuery(e.target.value)}
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
								onChange={(e) => setCategoryFilter(e.target.value)}
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
								onChange={(e) => setStatusFilter(e.target.value)}
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
							? "Loading..."
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
							{isLibrarianOrAdmin
								? "No books match your search criteria. Try adjusting your filters."
								: "We couldn't find any books matching your search. Try different filters."}
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
								className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
							>
								{/* Book Cover */}
								<div className="relative h-48 bg-gray-200 dark:bg-gray-700">
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
												className="w-12 h-12 text-gray-400"
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
								<div className="p-4 flex flex-col flex-grow">
									<h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
										{book.title}
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
										by {book.author}
									</p>

									<div className="flex items-center justify-between mb-3">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
											{book.category}
										</span>
										{book.status === "Borrowed" && book.dueDate && (
											<span className="text-xs text-gray-600 dark:text-gray-400">
												Due: {formatDate(book.dueDate)}
											</span>
										)}
									</div>

									{/* Action Buttons */}
									<div className="mt-auto space-y-2">
										{isLibrarianOrAdmin ? (
											<>
												<div className="flex gap-2">
													<Link
														href={`/dashboard/books/edit/${book._id}`}
														className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors text-center"
													>
														Edit
													</Link>
													<button
														onClick={() => openDeleteModal(book._id)}
														className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
													>
														Delete
													</button>
												</div>
												<Link
													href={`/dashboard/books/${book._id}`}
													className="block w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-center"
												>
													View Details
												</Link>
											</>
										) : (
											<>
												{book.status === "Available" ? (
													<>
														<button
															onClick={() => handleBorrow(book._id)}
															disabled={borrowing === book._id}
															className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
														>
															{borrowing === book._id
																? "Borrowing..."
																: "Borrow Book"}
														</button>
														<button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
															Reserve Book
														</button>
													</>
												) : book.borrowedBy === session?.user.id ? (
													<button
														onClick={() => handleReturn(book._id)}
														disabled={returning === book._id}
														className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md transition-colors"
													>
														{returning === book._id
															? "Returning..."
															: "Return Book"}
													</button>
												) : (
													<>
														<div className="w-full px-4 py-2 text-sm font-medium text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
															Currently Borrowed
														</div>
														<button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
															Reserve Book
														</button>
													</>
												)}
											</>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Delete Confirmation Modal */}
			{deleteModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
							Confirm Delete
						</h3>
						<p className="text-gray-700 dark:text-gray-300 mb-6">
							Are you sure you want to delete this book? This action cannot be
							undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={closeDeleteModal}
								className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
