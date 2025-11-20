# Google Shopping Feed Setup Guide

## ✅ What's Been Created

### 1. Product Feed Files
- **XML Feed**: `https://yourdomain.com/product-feed.xml`
  - Google Shopping format (RSS 2.0)
  - Auto-updates from your database
  
- **JSON Feed**: `https://yourdomain.com/product-feed.json`
  - Facebook/Instagram Shopping format
  - Alternative format for social commerce

### 2. Feed Features
✅ All required Google Shopping attributes
✅ Product images (main + additional)
✅ Size and color information
✅ Stock availability (real-time)
✅ Shipping information
✅ Gender and age group
✅ Brand information
✅ Product categories

---

## 🚀 How to Set Up Google Shopping

### Step 1: Create Google Merchant Center Account
1. Go to: https://merchants.google.com
2. Sign in with your Google account
3. Click "Get Started"
4. Enter your business information:
   - Business name: AesthetX Ways
   - Country: India
   - Time zone: IST

### Step 2: Verify Your Website
1. In Merchant Center, go to "Business Information"
2. Click "Website" tab
3. Add your website URL: `https://aesthetxways.com`
4. Choose verification method:
   - **HTML tag** (Easiest): Add meta tag to your site
   - **Google Analytics**: Link your GA account
   - **Google Tag Manager**: Use GTM

**Add this to your `app/layout.js` head section:**
```html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```

### Step 3: Add Product Feed
1. In Merchant Center, go to "Products" → "Feeds"
2. Click the "+" button to create a new feed
3. Select:
   - Country: India
   - Language: English
   - Feed name: "Main Product Feed"
4. Choose input method: "Scheduled fetch"
5. Enter feed URL: `https://aesthetxways.com/product-feed.xml`
6. Set fetch schedule: Daily at 2:00 AM
7. Click "Create Feed"

### Step 4: Configure Shipping Settings
1. Go to "Tools" → "Shipping and returns"
2. Click "Add shipping service"
3. Configure:
   - Service name: "Standard Shipping"
   - Delivery time: 3-7 business days
   - Shipping cost: Free (or your rate)
   - Coverage: All India

### Step 5: Set Up Tax Settings (if applicable)
1. Go to "Tools" → "Tax"
2. Configure GST settings for India
3. Add tax rates by state if needed

### Step 6: Link to Google Ads (Optional)
1. Go to "Settings" → "Linked accounts"
2. Click "Link" next to Google Ads
3. Enter your Google Ads customer ID
4. Accept the terms

---

## 📋 Google Shopping Feed Attributes

### Required Attributes (Included ✅)
- [x] `id` - Unique product identifier
- [x] `title` - Product name
- [x] `description` - Product description
- [x] `link` - Product page URL
- [x] `image_link` - Main product image
- [x] `availability` - Stock status
- [x] `price` - Product price
- [x] `brand` - Brand name
- [x] `condition` - Product condition (new)

### Recommended Attributes (Included ✅)
- [x] `additional_image_link` - Extra product images
- [x] `product_type` - Your category
- [x] `google_product_category` - Google's category
- [x] `gender` - Target gender
- [x] `age_group` - Target age
- [x] `color` - Product color
- [x] `size` - Available sizes
- [x] `material` - Fabric/material
- [x] `shipping` - Shipping details

### Optional Attributes (To Add)
- [ ] `gtin` - Global Trade Item Number (barcode)
- [ ] `mpn` - Manufacturer Part Number
- [ ] `sale_price` - Discounted price
- [ ] `sale_price_effective_date` - Sale period
- [ ] `custom_label_0-4` - Custom grouping

---

## 🔧 Improving Your Feed

### Add GTIN/Barcode Support
Update your product schema in Convex to include:
```javascript
{
  itemId: "PROD-001",
  name: "Men's Blue T-Shirt",
  gtin: "1234567890123", // Add this
  mpn: "MBT-001", // Add this
  // ... other fields
}
```

Then update the feed to include:
```xml
<g:gtin>1234567890123</g:gtin>
<g:mpn>MBT-001</g:mpn>
```

### Add Sale Prices
```xml
<g:price>2999 INR</g:price>
<g:sale_price>1999 INR</g:sale_price>
<g:sale_price_effective_date>2024-01-01T00:00/2024-01-31T23:59</g:sale_price_effective_date>
```

### Add Custom Labels for Campaigns
```xml
<g:custom_label_0>Bestseller</g:custom_label_0>
<g:custom_label_1>Summer Collection</g:custom_label_1>
<g:custom_label_2>Premium</g:custom_label_2>
```

