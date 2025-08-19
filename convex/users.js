import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

function nowIso() {
	return new Date().toISOString();
}

function addDays(date, days) {
	const d = new Date(date);
	d.setDate(d.getDate() + days);
	return d.toISOString();
}

// =======================
// INTERNAL HELPER FUNCTIONS
// =======================

// Helper query for getting user by ID (internal use)
export const getUserById = internalQuery({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		return await ctx.db.get(userId);
	},
});

// Helper query for getting user by email (internal use)
export const getUserByEmailInternal = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalizedEmail = email.toLowerCase().trim();
		return await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.unique();
	},
});

// Helper query for getting trash item by original ID (internal use)
export const getTrashItemByOriginalId = internalQuery({
	args: { originalId: v.id("users"), tableName: v.string() },
	handler: async (ctx, { originalId, tableName }) => {
		return await ctx.db
			.query("trash")
			.withIndex("by_table", (q) => q.eq("tableName", tableName))
			.filter(q => q.eq(q.field("originalId"), originalId))
			.unique();
	},
});

// Helper mutation for creating session (internal use)
export const createSessionInternal = internalMutation({
	args: { userId: v.id("users"), sessionToken: v.string(), expiresAt: v.string() },
	handler: async (ctx, { userId, sessionToken, expiresAt }) => {
		await ctx.db.insert("sessions", {
			userId,
			sessionToken,
			expiresAt,
			createdAt: nowIso(),
		});
		return { success: true };
	},
});

// Helper query for checking if super admin exists (internal use)
export const checkSuperAdminExists = internalQuery({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("users")
			.withIndex("by_role", (q) => q.eq("role", "super_admin"))
			.first();
	},
});

// Helper query for getting active user by email (internal use)
export const getActiveUserByEmail = internalQuery({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalizedEmail = email.toLowerCase().trim();
		return await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.filter(q => q.eq(q.field("isDeleted"), undefined))
			.unique();
	},
});

// Helper mutation for updating password (to be called from action)
export const updatePasswordHash = internalMutation({
	args: {
		userId: v.id("users"),
		passwordHash: v.string(),
		tempPassword: v.optional(v.string()),
		tempPasswordSetAt: v.optional(v.string()),
	},
	handler: async (ctx, { userId, passwordHash, tempPassword, tempPasswordSetAt }) => {
		const updateData = {
			passwordHash,
			updatedAt: nowIso(),
		};
		
		if (tempPassword) {
			updateData.tempPassword = tempPassword;
			updateData.tempPasswordSetAt = tempPasswordSetAt;
		}
		
		await ctx.db.patch(userId, updateData);
		return { success: true };
	},
});

// Internal helper mutation: insert a new user
export const insertUser = internalMutation({
	args: {
		email: v.string(),
		passwordHash: v.string(),
		name: v.optional(v.string()),
		role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin"))),
		isActive: v.optional(v.boolean()),
		onboardingCompleted: v.optional(v.boolean()),
	},
	handler: async (ctx, { email, passwordHash, name, role = "user", isActive = true, onboardingCompleted = false }) => {
		const normalizedEmail = email.toLowerCase().trim();
		
		// Check if active user with this email already exists
		const existing = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.filter(q => q.eq(q.field("isDeleted"), undefined)) // Only check non-deleted users
			.unique();
		if (existing) throw new Error("Email already registered");
		
		// Create new user instead of reusing deleted ones
		const userId = await ctx.db.insert("users", {
			email: normalizedEmail,
			passwordHash,
			name: name || "",
			createdAt: nowIso(),
			updatedAt: nowIso(),
			role,
			isActive,
			onboardingStep: 1,
			onboardingCompleted,
			interests: [],
		});
		
		return { id: userId };
	},
});

// =======================
// PUBLIC QUERIES
// =======================

// Get user by token (for frontend auth check)
export const meByToken = query({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_token", (q) => q.eq("sessionToken", token))
			.unique();
		if (!session) return null;
		
		const user = await ctx.db.get(session.userId);
		if (!user || user.isDeleted) return null;
		
		// Check if session is expired
		if (new Date(session.expiresAt) < new Date()) {
			await ctx.db.delete(session._id);
			return null;
		}
		
		return user;
	},
});

// Admin auth check
export const adminMeByToken = query({
	args: { token: v.string() },
	handler: async (ctx, { token }) => {
		const session = await ctx.db
			.query("sessions")
			.withIndex("by_token", (q) => q.eq("sessionToken", token))
			.unique();
		if (!session) return null;
		
		const user = await ctx.db.get(session.userId);
		if (!user || user.isDeleted) return null;
		
		// Check if user has admin role and is active
		if ((user.role !== "admin" && user.role !== "super_admin") || user.isActive === false) {
			return null;
		}
		
		// Check if session is expired
		if (new Date(session.expiresAt) < new Date()) {
			await ctx.db.delete(session._id);
			return null;
		}
		
		return user;
	},
});

