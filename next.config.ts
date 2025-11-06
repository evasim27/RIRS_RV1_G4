import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Allow external image hostname so `next/image` can load images from it.
	images: {
		domains: ["www.gacka053.com"],
		// If you later need more flexible matching, consider using `remotePatterns`.
	},
};

export default nextConfig;
