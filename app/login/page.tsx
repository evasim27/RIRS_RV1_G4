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
		<div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
			<div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl">
				<div>
					<h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						Access your library dashboard
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					{error && (
						<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
							<p className="text-sm text-red-800 dark:text-red-200">{error}</p>
						</div>
					)}
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Email address
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Email address"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 dark:text-gray-300"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Password"
								value={formData.password}
								onChange={(e) =>
									setFormData({ ...formData, password: e.target.value })
								}
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={loading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>
					</div>

					<div className="text-center">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Don't have an account?{" "}
							<Link
								href="/register"
								className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
							>
								Register now
							</Link>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
}
