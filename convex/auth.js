"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function nowIso() {
	return new Date().toISOString();
}

function addDays(date, days) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d.toISOString();
}

// Action: signup (can use timers / bcrypt async)
export const signup = action({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.optional(v.string()),
	},
	handler: async (ctx, { email, password, name }) => {
		if (password.length < 8) throw new Error("Password too short");
		const passwordHash = await bcrypt.hash(password, 12);
		const { id } = await ctx.runMutation(internal.users.insertUser, { email, passwordHash, name });
		// Auto-create session after signup
		const sessionToken = crypto.randomUUID();
		const expiresAt = addDays(nowIso(), 30);
		await ctx.runMutation(internal.users.createSessionInternal, { 
			userId: id, 
			sessionToken, 
			expiresAt 
		});
		return { sessionToken, userId: id };
	},
});

// Action: sign in (bcrypt compare and create session)
export const signIn = action({
	args: { email: v.string(), password: v.string() },
	handler: async (ctx, { email, password }) => {
		// Get user by email using helper query
		const user = await ctx.runQuery(internal.users.getUserByEmailInternal, { email });
		
		if (!user) throw new Error("Invalid credentials");
		
		// Check if user is deleted
		if (user.isDeleted) {
			// Get deletion details from trash
			const trashItem = await ctx.runQuery(internal.users.getTrashItemByOriginalId, {
				originalId: user._id,
				tableName: "users"
			});
			
			// Return special status for deleted accounts
			return {
				status: "account_deleted",
				deletionInfo: {
					deletedAt: user.deletedAt,
					deletedBy: user.deletedBy,
					reason: trashItem?.deletionReason || "Account deleted by administrator",
					email: user.email,
					name: user.name || "User",
				}
			};
		}
		
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new Error("Invalid credentials");
		
		// Auto-reactivate deactivated users when they log in
		if (user.isActive === false) {
			await ctx.runMutation(internal.users.reactivateUser, {
				userId: user._id
			});
		}
		
		const sessionToken = crypto.randomUUID();
		const expiresAt = addDays(nowIso(), 30);
		await ctx.runMutation(internal.users.createSessionInternal, { 
			userId: user._id, 
			sessionToken, 
			expiresAt 
		});
		return { 
			status: "success",
			sessionToken, 
			userId: user._id 
		};
	},
});

// Admin login (same as regular login but with role check)
export const adminSignIn = action({
	args: { email: v.string(), password: v.string() },
	handler: async (ctx, { email, password }) => {
		// Get user by email using helper query
		const user = await ctx.runQuery(internal.users.getUserByEmailInternal, { email });
		
		if (!user) throw new Error("Invalid credentials");
		
		// Check if user is deleted
		if (user.isDeleted) {
			const trashItem = await ctx.runQuery(internal.users.getTrashItemByOriginalId, {
				originalId: user._id,
				tableName: "users"
			});
			
			return {
				status: "account_deleted",
				deletionInfo: {
					deletedAt: user.deletedAt,
					deletedBy: user.deletedBy,
					reason: trashItem?.deletionReason || "Account deleted by administrator",
					email: user.email,
					name: user.name || "Admin",
				}
			};
		}
		
		// Check if user has admin role
		if (user.role !== "admin" && user.role !== "super_admin") {
			throw new Error("Access denied. Admin privileges required.");
		}
		
		// Check if admin account is active
		if (user.isActive === false) {
			throw new Error("Admin account is inactive. Contact super admin.");
		}
		
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) throw new Error("Invalid credentials");
		
		const sessionToken = crypto.randomUUID();
		const expiresAt = addDays(nowIso(), 30);
		await ctx.runMutation(internal.users.createSessionInternal, { 
			userId: user._id, 
			sessionToken, 
			expiresAt 
		});
		
		return { 
			status: "success",
			sessionToken, 
			userId: user._id,
			role: user.role,
			name: user.name || "",
			email: user.email
		};
	},
});

