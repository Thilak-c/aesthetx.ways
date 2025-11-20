// components/StructuredData.jsx
"use client";

export function ProductStructuredData({ product, reviews, reviewStats }) {
  if (!product) return null;

  // Calculate total stock across all sizes
  const totalStock = product.sizeStock 
    ? Object.values(product.sizeStock).reduce((sum, stock) => sum + stock, 0)
    : 0;

  // Get available sizes
  const availableSizes = product.sizeStock 
    ? Object.entries(product.sizeStock)
        .filter(([_, stock]) => stock > 0)
        .map(([size]) => size)
    : [];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.mainImage, ...(product.otherImages || [])],
    description: product.description || `Premium ${product.category} - ${product.name}. Available in sizes: ${availableSizes.join(', ')}. High-quality fashion with fast shipping.`,
    sku: product.itemId,
    mpn: product.itemId, // Manufacturer Part Number
    brand: {
      "@type": "Brand",
      name: product.brand || "AesthetX Ways",
    },
    offers: {
      "@type": "Offer",
      url: `https://aesthetxways.com/product/${product.itemId}`,
      priceCurrency: "INR",
      price: product.price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: totalStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: "AesthetX Ways",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR"
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY"
          }
        }
      }
    },
    category: product.category,
    // Add clothing-specific properties
    material: product.material || "Premium Fabric",
    color: product.color || "Multiple Colors Available",
  };

  // Add size information if available
  if (availableSizes.length > 0) {
    structuredData.size = availableSizes.join(', ');
    structuredData.additionalProperty = [
      {
        "@type": "PropertyValue",
        name: "Available Sizes",
        value: availableSizes.join(', ')
      }
    ];
  }

  // Add aggregateRating if reviews exist
  if (reviewStats && reviewStats.totalReviews > 0) {
    structuredData.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewStats.averageRating,
      reviewCount: reviewStats.totalReviews,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add reviews if they exist
  if (reviews && reviews.length > 0) {
    structuredData.review = reviews.slice(0, 5).map((review) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      author: {
        "@type": "Person",
        name: review.userName || "Anonymous",
      },
      datePublished: new Date(review._creationTime).toISOString(),
      reviewBody: review.comment,
      name: review.title,
    }));
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AesthetX Ways",
    url: "https://aesthetxways.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://aesthetxways.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function OrganizationStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AesthetX Ways",
    url: "https://aesthetxways.com",
    logo: "https://aesthetxways.com/logo.png",
    description: "Premium fashion and lifestyle store offering the latest trends in men's and women's fashion, sneakers, and accessories.",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "support@aesthetxways.com",
    },
    sameAs: [
      "https://www.facebook.com/aesthetxways",
      "https://www.instagram.com/aesthetxways",
      "https://twitter.com/aesthetxways",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