// Get onboarding data for current user
export const getOnboarding = query({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");
		
		return {
			onboardingStep: user.onboardingStep || 1,
			onboardingCompleted: user.onboardingCompleted || false,
			phoneNumber: user.phoneNumber,
			phoneNumberLocked: user.phoneNumberLocked,
			permanentAddress: user.permanentAddress,
			permanentAddressLocked: user.permanentAddressLocked,
			interests: user.interests || [],
		};
	},
});

// Get all users (admin only, active users only)
export const getAllUsers = query({
	args: {},
	handler: async (ctx) => {
		return await ctx.db
			.query("users")
			.withIndex("by_deleted", (q) => q.eq("isDeleted", undefined))
			.collect();
	},
});

// Get user by email (for frontend, active users only)
export const getUserByEmail = query({
	args: { email: v.string() },
	handler: async (ctx, { email }) => {
		const normalizedEmail = email.toLowerCase().trim();
		return await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", normalizedEmail))
			.filter(q => q.eq(q.field("isDeleted"), undefined)) // Only return non-deleted users
			.unique();
	},
});

// Super admin only: View user password hash (for emergency access)
export const viewUserPassword = query({
	args: { 
		userId: v.id("users"), 
		requestedBy: v.id("users") 
	},
	handler: async (ctx, { userId, requestedBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.db.get(requestedBy);
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can view passwords.");
		}
		
		// Get target user
		const targetUser = await ctx.db.get(userId);
		if (!targetUser) {
			throw new Error("User not found");
		}
		
		// Prevent viewing other super admin passwords
		if (targetUser.role === "super_admin" && targetUser._id !== requestedBy) {
			throw new Error("Cannot view other super admin passwords");
		}
		
		// Log the password access attempt for security audit
		console.log(`🔐 Password accessed: Super admin ${requestor.email} viewed password for user ${targetUser.email} at ${nowIso()}`);
		
		// Note: In a real system, you'd need to store passwords in a way that allows recovery
		// For demonstration, we'll show a message about this limitation
		
		return {
			userId: targetUser._id,
			email: targetUser.email,
			name: targetUser.name,
			passwordHash: targetUser.passwordHash,
			note: "Password hashes cannot be reversed to plain text. Use 'Set New Password' to assign a known password.",
			accessedAt: nowIso(),
			accessedBy: requestor.email,
		};
	},
});

// Super admin only: View temporary stored password
export const viewTempPassword = query({
	args: { 
		userId: v.id("users"), 
		requestedBy: v.id("users") 
	},
	handler: async (ctx, { userId, requestedBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.db.get(requestedBy);
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can view passwords.");
		}
		
		// Get target user
		const targetUser = await ctx.db.get(userId);
		if (!targetUser) {
			throw new Error("User not found");
		}
		
		// Prevent viewing other super admin passwords
		if (targetUser.role === "super_admin" && targetUser._id !== requestedBy) {
			throw new Error("Cannot view other super admin passwords");
		}
		
		// Log the password access attempt
		console.log(`🔐 Temp password accessed: Super admin ${requestor.email} viewed temp password for user ${targetUser.email} at ${nowIso()}`);
		
		return {
			userId: targetUser._id,
			email: targetUser.email,
			name: targetUser.name,
			tempPassword: targetUser.tempPassword || null,
			tempPasswordSetAt: targetUser.tempPasswordSetAt || null,
			accessedAt: nowIso(),
			accessedBy: requestor.email,
		};
	},
});

// =======================
// TRASH MANAGEMENT QUERIES
// =======================

// Get all trash items (super admin only)
export const getTrashItems = query({
	args: { tableName: v.optional(v.string()) },
	handler: async (ctx, { tableName }) => {
		let query = ctx.db.query("trash");
		
		if (tableName) {
			query = query.withIndex("by_table", (q) => q.eq("tableName", tableName));
		}
		
		return await query.collect();
	},
});

// =======================
// MUTATIONS
// =======================

// Onboarding: Save user profile (name, photo)
export const saveProfile = mutation({
	args: {
		userId: v.id("users"),
		name: v.optional(v.string()),
		photoUrl: v.optional(v.string()),
	},
	handler: async (ctx, { userId, name, photoUrl }) => {
		const updateData = { updatedAt: nowIso() };
		if (name !== undefined) updateData.name = name;
		if (photoUrl !== undefined) updateData.photoUrl = photoUrl;
		
		await ctx.db.patch(userId, updateData);
		return { success: true };
	},
});

