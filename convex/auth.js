import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Helper functions
function nowIso() {
	return new Date().toISOString();
}

function calculateSessionExpiry() {
	const now = new Date();
	now.setDate(now.getDate() + 30); // 30 days from now
	return now.toISOString();
}

function generateSessionToken() {
	// Generate a random UUID-like token
	return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Simple hash function (for development - in production use bcrypt via actions)
async function simpleHash(password) {
	// This is a placeholder - you should use bcrypt in production
	// For now, we'll just store the password as-is (NOT SECURE)
	return password;
}

async function simpleCompare(password, hash) {
	// This is a placeholder - you should use bcrypt in production
	return password === hash;
}

// Mutation: signup
export const signup = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.optional(v.string()),
	},
	handler: async (ctx, { email, password, name }) => {
		try {
			// Validate password length
			if (password.length < 8) {
				throw new Error("Password must be at least 8 characters long");
			}

			const normalizedEmail = email.toLowerCase().trim();

			// Check if user already exists
			const existing = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
				.filter(q => q.eq(q.field("isDeleted"), undefined))
				.unique();

			if (existing) {
				throw new Error("Email already registered");
			}

			// Hash password (using simple hash for now)
			const passwordHash = await simpleHash(password);

			// Create user
			const userId = await ctx.db.insert("users", {
				email: normalizedEmail,
				passwordHash,
				name: name || "",
				createdAt: nowIso(),
				updatedAt: nowIso(),
				role: "user",
				isActive: true,
				onboardingStep: 1,
				onboardingCompleted: false,
				interests: [],
			});

			// Generate session
			const sessionToken = generateSessionToken();
			const expiresAt = calculateSessionExpiry();

			// Create session
			await ctx.db.insert("sessions", {
				userId,
				sessionToken,
				expiresAt,
				createdAt: nowIso(),
			});

			return {
				success: true,
				sessionToken,
				userId,
			};
		} catch (error) {
			throw new Error(error.message || "Signup failed");
		}
	},
});

// Mutation: sign in
export const signIn = mutation({
	args: {
		email: v.string(),
		password: v.string(),
	},
	handler: async (ctx, { email, password }) => {
		try {
			const normalizedEmail = email.toLowerCase().trim();

			// Get user by email
			const user = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
				.unique();

			if (!user) {
				throw new Error("Invalid email or password");
			}

			// Check if user is deleted
			if (user.isDeleted) {
				return {
					status: "account_deleted",
					deletionInfo: {
						deletedAt: user.deletedAt,
						deletedBy: user.deletedBy,
						reason: "Account deleted by administrator",
						email: user.email,
						name: user.name || "User",
					},
				};
			}

			// Verify password (using simple compare for now)
			const passwordMatch = await simpleCompare(password, user.passwordHash);
			if (!passwordMatch) {
				throw new Error("Invalid email or password");
			}

			// Auto-reactivate deactivated users
			if (user.isActive === false) {
				await ctx.db.patch(user._id, {
					isActive: true,
					updatedAt: nowIso(),
				});
			}

			// Generate session
			const sessionToken = generateSessionToken();
			const expiresAt = calculateSessionExpiry();

			// Create session
			await ctx.db.insert("sessions", {
				userId: user._id,
				sessionToken,
				expiresAt,
				createdAt: nowIso(),
			});

			return {
				status: "success",
				sessionToken,
				userId: user._id,
			};
		} catch (error) {
			throw new Error(error.message || "Sign in failed");
		}
	},
});

// Mutation: admin sign in
export const adminSignIn = mutation({
	args: {
		email: v.string(),
		password: v.string(),
	},
	handler: async (ctx, { email, password }) => {
		try {
			const normalizedEmail = email.toLowerCase().trim();

			// Get user by email
			const user = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
				.unique();

			if (!user) {
				throw new Error("Invalid credentials");
			}

			// Check if user is deleted
			if (user.isDeleted) {
				return {
					status: "account_deleted",
					deletionInfo: {
						deletedAt: user.deletedAt,
						deletedBy: user.deletedBy,
						reason: "Account deleted by administrator",
						email: user.email,
						name: user.name || "Admin",
					},
				};
			}

			// Check admin role
			if (user.role !== "admin" && user.role !== "super_admin") {
				throw new Error("Access denied. Admin privileges required.");
			}

			// Check if admin account is active
			if (user.isActive === false) {
				throw new Error("Admin account is inactive. Contact super admin.");
			}

			// Verify password
			const passwordMatch = await simpleCompare(password, user.passwordHash);
			if (!passwordMatch) {
				throw new Error("Invalid credentials");
			}

			// Generate session
			const sessionToken = generateSessionToken();
			const expiresAt = calculateSessionExpiry();

			// Create session
			await ctx.db.insert("sessions", {
				userId: user._id,
				sessionToken,
				expiresAt,
				createdAt: nowIso(),
			});

			return {
				status: "success",
				sessionToken,
				userId: user._id,
				role: user.role,
				name: user.name || "",
				email: user.email,
			};
		} catch (error) {
			throw new Error(error.message || "Admin sign in failed");
		}
	},
});

// Mutation: create super admin
export const createSuperAdmin = mutation({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.string(),
	},
	handler: async (ctx, { email, password, name }) => {
		try {
			// Check if super admin already exists
			const existingSuperAdmin = await ctx.db
				.query("users")
				.withIndex("by_role", (q) => q.eq("role", "super_admin"))
				.first();

			if (existingSuperAdmin) {
				throw new Error("Super admin already exists. Contact existing super admin.");
			}

			// Validate password
			if (password.length < 8) {
				throw new Error("Password must be at least 8 characters long");
			}

			const normalizedEmail = email.toLowerCase().trim();

			// Hash password
			const passwordHash = await simpleHash(password);

			// Check for existing active user
			const existing = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
				.filter(q => q.eq(q.field("isDeleted"), undefined))
				.unique();

			if (existing) {
				throw new Error("Email already registered");
			}

			// Create new super admin
			const userId = await ctx.db.insert("users", {
				email: normalizedEmail,
				passwordHash,
				name,
				createdAt: nowIso(),
				updatedAt: nowIso(),
				role: "super_admin",
				isActive: true,
				onboardingStep: 4,
				onboardingCompleted: true,
				interests: [],
			});

			// Generate session
			const sessionToken = generateSessionToken();
			const expiresAt = calculateSessionExpiry();

			// Create session
			await ctx.db.insert("sessions", {
				userId,
				sessionToken,
				expiresAt,
				createdAt: nowIso(),
			});

			return {
				success: true,
				sessionToken,
				userId,
				role: "super_admin",
			};
		} catch (error) {
			throw new Error(error.message || "Failed to create super admin");
		}
	},
});

// Mutation: sign out
export const signOut = mutation({
	args: { sessionToken: v.string() },
	handler: async (ctx, { sessionToken }) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_token", (q) => q.eq("sessionToken", sessionToken))
			.unique();
		
		if (session) {
			await ctx.db.delete(session._id);
		}
		
		return { success: true };
	},
});
