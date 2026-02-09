import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/server/db";

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET,
	baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

	database: prismaAdapter(db, {
		provider: "postgresql",
	}),

	// Session configuration
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24, // Refresh session every 24 hours
		cookieCache: {
			enabled: true,
			maxAge: 60 * 5, // Cache session cookie for 5 minutes
		},
	},

	// Email + password authentication
	emailAndPassword: {
		enabled: true,
		minPasswordLength: 8,
	},

	// OAuth providers (configured via env vars)
	socialProviders: {
		...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: process.env.GITHUB_CLIENT_ID,
						clientSecret: process.env.GITHUB_CLIENT_SECRET,
					},
				}
			: {}),
		...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
			? {
					google: {
						clientId: process.env.GOOGLE_CLIENT_ID,
						clientSecret: process.env.GOOGLE_CLIENT_SECRET,
					},
				}
			: {}),
	},
});

// Export type for client-side usage
export type Auth = typeof auth;
