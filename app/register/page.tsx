"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Validation
		if (
			!formData.firstName ||
			!formData.lastName ||
			!formData.email ||
			!formData.password
		) {
			setError("All fields are required");
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			setError("Password must be at least 6 characters long");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/auth/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: formData.firstName,
					lastName: formData.lastName,
					email: formData.email,
					password: formData.password,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				setError(data.error || "Registration failed");
				setLoading(false);
				return;
			}

			setSuccess(
				data.message || "Registration successful! Redirecting to login..."
			);
			setTimeout(() => {
				router.push("/login");
			}, 2000);
		} catch (err) {
			setError("An error occurred. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className="flex min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
			{/* Left Side - Form */}
			<div className="flex-1 flex items-center px-4 sm:px-6 lg:px-20 xl:px-32 py-12">
				<div className="max-w-md w-full space-y-8">
					<div>
						<h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
							Create Your Account
						</h2>
						<p className="text-base text-gray-600 dark:text-gray-400">
							Enter your details to get started with Library
						</p>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
						{error && (
							<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
								<p className="text-sm text-red-800 dark:text-red-200">
									{error}
								</p>
							</div>
						)}
						{success && (
							<div className="rounded-md bg-green-50 dark:bg-green-900/20 p-4">
								<p className="text-sm text-green-800 dark:text-green-200">
									{success}
								</p>
							</div>
						)}
						<div className="space-y-5">
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									First Name
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									required
									className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
									placeholder="John"
									value={formData.firstName}
									onChange={(e) =>
										setFormData({ ...formData, firstName: e.target.value })
									}
								/>
							</div>
							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Last Name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									required
									className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
									placeholder="Doe"
									value={formData.lastName}
									onChange={(e) =>
										setFormData({ ...formData, lastName: e.target.value })
									}
								/>
							</div>
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
									placeholder="john.doe@example.com"
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									required
									className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
									placeholder="••••••••"
									value={formData.password}
									onChange={(e) =>
										setFormData({ ...formData, password: e.target.value })
									}
								/>
							</div>
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									autoComplete="new-password"
									required
									className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
									placeholder="••••••••"
									value={formData.confirmPassword}
									onChange={(e) =>
										setFormData({
											...formData,
											confirmPassword: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{loading ? "Creating account..." : "Register"}
							</button>
						</div>

						<div className="text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Already have an account?{" "}
								<Link
									href="/login"
									className="font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
								>
									Sign in
								</Link>
							</p>
						</div>
					</form>
				</div>
			</div>

			{/* Right Side - Image Placeholder */}
			<div className="hidden lg:block relative flex-1 bg-gray-100 dark:bg-gray-800">
				<div className="absolute inset-0 flex items-center justify-center">
					<svg
						className="w-64 h-64 text-gray-300 dark:text-gray-600"
						fill="currentColor"
						viewBox="0 0 24 24"
					>
						<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
					</svg>
				</div>
			</div>
		</div>
	);
}
