"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: "user" | "librarian" | "admin";
	blocked: boolean;
	createdAt: string;
	updatedAt: string;
}

export default function UserManagementPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [users, setUsers] = useState<User[]>([]);
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
			// Check if user is admin
			if (session.user.role !== "admin") {
				router.push("/dashboard");
			} else {
				fetchUsers();
			}
		}
	}, [status, session, router]);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (searchQuery) params.append("search", searchQuery);
			if (statusFilter !== "all") params.append("status", statusFilter);

			const response = await fetch(`/api/users?${params.toString()}`);

			if (response.ok) {
				const data = await response.json();
				setUsers(data);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text: data.message || "Failed to load users",
				});
			}
		} catch (error) {
			console.error("Failed to fetch users:", error);
			setMessage({
				type: "error",
				text: "Failed to load users",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleBlockUnblock = async (userId: string, blocked: boolean) => {
		try {
			setActionLoading(userId);
			setMessage(null);

			const response = await fetch("/api/users", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ userId, blocked }),
			});

			if (response.ok) {
				setMessage({
					type: "success",
					text: `User ${blocked ? "blocked" : "unblocked"} successfully`,
				});
				// Update local state
				setUsers(
					users.map((user) =>
						user._id === userId ? { ...user, blocked } : user
					)
				);
				setTimeout(() => setMessage(null), 3000);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text:
						data.message || `Failed to ${blocked ? "block" : "unblock"} user`,
				});
			}
		} catch (error) {
			console.error("Failed to update user status:", error);
			setMessage({
				type: "error",
				text: `Failed to ${blocked ? "block" : "unblock"} user`,
			});
		} finally {
			setActionLoading(null);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		fetchUsers();
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!session || session.user.role !== "admin") {
		return null;
	}

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
						User Management
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Manage user accounts, view status, and block/unblock users
					</p>
				</div>

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

				{/* Search and Filter */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 mb-6">
					<form
						onSubmit={handleSearch}
						className="flex flex-col sm:flex-row gap-4"
					>
						<div className="flex-1">
							<input
								type="text"
								placeholder="Search users by name or email..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
							/>
						</div>
						<div>
							<select
								title="Status Filter"
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value);
								}}
								className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
							>
								<option value="all">All Statuses</option>
								<option value="active">Active</option>
								<option value="blocked">Blocked</option>
							</select>
						</div>
						<button
							type="submit"
							className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
						>
							Search
						</button>
					</form>
				</div>

				{/* User List */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
							<thead className="bg-gray-50 dark:bg-gray-900">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										User
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Role
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Email
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Last Login
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
								{users.length === 0 ? (
									<tr>
										<td
											colSpan={6}
											className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
										>
											No users found
										</td>
									</tr>
								) : (
									users.map((user) => (
										<tr
											key={user._id}
											className="hover:bg-gray-50 dark:hover:bg-gray-700"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center">
													<div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
														<span className="text-white font-medium text-sm">
															{user.firstName[0]}
															{user.lastName[0]}
														</span>
													</div>
													<div className="ml-4">
														<div className="text-sm font-medium text-gray-900 dark:text-white">
															{user.firstName} {user.lastName}
														</div>
														<div className="text-sm text-gray-500 dark:text-gray-400">
															{user.email}
														</div>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
														user.role === "admin"
															? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
															: user.role === "librarian"
															? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
															: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
													}`}
												>
													{user.role.charAt(0).toUpperCase() +
														user.role.slice(1)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
												{user.email}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
														user.blocked
															? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
															: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
													}`}
												>
													{user.blocked ? "Blocked" : "Active"}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
												{new Date(user.updatedAt).toLocaleDateString()}
												<br />
												{new Date(user.updatedAt).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												{user._id === session.user.id ? (
													<span className="text-gray-400 dark:text-gray-500">
														(You)
													</span>
												) : (
													<button
														onClick={() =>
															handleBlockUnblock(user._id, !user.blocked)
														}
														disabled={actionLoading === user._id}
														className={`px-4 py-2 rounded-lg font-medium transition-colors ${
															user.blocked
																? "bg-green-600 hover:bg-green-700 text-white"
																: "bg-red-600 hover:bg-red-700 text-white"
														} disabled:opacity-50 disabled:cursor-not-allowed`}
													>
														{actionLoading === user._id
															? "Processing..."
															: user.blocked
															? "Unblock"
															: "Block"}
													</button>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Statistics */}
				<div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900 rounded-md p-3">
								<svg
									className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
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
							</div>
							<div className="ml-5">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Total Users
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{users.length}
									</dd>
								</dl>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
								<svg
									className="h-6 w-6 text-green-600 dark:text-green-400"
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
							<div className="ml-5">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Active Users
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{users.filter((u) => !u.blocked).length}
									</dd>
								</dl>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
						<div className="flex items-center">
							<div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-md p-3">
								<svg
									className="h-6 w-6 text-red-600 dark:text-red-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
									/>
								</svg>
							</div>
							<div className="ml-5">
								<dl>
									<dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
										Blocked Users
									</dt>
									<dd className="text-3xl font-semibold text-gray-900 dark:text-white">
										{users.filter((u) => u.blocked).length}
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
