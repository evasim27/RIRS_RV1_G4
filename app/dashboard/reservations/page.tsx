"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Reservation {
	_id: string;
	userId: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	bookId: {
		_id: string;
		title: string;
		author: string;
		coverImage?: string;
	};
	status: "Pending" | "Confirmed" | "Cancelled";
	reservationDate: string;
	createdAt: string;
	updatedAt: string;
}

export default function ReservationsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [actionLoading, setActionLoading] = useState<string | null>(null);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated") {
			// Check if user is librarian or admin
			if (session.user.role !== "librarian" && session.user.role !== "admin") {
				router.push("/dashboard");
			} else {
				fetchReservations();
			}
		}
	}, [status, session, router, statusFilter]);

	const fetchReservations = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (statusFilter !== "all") params.append("status", statusFilter);
			if (searchQuery) params.append("search", searchQuery);

			const response = await fetch(`/api/reservations?${params.toString()}`);

			if (response.ok) {
				const data = await response.json();
				setReservations(data);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text: data.message || "Failed to load reservations",
				});
			}
		} catch (error) {
			console.error("Failed to fetch reservations:", error);
			setMessage({
				type: "error",
				text: "Failed to load reservations",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleConfirmPickup = async (reservationId: string) => {
		try {
			setActionLoading(reservationId);
			setMessage(null);

			const response = await fetch(`/api/reservations/${reservationId}`, {
				method: "PATCH",
			});

			if (response.ok) {
				setMessage({
					type: "success",
					text: "Pickup confirmed. Book is now borrowed.",
				});
				fetchReservations();
				setTimeout(() => setMessage(null), 3000);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text: data.message || "Failed to confirm pickup",
				});
			}
		} catch (error) {
			console.error("Failed to confirm pickup:", error);
			setMessage({
				type: "error",
				text: "Failed to confirm pickup",
			});
		} finally {
			setActionLoading(null);
		}
	};

	const handleCancelReservation = async (reservationId: string) => {
		try {
			setActionLoading(reservationId);
			setMessage(null);

			const response = await fetch(`/api/reservations/${reservationId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				setMessage({
					type: "success",
					text: "Reservation cancelled successfully",
				});
				fetchReservations();
				setTimeout(() => setMessage(null), 3000);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text: data.message || "Failed to cancel reservation",
				});
			}
		} catch (error) {
			console.error("Failed to cancel reservation:", error);
			setMessage({
				type: "error",
				text: "Failed to cancel reservation",
			});
		} finally {
			setActionLoading(null);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchReservations();
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (
		!session ||
		(session.user.role !== "librarian" && session.user.role !== "admin")
	) {
		return null;
	}

	const totalReservations = reservations.length;
	const pendingCount = reservations.filter(
		(r) => r.status === "Pending"
	).length;
	const confirmedCount = reservations.filter(
		(r) => r.status === "Confirmed"
	).length;
	const cancelledCount = reservations.filter(
		(r) => r.status === "Cancelled"
	).length;

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => router.back()}
						className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4"
					>
						<svg
							className="w-5 h-5 mr-1"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back
					</button>
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white">
						Reservations Management
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Manage book reservations and confirm pickups
					</p>
				</div>

				{/* Content */}
				<div>
					{/* Message */}
					{message && (
						<div
							className={`mb-6 p-4 rounded-lg ${
								message.type === "success"
									? "bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200"
									: "bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200"
							}`}
						>
							{message.text}
						</div>
					)}

					{/* Statistics */}
					<div className="grid grid-cols-4 gap-6 mb-8">
						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
							<div className="flex items-center mb-2">
								<svg
									className="w-5 h-5 text-gray-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
									/>
								</svg>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Total Reservations
							</div>
							<div className="text-3xl font-bold text-gray-900 dark:text-white">
								{totalReservations}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
							<div className="flex items-center mb-2">
								<svg
									className="w-5 h-5 text-gray-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Pending
							</div>
							<div className="text-3xl font-bold text-gray-900 dark:text-white">
								{pendingCount}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
							<div className="flex items-center mb-2">
								<svg
									className="w-5 h-5 text-gray-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Confirmed
							</div>
							<div className="text-3xl font-bold text-gray-900 dark:text-white">
								{confirmedCount}
							</div>
						</div>

						<div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
							<div className="flex items-center mb-2">
								<svg
									className="w-5 h-5 text-gray-400 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
								Cancelled
							</div>
							<div className="text-3xl font-bold text-gray-900 dark:text-white">
								{cancelledCount}
							</div>
						</div>
					</div>

					{/* Filter Section */}
					<div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
							Filter Reservations
						</h2>
						<div className="flex gap-4">
							<button
								onClick={() => setStatusFilter("all")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									statusFilter === "all"
										? "bg-gray-900 dark:bg-gray-700 text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								All
							</button>
							<button
								onClick={() => setStatusFilter("Pending")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									statusFilter === "Pending"
										? "bg-gray-900 dark:bg-gray-700 text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								Pending
							</button>
							<button
								onClick={() => setStatusFilter("Confirmed")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									statusFilter === "Confirmed"
										? "bg-gray-900 dark:bg-gray-700 text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								Confirmed
							</button>
							<button
								onClick={() => setStatusFilter("Cancelled")}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
									statusFilter === "Cancelled"
										? "bg-gray-900 dark:bg-gray-700 text-white"
										: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
								}`}
							>
								Cancelled
							</button>
							<form onSubmit={handleSearch} className="flex-1 flex gap-2">
								<input
									type="text"
									placeholder="Search reservations..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
								/>
							</form>
						</div>
					</div>

					{/* Reservations Table */}
					<div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Book
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Date
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{reservations.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
										>
											No reservations found
										</td>
									</tr>
								) : (
									reservations.map((reservation) => (
										<tr
											key={reservation._id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
														<span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
															{reservation.userId?.firstName?.[0]}
															{reservation.userId?.lastName?.[0]}
														</span>
													</div>
													<div className="ml-3">
														<div className="text-sm font-medium text-gray-900 dark:text-white">
															{reservation.userId?.firstName}{" "}
															{reservation.userId?.lastName}
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{reservation.userId?.email}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="flex items-center">
													<svg
														className="w-5 h-5 text-gray-400 mr-2"
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
													<div className="text-sm text-gray-900 dark:text-white">
														{reservation.bookId?.title}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{new Date(
													reservation.reservationDate
												).toLocaleDateString()}
												<br />
												{new Date(
													reservation.reservationDate
												).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
														reservation.status === "Confirmed"
															? "bg-gray-700 text-white dark:bg-gray-600"
															: reservation.status === "Pending"
															? "bg-gray-700 text-white dark:bg-gray-600"
															: "bg-gray-700 text-white dark:bg-gray-600"
													}`}
												>
													{reservation.status}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
												{reservation.status === "Pending" && (
													<>
														<button
															onClick={() =>
																handleConfirmPickup(reservation._id)
															}
															disabled={actionLoading === reservation._id}
															className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
														>
															{actionLoading === reservation._id
																? "Processing..."
																: "Confirm Pickup"}
														</button>
														<button
															onClick={() =>
																handleCancelReservation(reservation._id)
															}
															disabled={actionLoading === reservation._id}
															className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
														>
															Cancel Reservation
														</button>
													</>
												)}
												{reservation.status === "Confirmed" && (
													<span className="text-gray-500 dark:text-gray-400">
														Pickup confirmed
													</span>
												)}
												{reservation.status === "Cancelled" && (
													<span className="text-gray-500 dark:text-gray-400">
														Cancelled
													</span>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Pagination Info */}
					{reservations.length > 0 && (
						<div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
							Showing 1 - {reservations.length} of {reservations.length}{" "}
							reservations
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
