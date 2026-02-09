import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Required for Docker deployment -- produces a standalone folder with all deps
	output: "standalone",
};

export default nextConfig;
