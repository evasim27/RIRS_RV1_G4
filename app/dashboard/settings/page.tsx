"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SettingsPage() {
	const { data: session, status } = useSession();
	const router = useRouter();

	const [notificationPreferences, setNotificationPreferences] = useState({
		dueDateReminders: true,
		overdueNotices: true,
	});
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<{
		type: "success" | "error";
		text: string;
	} | null>(null);

	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/login");
		} else if (status === "authenticated") {
			fetchSettings();
		}
	}, [status, router]);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/notifications/settings");

			if (response.ok) {
				const data = await response.json();
				setNotificationPreferences(data.notificationPreferences);
			} else {
				setMessage({
					type: "error",
					text: "Failed to load settings",
				});
			}
		} catch (error) {
			console.error("Failed to fetch settings:", error);
			setMessage({
				type: "error",
				text: "Failed to load settings",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleToggle = (key: "dueDateReminders" | "overdueNotices") => {
		setNotificationPreferences((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	const handleSave = async () => {
		try {
			setSaving(true);
			setMessage(null);

			const response = await fetch("/api/notifications/settings", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(notificationPreferences),
			});

			if (response.ok) {
				setMessage({
					type: "success",
					text: "Settings saved successfully!",
				});
				setTimeout(() => setMessage(null), 3000);
			} else {
				const data = await response.json();
				setMessage({
					type: "error",
					text: data.message || "Failed to save settings",
				});
			}
		} catch (error) {
			console.error("Failed to save settings:", error);
			setMessage({
				type: "error",
				text: "Failed to save settings",
			});
		} finally {
			setSaving(false);
		}
	};

	if (status === "loading" || loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
			</div>
		);
	}

	if (!session) {
		return null;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
						Notification Settings
					</h1>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Manage your notification preferences for due date reminders and
						overdue notices.
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

				{/* Settings Card */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
					<div className="space-y-6">
						{/* Due Date Reminders */}
						<div className="flex items-start justify-between">
							<div className="flex-1 pr-4">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									Due Date Reminders
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Receive a notification 2 days before a borrowed book is due.
									This helps you return books on time and avoid late fees.
								</p>
							</div>
							<button
								title="Toggle Due Date Remindersnow make"
								onClick={() => handleToggle("dueDateReminders")}
								className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
									notificationPreferences.dueDateReminders
										? "bg-indigo-600"
										: "bg-gray-200 dark:bg-gray-700"
								}`}
							>
								<span
									className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										notificationPreferences.dueDateReminders
											? "translate-x-5"
											: "translate-x-0"
									}`}
								/>
							</button>
						</div>

						<div className="border-t border-gray-200 dark:border-gray-700"></div>

						{/* Overdue Notices */}
						<div className="flex items-start justify-between">
							<div className="flex-1 pr-4">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									Overdue Notices
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Receive a notification when a borrowed book becomes overdue.
									This ensures you are aware of any late returns.
								</p>
							</div>
							<button
								title="Overdue Notices Toggle"
								onClick={() => handleToggle("overdueNotices")}
								className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
									notificationPreferences.overdueNotices
										? "bg-indigo-600"
										: "bg-gray-200 dark:bg-gray-700"
								}`}
							>
								<span
									className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
										notificationPreferences.overdueNotices
											? "translate-x-5"
											: "translate-x-0"
									}`}
								/>
							</button>
						</div>
					</div>

					{/* Save Button */}
					<div className="mt-8 flex justify-end">
						<button
							onClick={handleSave}
							disabled={saving}
							className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							{saving ? "Saving..." : "Save Settings"}
						</button>
					</div>
				</div>

				{/* Information Card */}
				<div className="mt-6 bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-6 w-6 text-blue-600 dark:text-blue-300"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
								About Notifications
							</h3>
							<div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
								<ul className="list-disc list-inside space-y-1">
									<li>
										Notifications are checked automatically and updated
										regularly.
									</li>
									<li>
										You can view all notifications by clicking the bell icon in
										the navigation bar.
									</li>
									<li>
										Disabling notifications will stop future notifications but
										won't remove existing ones.
									</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
