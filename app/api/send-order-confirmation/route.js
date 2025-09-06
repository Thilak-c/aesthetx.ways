import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request) {
  try {
    const { 
      userEmail, 
      userName, 
      orderNumber, 
      orderItems, 
      orderTotal, 
      shippingDetails,
      paymentDetails 
    } = await request.json();

    if (!userEmail || !userName || !orderNumber || !orderItems || !orderTotal) {
      return NextResponse.json(
        { success: false, message: 'Missing required order details' },
        { status: 400 }
      );
    }

    // Format order items for email
    const itemsHtml = orderItems.map(item => `
      <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #e2e8f0;">
        <div style="width: 60px; height: 60px; background: #f8fafc; border-radius: 8px; margin-right: 15px; overflow: hidden;">
          <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;" />
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #1e293b; font-weight: 600;">${item.name}</h4>
          <p style="margin: 0; color: #64748b; font-size: 14px;">Size: ${item.size} | Qty: ${item.quantity}</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">₹${item.price.toLocaleString()}</p>
        </div>
      </div>
    `).join('');

    // Calculate delivery date (3-5 business days)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - ${orderNumber} | AESTHETX WAYS`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">AESTHETX WAYS</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 40px; border: 1px solid #e2e8f0; border-top: none;">
            <!-- Success Message -->
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 60px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <span style="color: white; font-size: 24px;">✓</span>
              </div>
              <h2 style="color: #1e293b; margin: 0 0 10px 0; font-size: 24px;">Order Confirmed!</h2>
              <p style="color: #64748b; margin: 0; font-size: 16px;">
                Thank you for your purchase, ${userName}! Your order has been successfully placed.
              </p>
            </div>

            <!-- Order Details -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Order Details</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b; font-weight: 500;">Order Number:</span>
                <span style="color: #1e293b; font-weight: 600;">${orderNumber}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b; font-weight: 500;">Order Date:</span>
                <span style="color: #1e293b; font-weight: 600;">${new Date().toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b; font-weight: 500;">Expected Delivery:</span>
                <span style="color: #1e293b; font-weight: 600;">${formattedDeliveryDate}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #64748b; font-weight: 500;">Payment Status:</span>
                <span style="color: #10b981; font-weight: 600;">Paid</span>
              </div>
            </div>

            <!-- Order Items -->
            <div style="margin-bottom: 30px;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 18px;">Order Items</h3>
              <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                ${itemsHtml}
              </div>
            </div>

            <!-- Shipping Address -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Shipping Address</h3>
              <div style="color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 5px 0; font-weight: 600; color: #1e293b;">${shippingDetails.fullName}</p>
                <p style="margin: 0 0 5px 0;">${shippingDetails.address}</p>
                <p style="margin: 0 0 5px 0;">${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}</p>
                <p style="margin: 0 0 5px 0;">${shippingDetails.country}</p>
                <p style="margin: 0;">Phone: ${shippingDetails.phone}</p>
              </div>
            </div>

            <!-- Order Summary -->
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; margin: 0 0 15px 0; font-size: 18px;">Order Summary</h3>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b;">Subtotal:</span>
                <span style="color: #1e293b; font-weight: 500;">₹${(orderTotal * 0.8).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b;">Discount (20%):</span>
                <span style="color: #10b981; font-weight: 500;">-₹${(orderTotal * 0.2).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #64748b;">Protect Promise Fee:</span>
                <span style="color: #1e293b; font-weight: 500;">₹${(orderItems.reduce((sum, item) => sum + item.quantity, 0) * 9).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                <span style="color: #64748b;">Delivery Fee:</span>
                <span style="color: #1e293b; font-weight: 500;">${orderTotal >= 999 ? 'Free' : '₹50.00'}</span>
              </div>
              <div style="border-top: 2px solid #e2e8f0; padding-top: 15px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #1e293b; font-size: 18px; font-weight: 700;">Total Amount:</span>
                  <span style="color: #1e293b; font-size: 18px; font-weight: 700;">₹${orderTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <!-- Next Steps -->
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
              <h4 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">What's Next?</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>We'll send you a tracking number once your order ships</li>
                <li>You'll receive SMS updates about your order status</li>
                <li>Expected delivery: ${formattedDeliveryDate}</li>
                <li>For any queries, contact us at support@aesthetx.ways</li>
              </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/orders/${orderNumber}" 
                 style="display: inline-block; background: #1e293b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                Track Your Order
              </a>
            </div>

            <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0; text-align: center;">
              Thank you for choosing AESTHETX WAYS! We're excited to deliver your order.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #1e293b; color: white; padding: 20px; text-align: center; border-radius: 0 0 16px 16px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; opacity: 0.9;">
              AESTHETX WAYS - Premium Fashion & Lifestyle Store
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.7;">
              This is an automated email. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email sent successfully',
    });

  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send order confirmation email' },
      { status: 500 }
    );
  }
}