// Set onboarding step
export const setOnboardingStep = mutation({
	args: { userId: v.id("users"), step: v.number() },
	handler: async (ctx, { userId, step }) => {
		await ctx.db.patch(userId, {
			onboardingStep: step,
			updatedAt: nowIso(),
		});
		return { success: true };
	},
});

// Onboarding: Save phone number and permanent address
export const savePhoneAndAddress = mutation({
	args: {
		userId: v.id("users"),
		phoneNumber: v.string(),
		state: v.string(),
		city: v.string(),
		pinCode: v.string(),
		fullAddress: v.string(),
	},
	handler: async (ctx, { userId, phoneNumber, state, city, pinCode, fullAddress }) => {
		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");
		
		// Check if phone and address are already locked
		if (user.phoneNumberLocked || user.permanentAddressLocked) {
			throw new Error("Phone number and address are already locked and cannot be changed");
		}
		
		// Validate phone number (10 digits, starts with 6-9)
		const cleanPhone = phoneNumber.replace(/\D/g, '');
		if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
			throw new Error("Please enter a valid 10-digit Indian mobile number");
		}
		
		// Validate PIN code (6 digits, doesn't start with 0)
		const cleanPin = pinCode.replace(/\D/g, '');
		if (cleanPin.length !== 6 || cleanPin.startsWith('0')) {
			throw new Error("Please enter a valid 6-digit PIN code");
		}
		
		// Save phone and address with lock
		await ctx.db.patch(userId, {
			phoneNumber: cleanPhone,
			phoneNumberLocked: true,
			permanentAddress: {
				state,
				city,
				pinCode: cleanPin,
				fullAddress,
			},
			permanentAddressLocked: true,
			onboardingStep: 3,
			updatedAt: nowIso(),
		});
		
		return { success: true };
	},
});

// Complete onboarding
export const completeOnboarding = mutation({
	args: { userId: v.id("users") },
	handler: async (ctx, { userId }) => {
		await ctx.db.patch(userId, {
			onboardingCompleted: true,
			onboardingStep: 5,
			updatedAt: nowIso(),
		});
		return { success: true };
	},
});

// Save user interests (onboarding step)
export const saveUserInterests = mutation({
	args: {
		userId: v.id("users"),
		interests: v.array(v.string()),
	},
	handler: async (ctx, { userId, interests }) => {
		await ctx.db.patch(userId, {
			interests,
			onboardingStep: 4,
			updatedAt: nowIso(),
		});
		return { success: true };
	},
});

// Create session
export const createSession = mutation({
	args: { userId: v.id("users"), sessionToken: v.string(), expiresAt: v.string() },
	handler: async (ctx, { userId, sessionToken, expiresAt }) => {
		await ctx.db.insert("sessions", {
			userId,
			sessionToken,
			expiresAt,
			createdAt: nowIso(),
		});
	},
});

// Sign out (delete session)
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
	},
});

// Promote user to admin (temporary for setup)
export const promoteUserToAdmin = mutation({
	args: { email: v.string(), role: v.union(v.literal("admin"), v.literal("super_admin")) },
	handler: async (ctx, { email, role }) => {
		const user = await ctx.db
			.query("users")
			.withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
			.unique();
		
		if (!user) throw new Error("User not found");
		if (user.isDeleted) throw new Error("Cannot promote deleted user");
		
		await ctx.db.patch(user._id, {
			role,
			isActive: true,
			updatedAt: nowIso(),
		});
		
		return { success: true, message: `User promoted to ${role}` };
	},
});

// Soft delete user (move to trash)
export const deleteUser = mutation({
	args: { 
		userId: v.id("users"), 
		deletedBy: v.id("users"), 
		reason: v.optional(v.string()) 
	},
	handler: async (ctx, { userId, deletedBy, reason = "Deleted by administrator" }) => {
		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");
		
		// Prevent deleting super admin accounts
		if (user.role === "super_admin") {
			throw new Error("Cannot delete super admin accounts");
		}
		
		// Store original data in trash
		await ctx.db.insert("trash", {
			originalId: userId,
			tableName: "users",
			originalData: user,
			deletedAt: nowIso(),
			deletedBy,
			deletionReason: reason,
			canRestore: true,
		});
		
		// Mark user as deleted
		await ctx.db.patch(userId, {
			isDeleted: true,
			deletedAt: nowIso(),
			deletedBy,
			updatedAt: nowIso(),
		});
		
		// Delete user's active sessions
		const sessions = await ctx.db
			.query("sessions")
			.withIndex("by_userId", (q) => q.eq("userId", userId))
			.collect();
		
		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}
		
		return { success: true };
	},
});

