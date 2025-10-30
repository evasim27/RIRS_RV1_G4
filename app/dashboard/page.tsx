"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface BookStats {
	total: number;
	available: number;
	borrowed: number;
}

interface Book {
	_id: string;
	title: string;
	author: string;
	category: string;
	status: string;
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
	const [statusFilter, setStatusFilter] = useState("All");
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [bookToDelete, setBookToDelete] = useState<string | null>(null);

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
	}, [searchQuery, statusFilter, status]);

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
		try {
			let url = "/api/books?";
			if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
			if (statusFilter !== "All")
				url += `status=${encodeURIComponent(statusFilter)}&`;

			const response = await fetch(url);
			if (response.ok) {
				const data = await response.json();
				setBooks(data.books);
			}
			setLoading(false);
		} catch (error) {
			console.error("Error fetching books:", error);
			setLoading(false);
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

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
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
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
							Dashboard
						</h1>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
							Welcome back, {session.user?.firstName} {session.user?.lastName}
						</p>
					</div>
					<Link
						href="/dashboard/books/add"
						className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold"
					>
						+ Add New Book
					</Link>
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

				{/* Books Table */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow">
					{/* Search and Filters */}
					<div className="p-6 border-b border-gray-200 dark:border-gray-700">
						<div className="flex flex-col md:flex-row gap-4">
							<div className="flex-1">
								<input
									type="text"
									placeholder="Search by title, author, or category..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
								/>
							</div>
							<div className="flex gap-2">
								<button
									onClick={() => setStatusFilter("All")}
									className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
										statusFilter === "All"
											? "bg-gray-900 dark:bg-gray-700 text-white"
											: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
									}`}
								>
									All
								</button>
								<button
									onClick={() => setStatusFilter("Available")}
									className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
										statusFilter === "Available"
											? "bg-gray-900 dark:bg-gray-700 text-white"
											: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
									}`}
								>
									Available
								</button>
								<button
									onClick={() => setStatusFilter("Borrowed")}
									className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
										statusFilter === "Borrowed"
											? "bg-gray-900 dark:bg-gray-700 text-white"
											: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
									}`}
								>
									Borrowed
								</button>
							</div>
						</div>
					</div>

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 dark:bg-gray-700">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Title
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Author
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Genre
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{books.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
										>
											No books found. Add your first book to get started!
										</td>
									</tr>
								) : (
									books.map((book) => (
										<tr
											key={book._id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-medium text-gray-900 dark:text-white">
													{book.title}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-700 dark:text-gray-300">
													{book.author}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-700 dark:text-gray-300">
													{book.category}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
														book.status === "Available"
															? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
															: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
													}`}
												>
													{book.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
												<div className="flex gap-2">
													<Link
														href={`/dashboard/books/${book._id}`}
														className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
													>
														View details
													</Link>
													<span className="text-gray-300 dark:text-gray-600">
														|
													</span>
													<Link
														href={`/dashboard/books/edit/${book._id}`}
														className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
													>
														Edit
													</Link>
													<span className="text-gray-300 dark:text-gray-600">
														|
													</span>
													<button
														onClick={() => openDeleteModal(book._id)}
														className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
													>
														Delete
													</button>
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
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