// Super admin only: Set user password and store it temporarily for viewing
export const setUserPasswordWithView = action({
	args: { 
		userId: v.id("users"), 
		newPassword: v.string(), 
		setBy: v.id("users"),
		storeForViewing: v.optional(v.boolean())
	},
	handler: async (ctx, { userId, newPassword, setBy, storeForViewing = false }) => {
		// Verify requestor is super admin using query
		const requestor = await ctx.runQuery(internal.users.getUserById, { userId: setBy });
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can set passwords.");
		}
		
		// Get target user using query
		const targetUser = await ctx.runQuery(internal.users.getUserById, { userId });
		if (!targetUser) {
			throw new Error("User not found");
		}
		
		// Prevent changing other super admin passwords
		if (targetUser.role === "super_admin" && targetUser._id !== setBy) {
			throw new Error("Cannot change other super admin passwords");
		}
		
		if (newPassword.length < 8) {
			throw new Error("Password must be at least 8 characters");
		}
		
		const passwordHash = await bcrypt.hash(newPassword, 12);
		
		// Update password using mutation
		await ctx.runMutation(internal.users.updatePasswordHash, {
			userId,
			passwordHash,
			tempPassword: storeForViewing ? newPassword : undefined,
			tempPasswordSetAt: storeForViewing ? nowIso() : undefined,
		});
		
		// Log the password change for security audit
		console.log(`🔐 Password changed: Super admin ${requestor.email} changed password for user ${targetUser.email} at ${nowIso()}`);
		
		return { 
			success: true, 
			message: `Password updated for ${targetUser.email}`,
			plainTextPassword: storeForViewing ? newPassword : undefined
		};
	},
});

// Create super admin action (bcrypt needs Node.js)
export const createSuperAdmin = action({
	args: {
		email: v.string(),
		password: v.string(),
		name: v.string(),
	},
	handler: async (ctx, { email, password, name }) => {
		// Check if any super admin already exists
		const existingSuperAdmin = await ctx.runQuery(internal.users.checkSuperAdminExists);
		
		if (existingSuperAdmin) {
			throw new Error("Super admin already exists. Contact existing super admin.");
		}
		
		if (password.length < 8) throw new Error("Password too short");
		const passwordHash = await bcrypt.hash(password, 12);
		
		const existing = await ctx.runQuery(internal.users.getActiveUserByEmail, { email });
		if (existing) throw new Error("Email already registered");
		
		// Check if there's a soft-deleted user with this email and create new instead
		const deletedUser = await ctx.runQuery(internal.users.getUserByEmailInternal, { email });
		
		if (deletedUser && deletedUser.isDeleted) {
			// Create a new super admin record instead of reusing the deleted one
			const { id } = await ctx.runMutation(internal.users.insertUser, {
				email,
				passwordHash,
				name,
				role: "super_admin",
				isActive: true,
				onboardingCompleted: true,
			});
			
			// Auto-create session
			const sessionToken = crypto.randomUUID();
			const expiresAt = addDays(nowIso(), 30);
			await ctx.runMutation(internal.users.createSessionInternal, { 
				userId: id, 
				sessionToken, 
				expiresAt 
			});
			
			return { sessionToken, userId: id, role: "super_admin" };
		}
		
		// Create new super admin
		const { id } = await ctx.runMutation(internal.users.insertUser, {
			email,
			passwordHash,
			name,
			role: "super_admin",
			isActive: true,
			onboardingCompleted: true,
		});
		
		// Auto-create session
		const sessionToken = crypto.randomUUID();
		const expiresAt = addDays(nowIso(), 30);
		await ctx.runMutation(internal.users.createSessionInternal, { 
			userId: id, 
			sessionToken, 
			expiresAt 
		});
		
		return { sessionToken, userId: id, role: "super_admin" };
	},
});

// Reset admin password action (bcrypt needs Node.js)
export const resetAdminPassword = action({
	args: { 
		email: v.string(), 
		newPassword: v.string(), 
		resetBy: v.id("users") 
	},
	handler: async (ctx, { email, newPassword, resetBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.runQuery(internal.users.getUserById, { userId: resetBy });
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can reset passwords.");
		}
		
		// Get target admin user
		const targetUser = await ctx.runQuery(internal.users.getUserByEmailInternal, { email });
		if (!targetUser) {
			throw new Error("User not found");
		}
		
		// Verify target has admin role
		if (targetUser.role !== "admin" && targetUser.role !== "super_admin") {
			throw new Error("Can only reset admin/super admin passwords");
		}
		
		// Prevent resetting other super admin passwords
		if (targetUser.role === "super_admin" && targetUser._id !== resetBy) {
			throw new Error("Cannot reset other super admin passwords");
		}
		
		if (newPassword.length < 8) {
			throw new Error("Password must be at least 8 characters");
		}
		
		const passwordHash = await bcrypt.hash(newPassword, 12);
		await ctx.runMutation(internal.users.updatePasswordHash, {
			userId: targetUser._id,
			passwordHash,
		});
		
		// Log the password reset for security audit
		console.log(`🔐 Password reset: Super admin ${requestor.email} reset password for ${targetUser.email} at ${nowIso()}`);
		
		return { 
			success: true, 
			message: `Password reset for ${targetUser.email}` 
		};
	},
}); 