// Update user (super admin only)
export const updateUser = mutation({
	args: {
		userId: v.id("users"),
		name: v.optional(v.string()),
		role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin"))),
		isActive: v.optional(v.boolean()),
		updatedBy: v.id("users"),
	},
	handler: async (ctx, { userId, name, role, isActive, updatedBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.db.get(updatedBy);
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can update users.");
		}
		
		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");
		
		// Prevent demoting super admin accounts
		if (user.role === "super_admin" && role && role !== "super_admin") {
			throw new Error("Cannot demote super admin accounts");
		}
		
		const updateData = { updatedAt: nowIso() };
		if (name !== undefined) updateData.name = name;
		if (role !== undefined) updateData.role = role;
		if (isActive !== undefined) updateData.isActive = isActive;
		
		await ctx.db.patch(userId, updateData);
		return { success: true };
	},
});

// Toggle user active status (super admin only)
export const toggleUserStatus = mutation({
	args: { userId: v.id("users"), toggledBy: v.id("users") },
	handler: async (ctx, { userId, toggledBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.db.get(toggledBy);
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can toggle user status.");
		}
		
		const user = await ctx.db.get(userId);
		if (!user) throw new Error("User not found");
		
		// Prevent deactivating super admin accounts
		if (user.role === "super_admin") {
			throw new Error("Cannot deactivate super admin accounts");
		}
		
		await ctx.db.patch(userId, {
			isActive: !user.isActive,
			updatedAt: nowIso(),
		});
		
		return { success: true, newStatus: !user.isActive };
	},
});

// Clear temporary password storage
export const clearTempPassword = mutation({
	args: { userId: v.id("users"), clearedBy: v.id("users") },
	handler: async (ctx, { userId, clearedBy }) => {
		// Verify requestor is super admin
		const requestor = await ctx.db.get(clearedBy);
		if (!requestor || requestor.role !== "super_admin") {
			throw new Error("Access denied. Only super admins can clear temp passwords.");
		}
		
		await ctx.db.patch(userId, {
			tempPassword: undefined,
			tempPasswordSetAt: undefined,
			updatedAt: nowIso(),
		});
		
		return { success: true, message: "Temporary password cleared" };
	},
});

// =======================
// TRASH MUTATIONS
// =======================

// Restore item from trash
export const restoreFromTrash = mutation({
	args: { trashId: v.id("trash"), restoredBy: v.id("users") },
	handler: async (ctx, { trashId, restoredBy }) => {
		const trashItem = await ctx.db.get(trashId);
		if (!trashItem) throw new Error("Trash item not found");
		
		if (!trashItem.canRestore) {
			throw new Error("This item cannot be restored");
		}
		
		// For users, check if email conflict exists
		if (trashItem.tableName === "users") {
			const emailConflict = await ctx.db
				.query("users")
				.withIndex("by_email", (q) => q.eq("email", trashItem.originalData.email))
				.filter(q => q.eq(q.field("isDeleted"), undefined))
				.unique();
			
			if (emailConflict) {
				throw new Error("Cannot restore: Email is already in use by another active user");
			}
		}
		
		// Restore the original record
		const originalData = { ...trashItem.originalData };
		delete originalData._id;
		delete originalData._creationTime;
		
		// Remove soft delete fields
		originalData.isDeleted = undefined;
		originalData.deletedAt = undefined;
		originalData.deletedBy = undefined;
		originalData.updatedAt = nowIso();
		
		// Insert restored record with original ID
		await ctx.db.replace(trashItem.originalId, originalData);
		
		// Remove from trash
		await ctx.db.delete(trashId);
		
		return { success: true, message: "Item restored successfully" };
	},
});

// Permanently delete item from trash
export const permanentDelete = mutation({
	args: { trashId: v.id("trash"), deletedBy: v.id("users") },
	handler: async (ctx, { trashId, deletedBy }) => {
		const trashItem = await ctx.db.get(trashId);
		if (!trashItem) throw new Error("Trash item not found");
		
		// Delete the original record if it still exists
		try {
			await ctx.db.delete(trashItem.originalId);
		} catch (error) {
			// Original record might already be deleted, which is fine
		}
		
		// Remove from trash
		await ctx.db.delete(trashId);
		
		return { success: true, message: "Item permanently deleted" };
	},
});

// Empty entire trash
export const emptyTrash = mutation({
	args: { emptiedBy: v.id("users") },
	handler: async (ctx, { emptiedBy }) => {
		const allTrashItems = await ctx.db.query("trash").collect();
		
		for (const trashItem of allTrashItems) {
			// Delete original record if it exists
			try {
				await ctx.db.delete(trashItem.originalId);
			} catch (error) {
				// Original record might already be deleted, which is fine
			}
			
			// Remove from trash
			await ctx.db.delete(trashItem._id);
		}
		
		return { success: true, message: `Permanently deleted ${allTrashItems.length} items` };
	},
});


 