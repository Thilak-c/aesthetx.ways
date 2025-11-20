# Razorpay Integration Setup Guide

## 1. Environment Variables

Create a `.env.local` file in your project root and add the following variables:

```bash
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# For client-side (optional - for testing)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

## 2. Get Razorpay API Keys

1. Sign up/Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate a new key pair
4. Copy the Key ID and Key Secret

## 3. Test Mode vs Live Mode

- **Test Mode**: Use test keys for development (transactions won't charge real money)
- **Live Mode**: Use live keys for production (real transactions)

## 4. Webhook Configuration (Optional)

For production, configure webhooks in Razorpay dashboard:
- URL: `https://yourdomain.com/api/webhook`
- Events: `payment.captured`, `order.paid`

## 5. Testing

1. Use test card numbers from Razorpay documentation
2. Test successful and failed payment scenarios
3. Verify payment verification works correctly

## 6. Security Notes

- Never expose `RAZORPAY_KEY_SECRET` on the client side
- Always verify payment signatures on the server
- Use HTTPS in production
- Implement proper error handling

## 7. Common Issues

- **Script loading failed**: Check internet connection and Razorpay CDN
- **Payment verification failed**: Ensure signature verification is working
- **Order creation failed**: Check API keys and server configuration

## 8. Next Steps

- Implement order creation in your database
- Add email notifications
- Create order management system
- Add payment analytics 