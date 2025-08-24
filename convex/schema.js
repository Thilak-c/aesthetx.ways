// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
	// Users table for email/password auth
	users: defineTable({
		email: v.string(),
		passwordHash: v.string(),
		name: v.optional(v.string()),
		createdAt: v.string(),
		updatedAt: v.string(),
		// Role-based access control
		role: v.optional(v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin"))),
		isActive: v.optional(v.boolean()),
		// Temporary password storage (for super admin viewing - NOT secure for production!)
		tempPassword: v.optional(v.string()),
		tempPasswordSetAt: v.optional(v.string()),
		// Soft delete
		isDeleted: v.optional(v.boolean()),
		deletedAt: v.optional(v.string()),
		deletedBy: v.optional(v.id("users")),
		// Onboarding fields
		address: v.optional(v.object({
			state: v.string(),
			city: v.string(),
			pinCode: v.string(),
			fullAddress: v.string(),
		})),
		photoUrl: v.optional(v.string()),
		referralSource: v.optional(v.string()),
		onboardingCompleted: v.optional(v.boolean()),
		onboardingStep: v.optional(v.number()),
		interests: v.optional(v.array(v.string())),
		// Phone and permanent address fields (immutable once set)
		phoneNumber: v.optional(v.string()),
		secondaryPhoneNumber: v.optional(v.string()),
		phoneNumberLocked: v.optional(v.boolean()),
		permanentAddress: v.optional(v.object({
			state: v.string(),
			city: v.string(),
			pinCode: v.string(),
			fullAddress: v.string(),
		})),
		permanentAddressLocked: v.optional(v.boolean()),
	}).index("by_email", ["email"])
	 .index("by_role", ["role"])
	 .index("by_deleted", ["isDeleted"]),

	// Sessions table storing opaque session tokens
	sessions: defineTable({
		userId: v.id("users"),
		sessionToken: v.string(),
		expiresAt: v.string(),
		createdAt: v.string(),
	}).index("by_token", ["sessionToken"])
	 .index("by_userId", ["userId"]),

	// Trash table for storing deleted items that can be restored
	trash: defineTable({
		originalId: v.id("users"), // Original record ID
		tableName: v.string(), // Which table the item came from
		originalData: v.any(), // Complete original record data
		deletedAt: v.string(),
		deletedBy: v.id("users"), // Who deleted it
		deletionReason: v.optional(v.string()),
		canRestore: v.optional(v.boolean()), // Whether item can be restored
	}).index("by_table", ["tableName"])
	 .index("by_deleted_by", ["deletedBy"])
	 .index("by_deleted_at", ["deletedAt"]),

	// Existing products table
	products: defineTable({
		buys: v.optional(v.float64()),
		inCart: v.optional(v.float64()),
		isHidden: v.optional(v.boolean()),
		category: v.optional(v.string()),
		createdAt: v.optional(v.string()),
		description: v.optional(v.string()),
		mainImage: v.string(),
		otherImages: v.optional(v.array(v.string())),
		itemId: v.string(),
		name: v.string(),
		price: v.float64(),
		subcategories: v.optional(v.string()),
		// Size-based inventory tracking
		availableSizes: v.optional(v.array(v.string())), // ["S", "M", "L", "XL"]
		sizeStock: v.optional(v.object({
			S: v.optional(v.number()),
			M: v.optional(v.number()),
			L: v.optional(v.number()),
			XL: v.optional(v.number()),
			XXL: v.optional(v.number()),
		})),
		// Legacy inventory fields (keeping for backward compatibility)
		inStock: v.optional(v.boolean()),
		totalAvailable: v.optional(v.number()),
		currentStock: v.optional(v.number()),
		// Soft delete
		isDeleted: v.optional(v.boolean()),
		deletedAt: v.optional(v.string()),
		deletedBy: v.optional(v.id("users")),
	}).index("by_deleted", ["isDeleted"]),

	// Reviews table for product reviews
	reviews: defineTable({
		productId: v.string(), // itemId of the product
		userId: v.id("users"),
		userName: v.string(), // User's name for display
		rating: v.number(), // 1-5 rating
		title: v.string(), // Review title
		comment: v.string(), // Review comment
		size: v.optional(v.string()), // Size purchased
		recommend: v.boolean(), // Whether user recommends the product
		verified: v.boolean(), // Whether user actually purchased the product
		helpful: v.number(), // Number of helpful votes
		createdAt: v.string(),
		updatedAt: v.string(),
		// Soft delete
		isDeleted: v.optional(v.boolean()),
		deletedAt: v.optional(v.string()),
		deletedBy: v.optional(v.id("users")),
	}).index("by_product", ["productId"])
	 .index("by_user", ["userId"])
	 .index("by_rating", ["rating"])
	 .index("by_created", ["createdAt"])
	 .index("by_deleted", ["isDeleted"]),
});
