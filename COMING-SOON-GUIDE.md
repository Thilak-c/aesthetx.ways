# Coming Soon Page Guide

## 🎨 What's Been Created

A beautiful, animated "Coming Soon" page with:
- ✨ Animated background with floating sparkles
- ⏰ Live countdown timer (30 days)
- 📧 Email notification signup form
- 🎭 Smooth animations and transitions
- 📱 Fully responsive design
- 🌐 Social media links
- 🎯 Modern glassmorphism design

## 🔄 How to Switch Between Pages

### Option 1: Manual File Swap (Current Setup)

**To show Coming Soon page (CURRENT):**
```bash
# Already active - app/page.jsx is the coming soon page
```

**To show Main Website:**
```bash
# Rename files
mv app/page.jsx app/page-coming-soon.jsx
mv app/page-backup-main.jsx app/page.jsx

# Restart dev server
npm run dev
```

**To go back to Coming Soon:**
```bash
# Rename files back
mv app/page.jsx app/page-backup-main.jsx
mv app/page-coming-soon.jsx app/page.jsx

# Restart dev server
npm run dev
```

### Option 2: Environment Variable (Recommended)

Create a wrapper page that checks an environment variable:

1. **Add to `.env.local`:**
```env
NEXT_PUBLIC_COMING_SOON=true
```

2. **Create `app/page-wrapper.jsx`:**
```jsx
"use client";
import { useEffect, useState } from "react";
import ComingSoon from "./page-coming-soon";
import MainPage from "./page-backup-main";

export default function PageWrapper() {
  const [showComingSoon, setShowComingSoon] = useState(true);

  useEffect(() => {
    const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === "true";
    setShowComingSoon(isComingSoon);
  }, []);

  return showComingSoon ? <ComingSoon /> : <MainPage />;
}
```

3. **Toggle by changing `.env.local`:**
```env
# Show coming soon
NEXT_PUBLIC_COMING_SOON=true

# Show main website
NEXT_PUBLIC_COMING_SOON=false
```

## 🎨 Customization

### Change Launch Date

Edit `app/page.jsx`:
```javascript
// Current: 30 days from now
launchDate.setDate(launchDate.getDate() + 30);

// Change to specific date
const launchDate = new Date("2024-12-31T00:00:00");
```

### Update Social Media Links

Edit `app/page.jsx`:
```javascript
{[
  { icon: Instagram, href: "https://instagram.com/yourhandle", label: "Instagram" },
  { icon: Facebook, href: "https://facebook.com/yourpage", label: "Facebook" },
  { icon: Twitter, href: "https://twitter.com/yourhandle", label: "Twitter" },
]}
```

### Change Brand Name

Edit `app/page.jsx`:
```javascript
<h1 className="...">
  Your Brand Name
</h1>
```

### Customize Colors

The page uses Tailwind CSS. Main colors:
- Background: `from-black via-gray-900 to-black`
- Accent: `bg-white text-black` (buttons)
- Borders: `border-white/10`

### Email Signup Integration

Currently, the form just shows a success message. To integrate with a real service:

**Option 1: Mailchimp**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  // Handle response
};
```

**Option 2: ConvertKit**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  await fetch('https://api.convertkit.com/v3/forms/YOUR_FORM_ID/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: 'YOUR_API_KEY',
      email: email,
    }),
  });
};
```

**Option 3: Save to Convex**
Create a mutation in `convex/emails.js`:
```javascript
export const addEmailSubscriber = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailSubscribers", {
      email: args.email,
      subscribedAt: Date.now(),
    });
  },
});
```

## 📱 Features

### Countdown Timer
- Automatically counts down to launch date
- Updates every second
- Shows days, hours, minutes, seconds

### Email Form
- Validates email format
- Shows success animation
- Resets after 3 seconds

### Animations
- Floating sparkles in background
- Pulsing gradient orbs
- Smooth transitions
- Hover effects on buttons

### Responsive Design
- Mobile-first approach
- Adapts to all screen sizes
- Touch-friendly buttons

## 🚀 Deployment

### Before Launch
1. Update social media links
2. Set correct launch date
3. Integrate email service
4. Test on mobile devices
5. Add Google Analytics (optional)

### On Launch Day
```bash
# Switch to main website
mv app/page.jsx app/page-coming-soon.jsx
mv app/page-backup-main.jsx app/page.jsx

# Build and deploy
npm run build
npm start
```

## 🎯 SEO Considerations

The coming soon page includes:
- Proper meta tags (from root layout)
- Semantic HTML
- Accessible design
- Fast loading time

To improve SEO:
1. Add meta description in `app/layout.js`
2. Submit to Google Search Console
3. Create social media posts
4. Build anticipation with teasers

## 📊 Analytics

Add Google Analytics to track:
- Page views
- Email signups
- Social media clicks
- Time on page

## 🎨 Design Credits

- Animations: Framer Motion
- Icons: Lucide React
- Styling: Tailwind CSS
- Inspiration: Modern SaaS landing pages

## 🆘 Troubleshooting

**Countdown not working?**
- Check browser console for errors
- Ensure date is in the future
- Verify timezone settings

**Animations laggy?**
- Reduce number of floating elements
- Disable blur effects on low-end devices
- Use `will-change` CSS property

**Email form not submitting?**
- Check form validation
- Verify API endpoint
- Check network tab in DevTools

---

**Current Status:** Coming Soon page is ACTIVE
**Main Website:** Backed up as `app/page-backup-main.jsx`
**Launch Date:** 30 days from deployment
