"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError("");

		// Validation
		if (!formData.email || !formData.password) {
			setError("Please enter both email and password");
			return;
		}

		setLoading(true);

		try {
			const result = await signIn("credentials", {
				redirect: false,
				email: formData.email,
				password: formData.password,
			});

			if (result?.error) {
				setError(result.error);
				setLoading(false);
			} else if (result?.ok) {
				// Redirect to dashboard on successful login
				router.push("/dashboard");
				router.refresh();
			}
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
							Welcome Back
						</h2>
						<p className="text-base text-gray-600 dark:text-gray-400">
							Enter your credentials to access your account.
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
						<div className="space-y-5">
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Email address
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="h-5 w-5 text-gray-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
											/>
										</svg>
									</div>
									<input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
										placeholder="you@example.com"
										value={formData.email}
										onChange={(e) =>
											setFormData({ ...formData, email: e.target.value })
										}
									/>
								</div>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2"
								>
									Password
								</label>
								<div className="relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<svg
											className="h-5 w-5 text-gray-400"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
											/>
										</svg>
									</div>
									<input
										id="password"
										name="password"
										type="password"
										autoComplete="current-password"
										required
										className="appearance-none block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent sm:text-sm"
										placeholder="••••••••"
										value={formData.password}
										onChange={(e) =>
											setFormData({ ...formData, password: e.target.value })
										}
									/>
								</div>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 dark:focus:ring-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{loading ? "Signing in..." : "Login"}
							</button>
						</div>

						<div className="text-center">
							<p className="text-sm text-gray-600 dark:text-gray-400">
								New to Library?{" "}
								<Link
									href="/register"
									className="font-semibold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
								>
									Create account
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
