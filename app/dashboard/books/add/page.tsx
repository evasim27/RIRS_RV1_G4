"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";

export default function AddBookPage() {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const [formData, setFormData] = useState({
		title: "",
		author: "",
		description: "",
		category: "",
		status: "Available",
		coverImage: "",
		publicationDate: "",
		isbn: "",
	});

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		}
	}, [status, router]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validate required fields
		if (
			!formData.title ||
			!formData.author ||
			!formData.description ||
			!formData.category ||
			!formData.status
		) {
			setError("Please fill in all required fields");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/books", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Failed to add book");
				setLoading(false);
				return;
			}

			setSuccess("Book added successfully!");
			setTimeout(() => {
				router.push("/dashboard");
			}, 1500);
		} catch (err) {
			setError("An error occurred. Please try again.");
			setLoading(false);
		}
	};

	if (status === "loading" || !session) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-4rem)]">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="text-3xl font-bold text-gray-900 dark:text-white">
						Add New Book
					</h1>
					<Link
						href="/dashboard"
						className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						← Back to Dashboard
					</Link>
				</div>

				{/* Form */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8">
					{error && (
						<div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
							<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
						</div>
					)}

					{success && (
						<div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
							<p className="text-sm text-green-800 dark:text-green-200">
								{success}
							</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Book Information */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								Book Information
							</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="title"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Title <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="title"
										required
										value={formData.title}
										onChange={(e) =>
											setFormData({ ...formData, title: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="The Silent Patient"
									/>
								</div>

								<div>
									<label
										htmlFor="author"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Author <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										id="author"
										required
										value={formData.author}
										onChange={(e) =>
											setFormData({ ...formData, author: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="Alex Michaelides"
									/>
								</div>

								<div>
									<label
										htmlFor="publicationDate"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Publication Date
									</label>
									<input
										type="date"
										id="publicationDate"
										value={formData.publicationDate}
										onChange={(e) =>
											setFormData({
												...formData,
												publicationDate: e.target.value,
											})
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									/>
								</div>
							</div>
						</div>

						{/* Details & Classification */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								Details & Classification
							</h2>
							<div className="space-y-4">
								<div>
									<label
										htmlFor="description"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Description <span className="text-red-500">*</span>
									</label>
									<textarea
										id="description"
										required
										rows={4}
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="A riveting psychological thriller that explores the dark depths of human psyche..."
									/>
								</div>

								<div>
									<label
										htmlFor="category"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Category <span className="text-red-500">*</span>
									</label>
									<select
										id="category"
										required
										value={formData.category}
										onChange={(e) =>
											setFormData({ ...formData, category: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									>
										<option value="">Select a category</option>
										<option value="Science Fiction">Science Fiction</option>
										<option value="Fantasy">Fantasy</option>
										<option value="Biography">Biography</option>
										<option value="History">History</option>
										<option value="Mystery">Mystery</option>
										<option value="Thriller">Thriller</option>
										<option value="Romance">Romance</option>
										<option value="Non-Fiction">Non-Fiction</option>
										<option value="Self-Help">Self-Help</option>
										<option value="Other">Other</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="status"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										Status <span className="text-red-500">*</span>
									</label>
									<select
										id="status"
										required
										value={formData.status}
										onChange={(e) =>
											setFormData({ ...formData, status: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									>
										<option value="Available">Available</option>
										<option value="Borrowed">Borrowed</option>
									</select>
								</div>

								<div>
									<label
										htmlFor="isbn"
										className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
									>
										ISBN
									</label>
									<input
										type="text"
										id="isbn"
										value={formData.isbn}
										onChange={(e) =>
											setFormData({ ...formData, isbn: e.target.value })
										}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
										placeholder="978-3-16-148410-0"
									/>
								</div>
							</div>
						</div>

						{/* Book Cover */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
								Book Cover
							</h2>
							<div>
								<label
									htmlFor="coverImage"
									className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
								>
									Cover Image URL
								</label>
								<input
									type="url"
									id="coverImage"
									value={formData.coverImage}
									onChange={(e) =>
										setFormData({ ...formData, coverImage: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
									placeholder="https://example.com/book-cover.jpg"
								/>
								<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
									Enter a URL to an image or leave blank for default
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-3 justify-end pt-4">
							<Link
								href="/dashboard"
								className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-semibold"
							>
								Cancel
							</Link>
							<button
								type="submit"
								disabled={loading}
								className="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Saving..." : "Save Book"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
