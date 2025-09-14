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
    role: v.optional(
      v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin"))
    ),
    isActive: v.optional(v.boolean()),
    // Temporary password storage (for super admin viewing - NOT secure for production!)
    tempPassword: v.optional(v.string()),
    tempPasswordSetAt: v.optional(v.string()),
    // Soft delete
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.string()),
    deletedBy: v.optional(v.id("users")),
    // Onboarding fields
    address: v.optional(
      v.object({
        state: v.string(),
        city: v.string(),
        pinCode: v.string(),
        fullAddress: v.string(),
      })
    ),
    photoUrl: v.optional(v.string()),
    referralSource: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
    onboardingStep: v.optional(v.number()),
    interests: v.optional(v.array(v.string())),
    selectedSizes: v.optional(v.array(v.string())), // Array of user's preferred sizes
    // Phone fields
    phoneNumber: v.optional(v.string()),
    secondaryPhoneNumber: v.optional(v.string()), // Secondary phone number
    phoneNumberLocked: v.optional(v.boolean()),
    // Permanent address fields (immutable once set) - for backward compatibility
    permanentAddress: v.optional(
      v.object({
        state: v.string(),
        city: v.string(),
        pinCode: v.string(),
        fullAddress: v.string(),
      })
    ),
    permanentAddressLocked: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_deleted", ["isDeleted"])
    .searchIndex("search_users", {
      searchField: "email",
      filterFields: ["isDeleted"],
    }),

  // Sessions table storing opaque session tokens
  sessions: defineTable({
    userId: v.id("users"),
    sessionToken: v.string(),
    expiresAt: v.string(),
    createdAt: v.string(),
  })
    .index("by_token", ["sessionToken"])
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
    updatedAt: v.optional(v.string()), // Changed from v.number() to v.string()
    updatedBy: v.optional(v.string()),
  })
    .index("by_table", ["tableName"])
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
    type: v.optional(v.array(v.string())), // Array of product types
    // Size-based inventory tracking
    availableSizes: v.optional(v.array(v.string())), // ["S", "M", "L", "XL"]
    sizeStock: v.optional(
      v.object({
        S: v.optional(v.number()),
        M: v.optional(v.number()),
        L: v.optional(v.number()),
        XL: v.optional(v.number()),
        XXL: v.optional(v.number()),
      })
    ),
    // Legacy inventory fields (keeping for backward compatibility)
    inStock: v.optional(v.boolean()),
    totalAvailable: v.optional(v.number()),
    currentStock: v.optional(v.number()),
    // Soft delete
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.string()),
    deletedBy: v.optional(v.id("users")),
    // Add these missing fields
    updatedAt: v.optional(v.string()),
    updatedBy: v.optional(v.string()),
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
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_rating", ["rating"])
    .index("by_created", ["createdAt"])
    .index("by_deleted", ["isDeleted"]),

  // Cart table for storing user cart items
  cart: defineTable({
    userId: v.id("users"),
    productId: v.string(),
    productName: v.string(),
    productImage: v.string(),
    price: v.float64(),
    size: v.string(),
    quantity: v.number(),
    addedAt: v.string(),
    updatedAt: v.string(),
    isActive: v.boolean(), // For soft delete/archiving
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product_size", ["userId", "productId", "size"])
    .index("by_active", ["isActive"]),

  // Wishlist table for storing user wishlist items
  wishlist: defineTable({
    userId: v.id("users"),
    productId: v.string(),
    productName: v.string(),
    productImage: v.string(),
    price: v.float64(),
    category: v.optional(v.string()),
    addedAt: v.string(),
    isActive: v.boolean(), // For soft delete/archiving
  })
    .index("by_user", ["userId"])
    .index("by_product", ["productId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_active", ["isActive"]),
  orders: defineTable({
    userId: v.id("users"),
    orderNumber: v.string(),
    items: v.array(
      v.object({
        productId: v.string(),
        name: v.string(),
        price: v.float64(),
        image: v.string(),
        quantity: v.float64(),
        size: v.string(),
      })
    ),
    shippingDetails: v.object({
      fullName: v.string(),
      email: v.string(),
      phone: v.string(),
      address: v.string(),
      city: v.string(),
      state: v.string(),
      pincode: v.string(),
      country: v.string(),
    }),
    paymentDetails: v.object({
      razorpayOrderId: v.string(),
      razorpayPaymentId: v.string(),
      amount: v.float64(),
      currency: v.string(),
      status: v.string(), // 'pending', 'completed', 'failed'
      paidAt: v.optional(v.number()), // Payment timestamp
      paidBy: v.optional(v.string()), // Payment method or payer name
      paymentMethod: v.optional(v.string()), // 'upi', 'card', 'netbanking', 'wallet'
    }),
    orderTotal: v.float64(),
    status: v.string(), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    // Delivery tracking
    estimatedDeliveryDate: v.optional(v.number()), // Estimated delivery timestamp
    deliveryDetails: v.optional(
      v.array(
        v.object({
          status: v.string(), // 'order_placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'
          message: v.string(), // Status message
          location: v.optional(v.string()), // Current location
          timestamp: v.number(), // When this status was updated
          updatedBy: v.optional(v.string()), // Who updated this status
        })
      )
    ),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
    shippedAt: v.optional(v.number()),
    deliveredAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_order_number", ["orderNumber"])
    .index("by_status", ["status"])
    .index("by_estimated_delivery", ["estimatedDeliveryDate"]),

  // Add this table definition to your schema
  recentlyViewed: defineTable({
    userId: v.id("users"),
    productId: v.string(),
    productName: v.string(),
    productImage: v.string(),
    productPrice: v.number(),
    productCategory: v.string(),
    viewedAt: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_user_viewed", ["userId", "viewedAt"])
    .index("by_product", ["productId"]),

  // Views table for tracking product views
  views: defineTable({
    productId: v.string(), // itemId of the product
    userId: v.optional(v.id("users")), // Optional - for anonymous views
    ipAddress: v.optional(v.string()), // For anonymous tracking
    userAgent: v.optional(v.string()), // Browser/device info
    referrer: v.optional(v.string()), // Where the user came from
    viewedAt: v.string(), // When the view occurred
    sessionId: v.optional(v.string()), // For grouping views in same session
    // View context
    viewType: v.optional(v.string()), // 'product_page', 'search_result', 'category_page', etc.
    searchQuery: v.optional(v.string()), // If viewed from search
    category: v.optional(v.string()), // Product category
    // Soft delete
    isDeleted: v.optional(v.boolean()),
    deletedAt: v.optional(v.string()),
    deletedBy: v.optional(v.id("users")),
  })
    .index("by_product", ["productId"])
    .index("by_user", ["userId"])
    .index("by_viewed_at", ["viewedAt"])
    .index("by_product_viewed", ["productId", "viewedAt"])
    .index("by_view_type", ["viewType"])
    .index("by_category", ["category"])
    .index("by_deleted", ["isDeleted"]),
    dailyAccess: defineTable({
    userIdV: v.string(),
    date: v.string(),
  }),
   reports: defineTable({
    userId: v.string(),      // optional, can use visitorId
    message: v.string(),     // report text
    fileUrl: v.string(),     // optional uploaded file URL
    createdAt: v.number(),   // timestamp
  }),
});
