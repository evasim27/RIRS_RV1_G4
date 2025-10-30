"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Book {
	_id: string;
	title: string;
	author: string;
	description: string;
	category: string;
	status: string;
	coverImage?: string;
	publicationDate?: string;
	isbn?: string;
	createdAt: string;
	updatedAt: string;
}

export default function BookDetailsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const params = useParams();
	const bookId = params?.id as string;

	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [book, setBook] = useState<Book | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (session && bookId) {
			fetchBook();
		}
	}, [session, bookId]);

	const fetchBook = async () => {
		try {
			const response = await fetch(`/api/books/${bookId}`);
			if (!response.ok) {
				setError("Failed to fetch book details");
				setLoading(false);
				return;
			}

			const data = await response.json();
			setBook(data.book);
			setLoading(false);
		} catch (err) {
			setError("An error occurred while fetching book details");
			setLoading(false);
		}
	};

	const formatDate = (dateString?: string) => {
		if (!dateString) return "N/A";
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
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

	if (!session || error || !book) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<p className="text-red-600 dark:text-red-400 mb-4">
						{error || "Book not found"}
					</p>
					<Link
						href="/dashboard"
						className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold"
					>
						Back to Dashboard
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Book Details
					</h1>
					<Link
						href="/dashboard"
						className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						← Back to Dashboard
					</Link>
				</div>

				{/* Book Details Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
					<div className="md:flex">
						{/* Book Cover */}
						<div className="md:w-1/3 bg-gray-200 dark:bg-gray-700 p-8 flex items-center justify-center">
							{book.coverImage ? (
								<div className="relative w-full h-96">
									<Image
										src={book.coverImage}
										alt={book.title}
										fill
										className="object-contain rounded-lg"
									/>
								</div>
							) : (
								<div className="w-full h-96 flex flex-col items-center justify-center bg-gray-300 dark:bg-gray-600 rounded-lg">
									<svg
										className="w-24 h-24 text-gray-400 dark:text-gray-500"
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
									<p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
										No cover image
									</p>
								</div>
							)}
						</div>

						{/* Book Information */}
						<div className="md:w-2/3 p-8">
							<div className="mb-6">
								<h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
									{book.title}
								</h2>
								<p className="text-xl text-gray-600 dark:text-gray-400">
									by {book.author}
								</p>
							</div>

							{/* Status Badge */}
							<div className="mb-6">
								<span
									className={`inline-block px-4 py-1 rounded-full text-sm font-semibold ${
										book.status === "Available"
											? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
											: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
									}`}
								>
									{book.status}
								</span>
							</div>

							{/* Description */}
							<div className="mb-6">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									Description
								</h3>
								<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
									{book.description}
								</p>
							</div>

							{/* Details Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
								<div>
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
										Category
									</h3>
									<p className="text-gray-900 dark:text-white">
										{book.category}
									</p>
								</div>

								{book.isbn && (
									<div>
										<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
											ISBN
										</h3>
										<p className="text-gray-900 dark:text-white">{book.isbn}</p>
									</div>
								)}

								<div>
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
										Publication Date
									</h3>
									<p className="text-gray-900 dark:text-white">
										{formatDate(book.publicationDate)}
									</p>
								</div>

								<div>
									<h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
										Added to Library
									</h3>
									<p className="text-gray-900 dark:text-white">
										{formatDate(book.createdAt)}
									</p>
								</div>
							</div>

							{/* Action Buttons */}
							<div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
								<Link
									href={`/dashboard/books/edit/${book._id}`}
									className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold"
								>
									Edit Book
								</Link>
								<Link
									href="/dashboard"
									className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
								>
									Back to Catalog
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
