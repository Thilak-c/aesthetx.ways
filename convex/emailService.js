// Email service configuration and utilities
import { action } from "./_generated/server";
import { v } from "convex/values";

// Send email using external service
export const sendEmail = action({
  args: {
    to: v.string(),
    subject: v.string(),
    html: v.string(),
    from: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Option 1: Using a webhook service like Zapier or Make.com
      // This is the simplest approach - create a webhook that sends emails
      
      // Option 2: Using a service like EmailJS (client-side)
      // Option 3: Using Resend API (recommended)
      // Option 4: Using SendGrid API
      
      // For now, we'll use a simple webhook approach
      // You can replace this with your preferred email service
      
      const emailData = {
        to: args.to,
        subject: args.subject,
        html: args.html,
        from: args.from || "noreply@aesthetxways.com",
        timestamp: new Date().toISOString(),
      };

      // Log the email for now (replace with actual email service)
      console.log("=== EMAIL NOTIFICATION ===");
      console.log("To:", emailData.to);
      console.log("Subject:", emailData.subject);
      console.log("From:", emailData.from);
      console.log("Timestamp:", emailData.timestamp);
      console.log("========================");

      // Example with Resend API (uncomment and configure when ready)
      /*
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: emailData.from,
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Email service error: ${error}`);
      }

      const result = await response.json();
      console.log("Email sent successfully:", result);
      */

      // Example with webhook (replace with your webhook URL)
      /*
      const webhookResponse = await fetch("YOUR_WEBHOOK_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!webhookResponse.ok) {
        throw new Error(`Webhook error: ${webhookResponse.statusText}`);
      }
      */

      return { success: true, message: "Email notification logged" };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error: error.message };
    }
  },
});

// Create email templates
export const createOrderNotificationTemplate = (orderData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order - ${orderData.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 20px; }
        .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #f5f5f5; font-weight: bold; }
        .total { font-size: 18px; font-weight: bold; color: #000; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .highlight { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛍️ New Order Received</h1>
          <p>AesthetX Ways - Order Management</p>
        </div>
        
        <div class="content">
          <div class="highlight">
            <strong>Order Number:</strong> ${orderData.orderNumber}<br>
            <strong>Order Date:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </div>
          
          <div class="order-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customerName}</p>
            <p><strong>Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>Shipping Address:</strong><br>${orderData.shippingAddress}</p>
          </div>

          <div class="order-details">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderData.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price.toLocaleString()}</td>
                    <td>₹${(item.quantity * item.price).toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">
              Total Order Value: ₹${orderData.orderTotal.toLocaleString()}
            </div>
          </div>

          <div class="order-details">
            <h3>Next Steps</h3>
            <ul>
              <li>Log in to your admin panel to view full order details</li>
              <li>Process the order and update inventory</li>
              <li>Prepare items for shipping</li>
              <li>Update order status and tracking information</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <p>This is an automated notification from AesthetX Ways</p>
          <p>Please do not reply to this email</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation to customer (optional)
export const sendCustomerOrderConfirmation = action({
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
    const customerEmailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - ${args.orderData.orderNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #000; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .highlight { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
            <p>Thank you for shopping with AesthetX Ways</p>
          </div>
          
          <div class="content">
            <div class="highlight">
              <h3>Hi ${args.orderData.customerName},</h3>
              <p>Your order <strong>${args.orderData.orderNumber}</strong> has been confirmed!</p>
              <p>We'll send you updates as your order is processed and shipped.</p>
            </div>
            
            <h3>Order Summary</h3>
            <ul>
              ${args.orderData.items.map(item => `
                <li>${item.name} - Qty: ${item.quantity} - ₹${(item.quantity * item.price).toLocaleString()}</li>
              `).join('')}
            </ul>
            
            <p><strong>Total: ₹${args.orderData.orderTotal.toLocaleString()}</strong></p>
            
            <p>Shipping to:<br>${args.orderData.shippingAddress}</p>
            
            <p>Thank you for choosing AesthetX Ways!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await ctx.runAction(api.emailService.sendEmail, {
      to: args.orderData.customerEmail,
      subject: `Order Confirmation - ${args.orderData.orderNumber}`,
      html: customerEmailTemplate,
    });
  },
});