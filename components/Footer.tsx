import Link from "next/link";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					{/* About Section */}
					<div className="col-span-1 md:col-span-2">
						<div className="flex items-center mb-4">
							<svg
								className="w-8 h-8 text-indigo-600 dark:text-indigo-400"
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
							<span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
								Library Management System
							</span>
						</div>
						<p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
							A modern library management system that simplifies book
							reservations and user management. Built with Next.js and MongoDB.
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
							Quick Links
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard"
									className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
								>
									Dashboard
								</Link>
							</li>
							<li>
								<Link
									href="/books"
									className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
								>
									Browse Books
								</Link>
							</li>
						</ul>
					</div>

					{/* Account */}
					<div>
						<h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
							Account
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/login"
									className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
								>
									Login
								</Link>
							</li>
							<li>
								<Link
									href="/register"
									className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm transition-colors"
								>
									Register
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
					<div className="flex flex-col md:flex-row justify-between items-center">
						<p className="text-sm text-gray-500 dark:text-gray-400">
							&copy; {currentYear} Library Management System. All rights
							reserved.
						</p>
						<div className="flex space-x-6 mt-4 md:mt-0">
							<a
								href="#"
								className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
							>
								<span className="sr-only">Privacy Policy</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										fillRule="evenodd"
										d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-2h2v2h-2zm2-4h-2c0-3.25 3-3 3-5 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 2.5-3 2.75-3 5z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a
								href="#"
								className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
							>
								<span className="sr-only">Terms of Service</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										fillRule="evenodd"
										d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
							<a
								href="https://github.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
							>
								<span className="sr-only">GitHub</span>
								<svg
									className="h-5 w-5"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										fillRule="evenodd"
										d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
										clipRule="evenodd"
									/>
								</svg>
							</a>
						</div>
					</div>
					<div className="mt-4 text-center">
						<p className="text-xs text-gray-400 dark:text-gray-500">
							Built with Next.js, MongoDB, and NextAuth.js
						</p>
					</div>
				</div>
			</div>
		</footer>
	);
}
