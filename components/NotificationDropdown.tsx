"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Notification {
	_id: string;
	type: "reminder" | "overdue";
	message: string;
	read: boolean;
	createdAt: string;
	bookId: {
		_id: string;
		title: string;
		author: string;
		coverImage?: string;
	};
}

export default function NotificationDropdown() {
	const { data: session } = useSession();
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (session) {
			fetchNotifications();
		}
	}, [session]);

	const fetchNotifications = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/notifications?unreadOnly=true");
			if (response.ok) {
				const data = await response.json();
				setNotifications(data);
			}
		} catch (error) {
			console.error("Failed to fetch notifications:", error);
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (notificationId: string) => {
		try {
			const response = await fetch("/api/notifications", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ notificationId }),
			});

			if (response.ok) {
				setNotifications(notifications.filter((n) => n._id !== notificationId));
			}
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
		}
	};

	const markAllAsRead = async () => {
		try {
			const response = await fetch("/api/notifications", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ markAllAsRead: true }),
			});

			if (response.ok) {
				setNotifications([]);
			}
		} catch (error) {
			console.error("Failed to mark all as read:", error);
		}
	};

	if (!session) {
		return null;
	}

	const unreadCount = notifications.length;

	return (
		<div className="relative">
			{/* Notification Bell Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
				{unreadCount > 0 && (
					<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
						{unreadCount > 9 ? "9+" : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown Menu */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					></div>

					{/* Dropdown Panel */}
					<div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 max-h-[32rem] overflow-hidden flex flex-col">
						{/* Header */}
						<div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white">
								Notifications
							</h3>
							{unreadCount > 0 && (
								<button
									onClick={markAllAsRead}
									className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
								>
									Mark all as read
								</button>
							)}
						</div>

						{/* Notifications List */}
						<div className="overflow-y-auto flex-1">
							{loading ? (
								<div className="p-4 text-center text-gray-500 dark:text-gray-400">
									Loading...
								</div>
							) : notifications.length === 0 ? (
								<div className="p-8 text-center text-gray-500 dark:text-gray-400">
									<svg
										className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
										/>
									</svg>
									<p>No new notifications</p>
								</div>
							) : (
								notifications.map((notification) => (
									<div
										key={notification._id}
										className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center mb-1">
													{notification.type === "overdue" ? (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
															Overdue
														</span>
													) : (
														<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
															Reminder
														</span>
													)}
												</div>
												<p className="text-sm text-gray-900 dark:text-gray-100 mb-1">
													{notification.message}
												</p>
												<p className="text-xs text-gray-500 dark:text-gray-400">
													{new Date(
														notification.createdAt
													).toLocaleDateString()}{" "}
													{new Date(notification.createdAt).toLocaleTimeString(
														[],
														{
															hour: "2-digit",
															minute: "2-digit",
														}
													)}
												</p>
											</div>
											<button
												onClick={() => markAsRead(notification._id)}
												className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
												title="Mark as read"
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
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									</div>
								))
							)}
						</div>

						{/* Footer */}
						<div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
							<Link
								href="/dashboard/settings"
								className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 block text-center"
								onClick={() => setIsOpen(false)}
							>
								Notification Settings
							</Link>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
