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
	averageRating?: number;
	reviewCount?: number;
	createdAt: string;
	updatedAt: string;
}

interface Review {
	_id: string;
	bookId: string;
	userId: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	rating: number;
	comment: string;
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
	const [reviews, setReviews] = useState<Review[]>([]);
	const [reviewsLoading, setReviewsLoading] = useState(true);
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [editingReview, setEditingReview] = useState<string | null>(null);
	const [editRating, setEditRating] = useState(5);
	const [editComment, setEditComment] = useState("");

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	useEffect(() => {
		if (session && bookId) {
			fetchBook();
			fetchReviews();
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

	const fetchReviews = async () => {
		try {
			const response = await fetch(`/api/reviews?bookId=${bookId}`);
			if (response.ok) {
				const data = await response.json();
				setReviews(data.reviews);
			}
		} catch (err) {
			console.error("Error fetching reviews:", err);
		} finally {
			setReviewsLoading(false);
		}
	};

	const handleSubmitReview = async (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const response = await fetch("/api/reviews", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ bookId, rating, comment }),
			});

			const data = await response.json();

			if (response.ok) {
				setComment("");
				setRating(5);
				await fetchReviews();
				await fetchBook(); // Refresh to update average rating
			} else {
				alert(data.error || "Failed to submit review");
			}
		} catch (err) {
			alert("An error occurred while submitting your review");
		} finally {
			setSubmitting(false);
		}
	};

	const handleEditReview = async (reviewId: string) => {
		setSubmitting(true);

		try {
			const response = await fetch(`/api/reviews/${reviewId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ rating: editRating, comment: editComment }),
			});

			const data = await response.json();

			if (response.ok) {
				setEditingReview(null);
				await fetchReviews();
				await fetchBook(); // Refresh to update average rating
			} else {
				alert(data.error || "Failed to update review");
			}
		} catch (err) {
			alert("An error occurred while updating your review");
		} finally {
			setSubmitting(false);
		}
	};

	const handleDeleteReview = async (reviewId: string) => {
		if (!confirm("Are you sure you want to delete this review?")) return;

		try {
			const response = await fetch(`/api/reviews/${reviewId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				await fetchReviews();
				await fetchBook(); // Refresh to update average rating
			} else {
				const data = await response.json();
				alert(data.error || "Failed to delete review");
			}
		} catch (err) {
			alert("An error occurred while deleting your review");
		}
	};

	const startEditReview = (review: Review) => {
		setEditingReview(review._id);
		setEditRating(review.rating);
		setEditComment(review.comment);
	};

	const cancelEdit = () => {
		setEditingReview(null);
		setEditRating(5);
		setEditComment("");
	};

	const renderStars = (
		rating: number,
		interactive: boolean = false,
		onRate?: (rating: number) => void
	) => {
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						onClick={() => interactive && onRate && onRate(star)}
						disabled={!interactive}
						className={`${
							interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
						} transition-transform`}
						aria-label={`${interactive ? "Rate" : "Rating"} ${star} star${
							star > 1 ? "s" : ""
						}`}
					>
						<svg
							className={`w-6 h-6 ${
								star <= rating
									? "text-yellow-400 fill-current"
									: "text-gray-300 dark:text-gray-600"
							}`}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
							/>
						</svg>
					</button>
				))}
			</div>
		);
	};

	const userHasReviewed = reviews.some(
		(review) => review.userId._id === session?.user?.id
	);

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

					{/* Average Rating Section */}
					{book.reviewCount && book.reviewCount > 0 ? (
						<div className="px-8 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
							<div className="flex items-center gap-4">
								<div className="text-4xl font-bold text-gray-900 dark:text-white">
									{book.averageRating?.toFixed(1) || "0.0"}
								</div>
								<div>
									{renderStars(Math.round(book.averageRating || 0))}
									<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
										{book.reviewCount}{" "}
										{book.reviewCount === 1 ? "review" : "reviews"}
									</p>
								</div>
							</div>
						</div>
					) : null}
				</div>

				{/* Reviews Section */}
				<div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-8">
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
						Reviews & Ratings
					</h2>

					{/* Review Form */}
					{!userHasReviewed ? (
						<div className="mb-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								Write a Review
							</h3>
							<form onSubmit={handleSubmitReview}>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Your Rating
									</label>
									{renderStars(rating, true, setRating)}
								</div>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
										Your Comment
									</label>
									<textarea
										value={comment}
										onChange={(e) => setComment(e.target.value)}
										rows={4}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
										placeholder="Share your thoughts about this book..."
										minLength={10}
										maxLength={1000}
										required
									/>
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										{comment.length}/1000 characters (minimum 10)
									</p>
								</div>
								<button
									type="submit"
									disabled={submitting || comment.length < 10}
									className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md font-semibold transition-colors"
								>
									{submitting ? "Submitting..." : "Submit Review"}
								</button>
							</form>
						</div>
					) : (
						<div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
							<p className="text-blue-800 dark:text-blue-200">
								You have already reviewed this book. You can edit or delete your
								review below.
							</p>
						</div>
					)}

					{/* Reviews List */}
					<div className="space-y-6">
						{reviewsLoading ? (
							<div className="text-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
							</div>
						) : reviews.length === 0 ? (
							<p className="text-center text-gray-500 dark:text-gray-400 py-8">
								No reviews yet. Be the first to review this book!
							</p>
						) : (
							reviews.map((review) => (
								<div
									key={review._id}
									className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
								>
									{editingReview === review._id ? (
										<div>
											<div className="mb-4">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Rating
												</label>
												{renderStars(editRating, true, setEditRating)}
											</div>
											<div className="mb-4">
												<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
													Comment
												</label>
												<textarea
													value={editComment}
													onChange={(e) => setEditComment(e.target.value)}
													rows={4}
													className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
													minLength={10}
													maxLength={1000}
													required
													aria-label="Edit review comment"
												/>
											</div>
											<div className="flex gap-3">
												<button
													onClick={() => handleEditReview(review._id)}
													disabled={submitting || editComment.length < 10}
													className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md font-semibold transition-colors"
												>
													{submitting ? "Saving..." : "Save Changes"}
												</button>
												<button
													onClick={cancelEdit}
													disabled={submitting}
													className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
												>
													Cancel
												</button>
											</div>
										</div>
									) : (
										<div>
											<div className="flex items-start justify-between mb-3">
												<div>
													<p className="font-semibold text-gray-900 dark:text-white">
														{review.userId.firstName} {review.userId.lastName}
													</p>
													<div className="flex items-center gap-2 mt-1">
														{renderStars(review.rating)}
														<span className="text-sm text-gray-500 dark:text-gray-400">
															{new Date(review.createdAt).toLocaleDateString()}
														</span>
													</div>
												</div>
												{review.userId._id === session?.user?.id && (
													<div className="flex gap-2">
														<button
															onClick={() => startEditReview(review)}
															className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
															title="Edit review"
														>
															Edit
														</button>
														<button
															onClick={() => handleDeleteReview(review._id)}
															className="text-sm text-red-600 dark:text-red-400 hover:underline"
															title="Delete review"
														>
															Delete
														</button>
													</div>
												)}
											</div>
											<p className="text-gray-700 dark:text-gray-300 leading-relaxed">
												{review.comment}
											</p>
											{review.updatedAt !== review.createdAt && (
												<p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
													Edited on{" "}
													{new Date(review.updatedAt).toLocaleDateString()}
												</p>
											)}
										</div>
									)}
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
