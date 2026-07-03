import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const ADMIN_EMAILS = [
  'aesthetxways07@gmail.com',
  'thilak8797@gmail.com'
];

/**
 * Sends a premium-designed email notification to the admins upon a new order.
 * @param {object} order - The details of the placed order
 */
export async function sendNewOrderAdminNotification(order) {
  const { orderNumber, items, shippingDetails, orderTotal, paymentDetails } = order;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Generate table rows for items
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle;">
        <div style="display: flex; align-items: center;">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 12px; border: 1px solid #e2e8f0;" />` : ''}
          <div>
            <div style="font-weight: bold; color: #000000; font-size: 14px;">${item.name}</div>
            <div style="color: #64748b; font-size: 12px; margin-top: 2px;">Size: ${item.size}</div>
          </div>
        </div>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #000000; font-size: 14px;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #000000; font-weight: 600; font-size: 14px;">
        ${formatCurrency(item.price)}
      </td>
    </tr>
  `).join('');

  const formattedAddress = [
    shippingDetails.flatNo,
    shippingDetails.address,
    shippingDetails.area,
    shippingDetails.landmark,
    shippingDetails.city,
    shippingDetails.state,
    shippingDetails.pincode,
    shippingDetails.country
  ].filter(Boolean).join(', ');

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification - Aesthetx Ways</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; color: #1e293b;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#fafafa" style="padding: 30px 10px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
              
              <!-- Header with clean branding and subtle dark aesthetic -->
              <tr>
                <td align="center" style="background-color: #000000; padding: 30px 40px; text-align: center;">
                  <img src="https://manage.aesthetxways.com/logo.png" alt="Aesthetx Ways Logo" style="width: 60px; height: auto; margin-bottom: 12px; display: inline-block; filter: invert(1);" />
                  <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">New Order Received</h1>
                  <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px; letter-spacing: 0.05em;">Order #${orderNumber}</p>
                </td>
              </tr>

              <!-- Order Summary Callout Card -->
              <tr>
                <td style="padding: 30px 40px 15px 40px;">
                  <div style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9; padding: 20px; text-align: center;">
                    <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 600;">Total Revenue</span>
                    <h2 style="font-size: 32px; font-weight: 800; color: #000000; margin: 5px 0 10px 0;">${formatCurrency(orderTotal)}</h2>
                    <span style="display: inline-block; background-color: #e2fbf0; color: #0d9488; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Paid via Razorpay
                    </span>
                  </div>
                </td>
              </tr>

              <!-- Items Section -->
              <tr>
                <td style="padding: 15px 40px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Order Details</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                    <thead>
                      <tr>
                        <th align="left" style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0;">Item</th>
                        <th align="center" style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; width: 60px;">Qty</th>
                        <th align="right" style="padding: 8px 12px; font-size: 11px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; width: 80px;">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                  </table>
                </td>
              </tr>

              <!-- Customer & Shipping Section -->
              <tr>
                <td style="padding: 15px 40px 30px 40px;">
                  <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 0 0 12px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">Customer & Delivery</h3>
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; line-height: 1.6;">
                    <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px; vertical-align: top;">Name:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-weight: 500;">${shippingDetails.fullName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px; vertical-align: top;">Email:</td>
                      <td style="padding: 6px 0; color: #0f172a;">${shippingDetails.email}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px; vertical-align: top;">Phone:</td>
                      <td style="padding: 6px 0; color: #0f172a;">${shippingDetails.phone}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px; vertical-align: top;">Address:</td>
                      <td style="padding: 6px 0; color: #0f172a; line-height: 1.5;">${formattedAddress}</td>
                    </tr>
                    ${paymentDetails?.razorpayPaymentId ? `
                    <tr>
                      <td style="padding: 6px 0; font-weight: 600; color: #64748b; width: 120px; vertical-align: top;">Payment ID:</td>
                      <td style="padding: 6px 0; color: #0f172a; font-family: monospace; font-size: 13px;">${paymentDetails.razorpayPaymentId}</td>
                    </tr>
                    ` : ''}
                  </table>
                </td>
              </tr>

              <!-- Footer info -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                  This is an automated notification sent from your online storefront.<br />
                  Log in to the <a href="https://manage.aesthetxways.com" style="color: #000000; font-weight: 600; text-decoration: none;">Aesthetx Ways Management Panel</a> to process this order.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `Aesthetxways <${process.env.EMAIL_USER}>`,
    to: ADMIN_EMAILS.join(', '),
    subject: `🚨 NEW ORDER RECEIVED - #${orderNumber} (${formatCurrency(orderTotal)})`,
    html: emailHtml,
  };

  await transporter.sendMail(mailOptions);
}
