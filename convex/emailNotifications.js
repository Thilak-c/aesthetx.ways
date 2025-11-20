import { v } from "convex/values";
import { mutation, action, query } from "./_generated/server";
import { api } from "./_generated/api";
import { createOrderNotificationTemplate } from "./emailService";

// Send order notification email
export const sendOrderNotificationEmail = action({
  args: {
    orderData: v.object({
      orderNumber: v.string(),
      customerName: v.string(),
      customerEmail: v.string(),
      orderTotal: v.number(),
      items: v.array(v.object({
        name: v.string(),
        quantity: v.number(),
        price: v.number(),
      })),
      shippingAddress: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const { orderData } = args;

    try {
      // Email configuration
      const adminEmail = "yashodanandkumar15@gmail.com";
      const subject = `🛍️ New Order - ${orderData.orderNumber} - ₹${orderData.orderTotal.toLocaleString()}`;

      // Create email content using template
      const emailContent = createOrderNotificationTemplate(orderData);

      // Send email using email service
      const result = await ctx.runAction(api.emailService.sendEmail, {
        to: adminEmail,
        subject: subject,
        html: emailContent,
        from: "orders@aesthetxways.com",
      });

      // Log the notification
      await ctx.runMutation(api.emailNotifications.logOrderNotification, {
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        adminEmail: adminEmail,
        status: result.success ? "sent" : "failed",
        error: result.success ? undefined : result.error,
      });

      return result;
    } catch (error) {
      // Log the failed notification
      await ctx.runMutation(api.emailNotifications.logOrderNotification, {
        orderNumber: orderData.orderNumber,
        customerEmail: orderData.customerEmail,
        adminEmail: "yashodanandkumar15@gmail.com",
        status: "failed",
        error: error.message,
      });

      return { success: false, error: error.message };
    }
  },
});



// Log order notification (for tracking)
export const logOrderNotification = mutation({
  args: {
    orderNumber: v.string(),
    customerEmail: v.string(),
    adminEmail: v.string(),
    status: v.string(), // 'sent', 'failed'
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const notificationId = await ctx.db.insert("emailNotifications", {
      type: "order_notification",
      orderNumber: args.orderNumber,
      recipientEmail: args.adminEmail,
      subject: `New Order - ${args.orderNumber}`,
      status: args.status,
      error: args.error,
      sentAt: new Date().toISOString(),
      metadata: {
        customerEmail: args.customerEmail,
        notificationType: "admin_order_alert",
      },
    });

    return { success: true, notificationId };
  },
});// G·et email notification history
export const getEmailNotifications = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("emailNotifications");

    if (args.type) {
      query = query.withIndex("by_type", (q) => q.eq("type", args.type));
    } else if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else {
      query = query.withIndex("by_sent_at");
    }

    const notifications = await query
      .order("desc")
      .take(args.limit || 50);

    return notifications;
  },
});

// Get email notification stats
export const getEmailNotificationStats = query({
  args: {},
  handler: async (ctx) => {
    const notifications = await ctx.db.query("emailNotifications").collect();

    const stats = {
      total: notifications.length,
      sent: notifications.filter(n => n.status === "sent").length,
      failed: notifications.filter(n => n.status === "failed").length,
      pending: notifications.filter(n => n.status === "pending").length,
      byType: {},
      todayCount: 0,
    };

    // Count by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    // Count today's notifications
    const today = new Date().toDateString();
    stats.todayCount = notifications.filter(n =>
      new Date(n.sentAt).toDateString() === today
    ).length;

    return stats;
  },
});