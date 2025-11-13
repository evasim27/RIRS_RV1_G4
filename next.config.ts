import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Allow external images from any domain. Use `remotePatterns` with
	// wildcard hostnames for flexible matching and set `unoptimized: true`
	// as a fallback to avoid the Next.js image optimizer blocking unknown hosts.
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "**", port: "", pathname: "/**" },
			{ protocol: "http", hostname: "**", port: "", pathname: "/**" },
		],
		unoptimized: true,
	},
};

export default nextConfig;
