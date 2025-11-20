import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import TopNavbar from "@/components/TopNavbar";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import Footer from "@/components/Footer";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Library Management System",
	description: "A modern library management system with user authentication",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>
					<TopNavbar />
					<Sidebar />
					<div className="pt-16">
						<MainContent>
							<main className="min-h-[calc(100vh-4rem)]">{children}</main>
						</MainContent>
						<Footer />
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