---

## 🧪 Testing Your Feed

### 1. Test Feed URL
Visit: `https://yourdomain.com/product-feed.xml`
- Should display XML with all products
- Check for any errors

### 2. Google Merchant Center Feed Diagnostics
1. Go to "Products" → "Feeds"
2. Click on your feed name
3. Check "Diagnostics" tab
4. Fix any errors or warnings

### 3. Common Issues & Fixes

**Issue**: "Missing GTIN"
- **Fix**: Add `<g:identifier_exists>no</g:identifier_exists>` (already included)
- **Better**: Add actual GTINs to products

**Issue**: "Image link not accessible"
- **Fix**: Ensure images are publicly accessible
- **Check**: No authentication required

**Issue**: "Price format incorrect"
- **Fix**: Use format "1999 INR" or "1999.00 INR"

**Issue**: "Availability mismatch"
- **Fix**: Ensure real-time stock updates

---

## 📊 Feed Performance Monitoring

### Key Metrics to Track
1. **Active Products**: Products approved by Google
2. **Disapproved Products**: Products with issues
3. **Pending Products**: Products under review
4. **Clicks**: Traffic from Google Shopping
5. **Impressions**: How often products appear
6. **CTR**: Click-through rate

### Optimization Tips
1. **High-Quality Images**: 800x800px minimum
2. **Detailed Titles**: Include brand, type, color, size
3. **Complete Descriptions**: 500-1000 characters
4. **Competitive Pricing**: Monitor competitors
5. **Regular Updates**: Daily feed refresh

---

## 🎯 Google Shopping Ads Setup

### Step 1: Create Shopping Campaign
1. Go to Google Ads
2. Click "+" → "New Campaign"
3. Select goal: "Sales" or "Website traffic"
4. Campaign type: "Shopping"
5. Select Merchant Center account

### Step 2: Configure Campaign
- Campaign name: "AesthetX Ways - All Products"
- Bid strategy: "Maximize clicks" (start)
- Daily budget: ₹500-1000 (adjust based on budget)
- Networks: Search Network only

### Step 3: Create Product Groups
Organize by:
- Category (Men, Women, Sneakers)
- Brand
- Price range
- Custom labels

### Step 4: Set Bids
- Start with ₹5-10 per click
- Adjust based on performance
- Higher bids for bestsellers

---

## 📱 Facebook/Instagram Shopping Setup

### Use JSON Feed
1. Go to Facebook Commerce Manager
2. Create a catalog
3. Add data source: "Data Feed"
4. Enter feed URL: `https://yourdomain.com/product-feed.json`
5. Set schedule: Daily updates
6. Map attributes to Facebook fields

---

## ✅ Checklist

### Before Launch
- [ ] Feed URL is accessible
- [ ] All products have images
- [ ] Prices are correct
- [ ] Stock status is accurate
- [ ] Shipping info is configured
- [ ] Website is verified
- [ ] Feed is uploaded to Merchant Center

### After Launch
- [ ] Monitor feed diagnostics daily
- [ ] Fix disapproved products
- [ ] Update out-of-stock items
- [ ] Add new products to feed
- [ ] Track performance metrics
- [ ] Optimize product titles/descriptions

---

## 🆘 Troubleshooting

### Feed Not Updating?
- Check fetch schedule in Merchant Center
- Verify feed URL is accessible
- Check for XML/JSON syntax errors
- Review server logs for errors

### Products Disapproved?
- Read disapproval reason in Merchant Center
- Common issues: missing attributes, policy violations
- Fix and wait for re-review (24-48 hours)

### Low Impressions?
- Improve product titles (add keywords)
- Add more product images
- Ensure competitive pricing
- Check if products are approved

---

## 📚 Resources

- [Google Merchant Center Help](https://support.google.com/merchants)
- [Product Data Specification](https://support.google.com/merchants/answer/7052112)
- [Feed Rules](https://support.google.com/merchants/answer/188494)
- [Shopping Ads Best Practices](https://support.google.com/google-ads/answer/6275294)

---

## 🎉 Expected Results

### Timeline
- **Week 1**: Feed approved, products under review
- **Week 2**: Products start appearing in Shopping
- **Month 1**: 100-500 impressions/day
- **Month 3**: 1000+ impressions/day
- **Month 6**: Consistent sales from Shopping

### ROI
- Average ROAS: 300-500% (fashion)
- CPC: ₹5-15 (India)
- Conversion rate: 1-3%

---

**Your feeds are ready! Just update the domain URLs and submit to Google Merchant Center.**
