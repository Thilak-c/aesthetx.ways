"use client";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  Truck,
  Shield,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ChevronDown,
  Eye,
  Clock,
  MapPin,
  Award,
  Zap,
  ThumbsUp,
  X,
  Search,
  Lock,
  ZoomIn,
  History,
  Users,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

// Font classes
const fontClasses = {
  poppins: "font-poppins",
  inter: "font-inter",
};

export default function ProductPage() {
  const [token, setToken] = useState(null);
  const params = useParams();
  const router = useRouter();
  const { productId } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("reviews");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    size: "",
    recommend: true,
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  // Touch/swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [imageDirection, setImageDirection] = useState(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);
  const updateForm = (field, value) => {
    setReviewForm((prev) => ({ ...prev, [field]: value }));
  };
  // Update login state when me data changes
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");

  useEffect(() => {
    if (me) {
      setIsLoggedIn(true);
    } else if (token && !me) {
      setIsLoggedIn(false);
    }
  }, [me, token]);

  const wishlistStatus = useQuery(
    api.wishlist.isProductWishlisted,
    me && productId ? { userId: me._id, productId } : "skip"
  );
  // Update wishlist state when wishlistStatus changes
  useEffect(() => {
    if (wishlistStatus) {
      setIsWishlisted(wishlistStatus.isWishlisted);
    }
  }, [wishlistStatus]);
  useEffect(() => {
    const handleBeforeUnload = () => {
      sessionStorage.setItem("homeScroll", window.scrollY);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
  useEffect(() => {
    const scrollY = sessionStorage.getItem("homeScroll");
    if (scrollY) {
      window.scrollTo({ top: parseInt(scrollY), behavior: "auto" });
      sessionStorage.removeItem("homeScroll"); // optional: clear after restoring
    }
  }, []);
  const handleClickProduct = (productId) => {
    sessionStorage.setItem("homeScroll", window.scrollY);
    router.push(`/product/${productId}`);
  };
  // Reviews data
  const reviews = useQuery(
    api.reviews.getProductReviews,
    productId ? { productId } : "skip"
  );
  const reviewStats = useQuery(
    api.reviews.getProductReviewStats,
    productId ? { productId } : "skip"
  );

  // Mutations
  const addReviewMutation = useMutation(api.reviews.addReview);
  const addToCartMutation = useMutation(api.cart.addToCart);
  const toggleWishlistMutation = useMutation(api.wishlist.toggleWishlist);

  // Add view tracking mutation
  const addViewMutation = useMutation(api.views.addView);

  // Cart data
  const userCart = useQuery(
    api.cart.getUserCart,
    me ? { userId: me._id } : "skip"
  );
  const cartSummary = useQuery(
    api.cart.getCartSummary,
    me ? { userId: me._id } : "skip"
  );

  // Wishlist data
  const wishlistSummary = useQuery(
    api.wishlist.getWishlistSummary,
    me ? { userId: me._id } : "skip"
  );

  // Product data using new Convex React hooks
  const product = useQuery(
    api.products.getProductById,
    productId ? { productId } : "skip"
  );
  const trendingProducts = useQuery(api.views.getMostViewedProducts, {
    limit: 6,
    category: product?.category,
  });
  // Update loading state based on product query
  useEffect(() => {
    if (product !== undefined) {
      setIsLoading(false);
      if (!product) {
        setError("Product not found");
      }
    }
  }, [product]);
  const personalizedProducts = useQuery(api.products.getPersonalizedProducts, {
    limit: 6,
    userId: me?._id,
  });

  // Add this query after line 115 (after the product query)
  const relatedProducts = useQuery(
    api.products.getRelatedProducts,
    product
      ? {
          productId: productId,
          category: product.category,
          price: product.price,
          limit: 4,
        }
      : "skip"
  );

  // Add recently viewed products query
  const recentlyViewed = useQuery(
    api.products.getRecentlyViewed,
    me ? { userId: me._id, limit: 6 } : "skip"
  );

  // Add recently viewed mutation
  const addRecentlyViewedMutation = useMutation(api.products.addRecentlyViewed);

  // Add recently viewed when product loads
  useEffect(() => {
    if (product && me) {
      addRecentlyViewedMutation({
        userId: me._id,
        productId: productId,
        productName: product.name,
        productImage: product.mainImage,
        productPrice: product.price,
        productCategory: product.category,
      }).catch(console.error);
    }
  }, [product, me, productId, addRecentlyViewedMutation]);

  // Add view tracking when product loads
  useEffect(() => {
    if (product) {
      // Get user agent and referrer for analytics
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || "";
      const sessionId =
        sessionStorage.getItem("sessionId") ||
        (() => {
          const newSessionId =
            "session_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem("sessionId", newSessionId);
          return newSessionId;
        })();

      // Prepare view data, only including defined values
      const viewData = {
        productId: product.itemId, // Use itemId instead of productId
        viewedAt: new Date().toISOString(),
        sessionId: sessionId,
        viewType: "product_page",
        category: product.category,
      };

      // Add optional fields only if they have values
      if (me?._id) {
        viewData.userId = me._id;
      }
      if (userAgent) {
        viewData.userAgent = userAgent;
      }
      if (referrer) {
        viewData.referrer = referrer;
      }

      addViewMutation(viewData).catch(console.error);
    }
  }, [product, productId, me, addViewMutation]);

  // Add trending products query

  const handleAddToCart = async () => {
    if (!isLoggedIn || !me) {
      // Redirect to login page with return URL
      const currentUrl = window.location.pathname + window.location.search;
      router.push(
        `/login?returnUrl=${encodeURIComponent(currentUrl)}&action=addToCart`
      );
      return;
    }

    if (!selectedSize) {
      setToastMessage("Please select a size first");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!product) {
      setToastMessage("Product information not available");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Check if quantity exceeds available stock
    if (quantity > (product.sizeStock?.[selectedSize] || 0)) {
      setToastMessage(
        `Only ${product.sizeStock?.[selectedSize] || 0} items available in this size`
      );
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      await addToCartMutation({
        userId: me._id,
        productId: productId,
        productName: product.name,
        productImage: product.mainImage,
        price: product.price,
        size: selectedSize,
        quantity: quantity,
      });

      setToastMessage("Product added to cart successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setToastMessage("Failed to add product to cart");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn || !me) {
      // Redirect to login page with return URL
      const currentUrl = window.location.pathname + window.location.search;
      router.push(
        `/login?returnUrl=${encodeURIComponent(currentUrl)}&action=buy`
      );
      return;
    }

    if (!selectedSize) {
      setToastMessage("Please select a size first");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!product) {
      setToastMessage("Product information not available");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    // Check if quantity exceeds available stock
    if (selectedSize && product.sizeStock?.[selectedSize] !== undefined) {
      const availableStock = product.sizeStock[selectedSize];
      if (quantity > availableStock) {
        setToastMessage(
          `Only ${availableStock} units available in size ${selectedSize}`
        );
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
    }

    // Create checkout URL with product information
    const checkoutParams = new URLSearchParams({
      productId: productId,
      productName: product.name,
      productImage: product.mainImage,
      price: product.price.toString(),
      size: selectedSize,
      quantity: quantity.toString(),
      category: product.category,
      brand: product.brand || "",
      action: "buyNow", // Flag to indicate this is a direct buy, not from cart
    });

    // Redirect directly to checkout with product parameters
    router.push(`/checkout?${checkoutParams.toString()}`);
  };
  const handleWishlistToggle = async () => {
    if (!isLoggedIn || !me) {
      setToastMessage("Please login to manage your wishlist");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (!product) {
      setToastMessage("Product information not available");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    setIsWishlisting(true);
    try {
      const result = await toggleWishlistMutation({
        userId: me._id,
        productId: productId,
        productName: product.name,
        productImage: product.mainImage,
        price: product.price,
        category: product.category,
      });

      if (result.success) {
        setIsWishlisted(result.isWishlisted);
        setToastMessage(result.message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        console.log("Wishlist updated:", {
          product: product.name,
          action: result.action,
          isWishlisted: result.isWishlisted,
        });
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      setToastMessage(error.message || "Failed to update wishlist");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsWishlisting(false);
    }
  };
  useEffect(() => {
    console.log("Personalized products debug:", {
      personalizedProducts,
      userId: me?._id,
      userName: me?.name,
      userInterests: me?.interests,
      hasUser: !!me,
    });
  }, [personalizedProducts, me]);

  const handleAddReview = async () => {
    console.log("handleAddReview called");
    console.log("isLoggedIn:", isLoggedIn);
    console.log("me:", me);
    console.log("token:", token);
    console.log("reviewForm:", reviewForm);

    if (!isLoggedIn || !me) {
      console.log("Early return - not logged in or no user data");
      return;
    }

    setIsSubmittingReview(true);
    try {
      // Submit review to Convex
      await addReviewMutation({
        productId: productId,
        userId: me._id,
        userName: me.name || "Anonymous",
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        size: reviewForm.size || "",
        recommend: reviewForm.recommend,
      });

      // Reset form
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
        size: "",
        recommend: true,
      });

      // Show success message
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 5000); // Hide after 5 seconds

      // Show toast
      setToastMessage("Review submitted successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      console.log("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      // Show error toast
      setToastMessage(error.message || "Failed to submit review");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Enhanced touch handlers for mobile
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);

    if (touchStart && e.targetTouches[0].clientX) {
      const distance = touchStart - e.targetTouches[0].clientX;
      if (Math.abs(distance) > 20) {
        setSwipeDirection(distance > 0 ? "left" : "right");
      }
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    const totalImages = [product?.mainImage, ...product?.otherImages].length;

    if (isLeftSwipe && selectedImage < totalImages - 1) {
      setImageDirection("next");
      setIsTransitioning(true);
      setSelectedImage(selectedImage + 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setImageDirection(null);
      }, 500);
    }
    if (isRightSwipe && selectedImage > 0) {
      setImageDirection("prev");
      setIsTransitioning(true);
      setSelectedImage(selectedImage - 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setImageDirection(null);
      }, 500);
    }

    setSwipeDirection(null);
  };

  // Enhanced image change handler
  const changeImage = (direction) => {
    const totalImages = [product?.mainImage, ...product?.otherImages].length;

    if (direction === "next" && selectedImage < totalImages - 1) {
      setImageDirection("next");
      setIsTransitioning(true);
      setSelectedImage(selectedImage + 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setImageDirection(null);
      }, 500);
    } else if (direction === "prev" && selectedImage > 0) {
      setImageDirection("prev");
      setIsTransitioning(true);
      setSelectedImage(selectedImage - 1);
      setTimeout(() => {
        setIsTransitioning(false);
        setImageDirection(null);
      }, 500);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">
          </p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-md mx-auto px-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Product Loading Error
          </h2>
          <p className="text-red-600 text-lg">{error}</p>

          <div className="text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Debug Information:</p>
            <p>Product ID: {productId}</p>
            <p>Convex Test: {testResult || "Failed"}</p>
            <p>Products Count: {allProducts?.length || "Unknown"}</p>
            <p>Loading State: {isLoading ? "Yes" : "No"}</p>
            {debugProductIds && debugProductIds.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Available Product IDs:</p>
                <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                  {debugProductIds.slice(0, 5).map((p, i) => (
                    <div key={i} className="bg-white p-1 rounded">
                      <span className="font-mono">{p.itemId || p._id}</span> -{" "}
                      {p.name}
                    </div>
                  ))}
                  {debugProductIds.length > 5 && (
                    <p className="text-gray-500">
                      ... and {debugProductIds.length - 5} more
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.back()}
              className="w-full px-6 py-3 bg-white text-gray-900 rounded-xl font-medium border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
            >
              Go Back
            </button>
            <a
              href="/debug/products"
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-center block"
            >
              View Database Debug
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Product Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    {
      id: "reviews",
      label: "Customer Reviews",
      icon: Star,
      description: "What others are saying",
    },
    {
      id: "details",
      label: "Product Details",
      icon: Check,
      description: "Learn more about this product",
    },
    {
      id: "specifications",
      label: "Specifications",
      icon: Shield,
      description: "Technical details and materials",
    },
    {
      id: "shipping",
      label: "Shipping & Returns",
      icon: Truck,
      description: "Delivery and return policy",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Add trending products query

  // Add personalized products query for the user

  // Add debug logging

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Responsive Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm ${fontClasses.poppins}`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm lg:text-base hidden sm:inline">
                Back to Products
              </span>
              <span className="font-medium text-sm sm:hidden">Back</span>
            </motion.button>

            <div className="flex items-center space-x-3 lg:space-x-6">
              {/* Cart Icon with Badge */}
              {isLoggedIn && (
                <Link href="/cart">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative p-2 lg:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-all duration-200"
                    title="View Cart"
                  >
                    <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                    {cartSummary && cartSummary.totalItems > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-extrabold"
                      >
                        {cartSummary.totalItems > 99
                          ? "99+"
                          : cartSummary.totalItems}
                      </motion.div>
                    )}
                  </motion.button>
                </Link>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product?.name,
                      text: `Check out this amazing ${product?.name} - ${product?.category}`,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    setToastMessage("Link copied to clipboard!");
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }
                }}
                className="p-2 lg:p-3 text-gray-600 hover:bg-gray-100 rounded-lg lg:rounded-xl transition-all duration-200"
                title="Share"
              >
                <Share2 className="w-5 h-5 lg:w-6 lg:h-6" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleWishlistToggle}
                disabled={isWishlisting || !isLoggedIn}
                className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-200 ${
                  isWishlisted
                    ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                } ${isWishlisting ? "opacity-50 cursor-not-allowed" : ""}`}
                title={
                  isLoggedIn
                    ? isWishlisted
                      ? "Remove from wishlist"
                      : "Add to wishlist"
                    : "Login to manage wishlist"
                }
              >
                {isWishlisting ? (
                  <div className="w-5 h-5 lg:w-6 lg:h-6 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart
                    className={`w-5 h-5 lg:w-6 lg:h-6 ${isWishlisted ? "fill-current" : ""}`}
                  />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Responsive Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-20 lg:top-24 left-1/2 transform -translate-x-1/2 z-50 mx-4 max-w-sm lg:max-w-md w-full ${fontClasses.poppins}`}
          >
            <div className="bg-gray-900 text-white px-4 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl shadow-2xl border border-gray-700 flex items-center space-x-3">
              <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium text-sm lg:text-base">
                {toastMessage}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Image Modal for Desktop */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="relative aspect-[4/5] lg:aspect-[3/4] bg-white rounded-2xl overflow-hidden">
                <img
                  src={
                    modalImageIndex === 0
                      ? product?.mainImage
                      : product?.otherImages[modalImageIndex - 1]
                  }
                  alt={product?.name}
                  className="object-cover object-center"
                />
              </div>

              {/* Desktop Modal Navigation */}
              <div className="flex justify-center mt-4 space-x-2 overflow-x-auto">
                {[product?.mainImage, ...product?.otherImages].map(
                  (img, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`w-12 h-12 lg:w-16 lg:h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                        modalImageIndex === index
                          ? "border-white"
                          : "border-white/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product?.name} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-12 ${fontClasses.poppins}`}
      >
        {/* Responsive Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Enhanced Product Images - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-4 lg:space-y-6"
          >
            <div className="relative group">
              <div
                className="relative aspect-[4/5] lg:aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg lg:shadow-2xl cursor-pointer"
                onClick={() => setShowImageModal(true)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Main Image with Enhanced Animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial={{
                      opacity: 0,
                      x:
                        imageDirection === "next"
                          ? 100
                          : imageDirection === "prev"
                            ? -100
                            : 0,
                      scale: 0.9,
                      rotateY:
                        imageDirection === "next"
                          ? 15
                          : imageDirection === "prev"
                            ? -15
                            : 0,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      rotateY: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x:
                        imageDirection === "next"
                          ? -100
                          : imageDirection === "prev"
                            ? 100
                            : 0,
                      scale: 0.9,
                      rotateY:
                        imageDirection === "next"
                          ? -15
                          : imageDirection === "prev"
                            ? 15
                            : 0,
                    }}
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      scale: { duration: 0.3 },
                      rotateY: { duration: 0.4 },
                    }}
                    className="absolute inset-0"
                  >
                    <img
                      src={
                        selectedImage === 0
                          ? product?.mainImage
                          : product?.otherImages[selectedImage - 1]
                      }
                      alt={product?.name}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Desktop Navigation Arrows - Hidden on mobile */}
                {selectedImage > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -30, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      },
                    }}
                    whileHover={{
                      scale: 1.1,
                      x: -2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      scale: 0.9,
                      transition: { duration: 0.1 },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage("prev");
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 border border-gray-200 hidden lg:block"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </motion.button>
                )}

                {selectedImage <
                  [product?.mainImage, ...product?.otherImages].length - 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: 30, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                      },
                    }}
                    whileHover={{
                      scale: 1.1,
                      x: 2,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{
                      scale: 0.9,
                      transition: { duration: 0.1 },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage("next");
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-xl hover:bg-white hover:shadow-2xl transition-all duration-300 border border-gray-200 hidden lg:block"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700 rotate-180" />
                  </motion.button>
                )}

                {/* Mobile Navigation Arrows - Hidden on desktop */}
                {selectedImage > 0 && (
                  <motion.button
                    initial={{ opacity: 0, x: -40, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      },
                    }}
                    whileHover={{ scale: 1.15, x: -5 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage("prev");
                    }}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-2xl hover:bg-white hover:shadow-3xl transition-all duration-300 border border-gray-200 lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </motion.button>
                )}

                {selectedImage <
                  [product?.mainImage, ...product?.otherImages].length - 1 && (
                  <motion.button
                    initial={{ opacity: 0, x: 40, scale: 0.5 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: {
                        delay: 0.3,
                        type: "spring",
                        stiffness: 200,
                      },
                    }}
                    whileHover={{ scale: 1.15, x: 5 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      changeImage("next");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-2xl hover:bg-white hover:shadow-3xl transition-all duration-300 border border-gray-200 lg:hidden"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700 rotate-180" />
                  </motion.button>
                )}

                {/* Enhanced Zoom Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.5, y: -20 }}
                  animate={{
                    opacity: 0,
                    scale: 0.8,
                    y: 0,
                    transition: { delay: 0.4, type: "spring", stiffness: 200 },
                  }}
                  whileHover={{
                    opacity: 1,
                    scale: 1.1,
                    y: -2,
                    transition: { duration: 0.2, type: "spring" },
                  }}
                  className="absolute top-3 right-3 p-3 bg-white/95 backdrop-blur-md rounded-full shadow-2xl hover:bg-white hover:shadow-3xl transition-all duration-300 border border-gray-200"
                  title="Click to zoom"
                >
                  <ZoomIn className="w-5 h-5 text-gray-700" />
                </motion.button>

                {/* Enhanced Image Counter */}
              </div>
            </div>

            {/* Enhanced Thumbnail Section - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="space-y-3 lg:space-y-4"
            >
              <div className="relative">
                <div className="flex space-x-3 lg:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                  {[product?.mainImage, ...product?.otherImages].map(
                    (img, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          transition: {
                            delay: 0.9 + index * 0.1,
                            type: "spring",
                            stiffness: 200,
                          },
                        }}
                        whileHover={{
                          scale: 1.08,
                          y: -3,
                          transition: { duration: 0.2, type: "spring" },
                        }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setImageDirection(
                            selectedImage < index ? "next" : "prev"
                          );
                          setIsTransitioning(true);
                          setSelectedImage(index);
                          setTimeout(() => {
                            setIsTransitioning(false);
                            setImageDirection(null);
                          }, 500);
                        }}
                        className={`relative w-20 h-20 lg:w-24 lg:h-24 rounded-xl lg:rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg flex-shrink-0 ${
                          selectedImage === index
                            ? "border-gray-900 ring-4 ring-gray-900/20 shadow-2xl"
                            : "border-gray-200 hover:border-gray-300 "
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product?.name} ${index + 1}`}
                          fill
                          className="object-cover object-center"
                        />

                        {selectedImage === index && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                              transition: { type: "spring", stiffness: 400 },
                            }}
                            className="absolute inset-0 bg-black/20 flex items-center justify-center"
                          >
                            <Check className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Enhanced Product Info - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6 lg:space-y-8"
          >
            {/* Product Header */}
            <div className="space-y-4 lg:space-y-6">
              <div className="flex flex-col space-y-3 lg:space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
                  <div className="flex flex-col space-y-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center space-x-1"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 lg:w-5 lg:h-5 ${
                            star <= (reviewStats?.averageRating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm lg:text-base text-gray-600 ml-2 font-medium">
                        ({reviews?.length || 0} reviews)
                      </span>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="flex items-center space-x-2 text-sm lg:text-base text-gray-500"
                  >
                    <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>In Stock</span>
                  </motion.div>
                </div>
              </div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight"
              >
                {product?.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4 lg:space-x-6"
              >
                <div className="flex items-baseline space-x-2 lg:space-x-3">
                  <span className="text-xl lg:text-2xl xl:text-3xl font-extrabold text-gray-900">
                    <span className="text-green-800">₹</span>
                    {product?.price}
                  </span>
                  <span className="text-lg lg:text-xl xl:text-2xl text-gray-400 line-through">
                    ₹{Math.round(product?.price * 1.2)}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Size Selection - Responsive */}
            {product?.availableSizes && product.availableSizes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3 lg:space-y-4"
              >
                <label className="text-base lg:text-lg font-semibold text-gray-900">
                  Select Size
                </label>

                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {product.availableSizes.map((size) => {
                    const sizeStock = product.sizeStock?.[size] || 0;
                    const isOutOfStock = sizeStock === 0;
                    const isSelected = selectedSize === size;

                    return (
                      <motion.button
                        key={size}
                        whileHover={{ scale: isOutOfStock ? 1 : 1.05 }}
                        whileTap={{ scale: isOutOfStock ? 1 : 0.95 }}
                        onClick={() => !isOutOfStock && setSelectedSize(size)}
                        disabled={isOutOfStock}
                        className={`relative px-3 py-2 lg:px-4 lg:py-3 rounded-sm lg:rounded-2xl border-2 font-medium transition-all duration-200 text-xs lg:text-sm ${
                          isSelected
                            ? "border-gray-900 bg-gray-900 text-white"
                            : isOutOfStock
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{size}</span>
                        {sizeStock > 0 && sizeStock < 10 && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 lg:w-3 lg:h-3 bg-orange-200 rounded-full"></div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-gray-400 transform rotate-45"></div>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {!selectedSize && product.availableSizes.length > 0 && (
                  <div className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 bg-gray-50 p-3 lg:p-4 rounded-lg lg:rounded-xl border border-gray-200">
                    <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Please select a size to continue</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Quantity Selector - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 lg:space-y-4"
            >
              <label className="text-base lg:text-lg font-semibold text-gray-900">
                Quantity
              </label>

              <div className="flex items-center space-x-4 lg:space-x-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-2 lg:p-3 border-2 border-gray-200 rounded-xl lg:rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.button>

                <span className="w-10 lg:w-16 text-center text-xl lg:text-2xl font-extrabold text-gray-900">
                  {quantity}
                </span>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={
                    selectedSize &&
                    product?.sizeStock?.[selectedSize] !== undefined &&
                    quantity >= product.sizeStock[selectedSize]
                  }
                  className="p-2 lg:p-3 border-2 border-gray-200 rounded-xl lg:rounded-2xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
                </motion.button>
              </div>

              {selectedSize &&
                product?.sizeStock?.[selectedSize] !== undefined && (
                  <>
                    {product.sizeStock[selectedSize] === 0 && (
                      <div className="flex items-center space-x-2 text-sm lg:text-base text-red-600 bg-red-50 p-3 lg:p-4 rounded-lg lg:rounded-xl border border-red-200">
                        <X className="w-4 h-4 lg:w-5 lg:h-5" />
                        <span>
                          Size {selectedSize} is currently out of stock
                        </span>
                      </div>
                    )}

                    {product.sizeStock[selectedSize] > 0 &&
                      product.sizeStock[selectedSize] < 10 && (
                        <div className="flex items-center space-x-2 text-sm lg:text-base text-gray-600 bg-gray-50 p-3 lg:p-4 rounded-lg lg:rounded-xl border border-gray-200">
                          <Clock className="w-4 h-4 lg:w-5 lg:h-5" />
                          <span>
                            Only few units left in size {selectedSize}!
                          </span>
                        </div>
                      )}
                  </>
                )}

              <div className="flex items-center space-x-2 text-sm lg:text-base text-gray-600">
                <Check className="w-4 h-4 lg:w-5 lg:h-5 text-gray-500" />
                <span>Free shipping on orders over ₹999</span>
              </div>
            </motion.div>

            {/* Action Buttons - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3 lg:space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={
                  isLoggedIn &&
                  (!selectedSize ||
                    (selectedSize &&
                      product?.sizeStock?.[selectedSize] === 0) ||
                    (product?.availableSizes &&
                      product.availableSizes.length > 0 &&
                      !selectedSize))
                }
                className="w-full bg-gray-900 text-white py-3 lg:py-5 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
              >
                Add to Cart
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={
                  isLoggedIn &&
                  (!selectedSize ||
                    (selectedSize &&
                      product?.sizeStock?.[selectedSize] === 0) ||
                    (product?.availableSizes &&
                      product.availableSizes.length > 0 &&
                      !selectedSize))
                }
                className="w-full bg-white text-gray-900 py-3 lg:py-5 px-6 lg:px-8 rounded-2xl lg:rounded-3xl font-extrabold text-base lg:text-lg border-3 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900"
              >
                <span>
                  {!isLoggedIn
                    ? "Buy Now" // Always shows "Buy Now" - no "Login to Buy Now"
                    : !selectedSize &&
                        product?.availableSizes &&
                        product.availableSizes.length > 0
                      ? "Select Size to Buy Now"
                      : selectedSize && product?.sizeStock?.[selectedSize] === 0
                        ? `Size ${selectedSize} Out of Stock`
                        : `Buy Now`}
                </span>
              </motion.button>
            </motion.div>

            {/* Features Grid - Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className=" lg:grid-cols-4 gap-4 lg:gap-6 pt-6 lg:pt-8 border-t border-gray-200"
            >
              <div className="flex items-center space-x-3 p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl lg:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <Truck className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm lg:text-base">
                    Free Shipping
                  </p>
                  <p className="text-xs lg:text-sm text-gray-600">
                    On orders over ₹999
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile-Optimized Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          {/* Mobile-Optimized Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-4 min-w-max px-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center space-y-1 py-4 px-2 border-b-2 font-semibold text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-gray-900 text-gray-900"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>

          {/* Mobile-Optimized Tab Content */}
          <div className="py-6">
            <AnimatePresence mode="wait">
              {activeTab === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-extrabold text-gray-900 mb-4">
                      Product Details
                    </h3>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                      Discover the exceptional quality and craftsmanship that
                      makes this product truly special
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Check className="w-6 h-6 text-gray-500" />
                        <span>Key Features</span>
                      </h4>
                      <ul className="space-y-4">
                        {[
                          "Premium quality materials sourced from the finest suppliers",
                          "Expert craftsmanship with attention to every detail",
                          "Comfortable fit designed for all-day wear",
                          "Versatile design perfect for any occasion",
                          "Sustainable and eco-friendly production methods",
                        ].map((feature, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Check className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">
                              {feature}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-gray-500" />
                        <span>Care Instructions</span>
                      </h4>
                      <ul className="space-y-4">
                        {[
                          "Machine wash cold with similar colors",
                          "Tumble dry low or air dry for best results",
                          "Iron on low heat if needed",
                          "Do not bleach or use harsh detergents",
                          "Store in a cool, dry place",
                        ].map((care, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Check className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">
                              {care}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-100">
                    <h4 className="text-2xl font-extrabold text-gray-900 mb-4 text-center">
                      Why Choose This Product?
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          icon: Award,
                          title: "Premium Quality",
                          description: "Made with the finest materials",
                        },
                        {
                          icon: Zap,
                          title: "Fast Delivery",
                          description: "Get it delivered in 2-3 days",
                        },
                        {
                          icon: Shield,
                          title: "Warranty",
                          description: "1 year manufacturer warranty",
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center space-y-3"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                            <item.icon className="w-8 h-8 text-gray-700" />
                          </div>
                          <h5 className="font-semibold text-gray-900">
                            {item.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "specifications" && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                      Technical Specifications
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      Detailed technical information and material specifications
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                        Material & Construction
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: "Material", value: "100% Premium Cotton" },
                          { label: "Weight", value: "180 GSM (Lightweight)" },
                          { label: "Weave", value: "Single Jersey" },
                          { label: "Construction", value: "20s Single Yarn" },
                          { label: "Finish", value: "Soft Touch" },
                        ].map((spec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-4 border-b border-gray-100 space-y-1 sm:space-y-0"
                          >
                            <span className="text-sm sm:text-base text-gray-600 font-medium">
                              {spec.label}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                              {spec.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                        Fit & Sizing
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: "Fit Type", value: "Regular Fit" },
                          { label: "Sleeve Length", value: "Full Sleeve" },
                          { label: "Neck Style", value: "Round Neck" },
                          { label: "Hem Style", value: "Straight Hem" },
                          {
                            label: "Care Instructions",
                            value: "Machine Washable",
                          },
                        ].map((spec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-4 border-b border-gray-100 space-y-1 sm:space-y-0"
                          >
                            <span className="text-sm sm:text-base text-gray-600 font-medium">
                              {spec.label}
                            </span>
                            <span className="text-sm sm:text-base font-semibold text-gray-900">
                              {spec.value}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Size-Based Inventory Information */}
                  {product.availableSizes &&
                    product.availableSizes.length > 0 && (
                      <div className="mt-12 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-3xl p-8 border border-gray-100">
                        <h4 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
                          Size-Based Inventory
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {product.availableSizes.map((size, index) => {
                              const sizeStock = product.sizeStock?.[size] || 0;
                              return (
                                <motion.div
                                  key={size}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="text-center p-4 bg-white rounded-2xl border border-gray-200"
                                >
                                  <div className="flex items-center justify-center space-x-2 mb-2">
                                    <div
                                      className={`w-4 h-4 rounded-full ${
                                        sizeStock > 10
                                          ? "bg-gray-500"
                                          : sizeStock > 0
                                            ? "bg-gray-500"
                                            : "bg-red-500"
                                      }`}
                                    ></div>
                                    <h5 className="font-extrabold text-lg text-gray-900">
                                      Size {size}
                                    </h5>
                                  </div>
                                  <p
                                    className={`text-sm font-medium ${
                                      sizeStock > 10
                                        ? "text-gray-600"
                                        : sizeStock > 0
                                          ? "text-gray-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {sizeStock === 0
                                      ? "Out of Stock"
                                      : `${sizeStock} units available`}
                                  </p>
                                  {sizeStock > 0 && sizeStock < 10 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Low Stock!
                                    </p>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>

                          {/* Total Stock Summary */}
                          <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-600">
                                Total Stock Across All Sizes:
                              </span>
                              <span className="text-lg font-extrabold text-gray-900">
                                {product.availableSizes.reduce(
                                  (total, size) => {
                                    return (
                                      total + (product.sizeStock?.[size] || 0)
                                    );
                                  },
                                  0
                                )}{" "}
                                units
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-100">
                    <h4 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">
                      Quality Certifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        {
                          icon: Award,
                          title: "OEKO-TEX® Certified",
                          description: "Safe for human health",
                        },
                        {
                          icon: Shield,
                          title: "GOTS Certified",
                          description: "Organic cotton standard",
                        },
                        {
                          icon: Check,
                          title: "ISO 9001",
                          description: "Quality management system",
                        },
                      ].map((cert, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center space-y-3"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto">
                            <cert.icon className="w-8 h-8 text-gray-600" />
                          </div>
                          <h5 className="font-semibold text-gray-900">
                            {cert.title}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {cert.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "reviews" && (
            <motion.div
  key="reviews"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
  className="space-y-6"
>
  {/* Heading */}
  <div className="text-center mb-4 sm:mb-6">
    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900">
      Customer Reviews
    </h3>
    <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-md mx-auto">
      See what our customers are saying
    </p>
  </div>

  {/* Review Statistics */}
  <div className="bg-gray-50 rounded-xl p-3 sm:p-6 border border-gray-200 mb-6">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
      {/* Average Rating */}
      <div className="text-center">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900">
          {reviewStats ? reviewStats.averageRating.toFixed(1) : "0.0"}
        </div>
        <div className="flex justify-center space-x-1 mt-1">
          {[1,2,3,4,5].map(star => (
            <Star
              key={star}
              className={`w-4 sm:w-5 md:w-6 lg:w-7 h-4 sm:h-5 md:h-6 lg:h-7 ${star <= (reviewStats?.averageRating||0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
            />
          ))}
        </div>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">
          {reviewStats?.totalReviews || 0} reviews
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="sm:col-span-2 space-y-1">
        {[5,4,3,2,1].map(rating => {
          const count = reviewStats?.ratingDistribution?.[rating] || 0;
          const perc = reviewStats?.totalReviews ? Math.round((count/reviewStats.totalReviews)*100) : 0;
          return (
            <div key={rating} className="flex items-center space-x-2 text-xs sm:text-sm md:text-base">
              <div className="flex items-center w-12 sm:w-16 md:w-20">
                <span>{rating}</span>
                <Star className="w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 fill-yellow-400 text-yellow-400"/>
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 md:h-4">
                <div className="bg-yellow-400 h-2 sm:h-3 md:h-4 rounded-full transition-all duration-500" style={{width: `${perc}%`}}/>
              </div>
              <span className="w-6 sm:w-8 md:w-12 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>

  {/* Reviews List */}
  <div className="space-y-2">
    {reviews === undefined ? (
      <div className="text-center py-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs sm:text-sm text-gray-600">Loading reviews...</p>
      </div>
    ) : reviews.length > 0 ? (
      reviews.map((r, i) => {
        const daysAgo = Math.ceil(Math.abs(new Date() - new Date(r.createdAt)) / (1000*60*60*24));
        return (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i*0.05 }}
            className="border rounded-lg p-2 sm:p-3 md:p-4 bg-white shadow text-xs sm:text-sm md:text-base"
          >
            <div className="flex justify-between mb-1">
              <p className="font-medium truncate">{r.userName}</p>
              <span className="text-gray-500 text-[8px] sm:text-xs md:text-sm">{daysAgo===1?"1 day ago":`${daysAgo} days ago`}</span>
            </div>
            <div className="flex space-x-0.5 mb-1">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-3 sm:w-4 md:w-5 h-3 sm:h-4 md:h-5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400":"text-gray-300"}`} />
              ))}
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-snug">{r.comment}</p>
            {r.size && <span className="text-[10px] sm:text-xs md:text-sm bg-gray-100 px-1 rounded">Size {r.size}</span>}
          </motion.div>
        )
      })
    ) : (
      <div className="text-center py-4">
        <Star className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-1"/>
        <p className="text-xs sm:text-sm md:text-base text-gray-600">No reviews yet. Be the first!</p>
      </div>
    )}
  </div>

  {/* Add Review Form */}
  {token && me && (!reviews.find(r => r.userId===me._id)) && (
    <motion.div className="mt-4 bg-white/80 p-3 sm:p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm">
      <h4 className="text-sm sm:text-base md:text-lg font-extrabold mb-2 text-center">Write a Review</h4>
      <div className="flex justify-center mb-2 space-x-1">
        {[1,2,3,4,5].map(s => (
          <motion.button key={s} onClick={()=>updateForm("rating", s)} className="p-1 sm:p-1.5">
            <Star className={`w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 ${s <= reviewForm.rating ? "fill-yellow-400 text-yellow-400":"text-gray-300"}`} />
          </motion.button>
        ))}
      </div>
      <input type="text" value={reviewForm.title} onChange={e=>updateForm("title", e.target.value)} placeholder="Title" maxLength={50} className="w-full px-2 py-1 sm:py-2 md:py-2 border rounded text-xs sm:text-sm md:text-base mb-1"/>
      <textarea value={reviewForm.comment} onChange={e=>updateForm("comment", e.target.value)} placeholder="Review" rows={3} maxLength={300} className="w-full px-2 py-1 sm:py-2 md:py-2 border rounded text-xs sm:text-sm md:text-base resize-none mb-1"/>
      <motion.button
        onClick={handleAddReview}
        disabled={!reviewForm.title.trim() || !reviewForm.comment.trim() || isSubmittingReview}
        className="w-full bg-gray-800 text-white rounded text-xs sm:text-sm md:text-base py-1 sm:py-2 md:py-2 flex justify-center items-center gap-1"
      >
        {isSubmittingReview ? <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> : <Check className="w-3 sm:w-4 sm:h-4"/>}
        <span>Submit</span>
      </motion.button>
    </motion.div>
  )}

  {/* Login Required */}
  {!token && (
    <motion.div className="mt-4 border-t pt-4 text-center">
      <Lock className="w-6 sm:w-8 h-6 sm:h-8 text-gray-600 mx-auto mb-1"/>
      <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2">Login to write a review</p>
      <div className="flex justify-center gap-2 text-xs sm:text-sm">
        <Link href="/login"><button className="px-2 py-1 sm:px-3 sm:py-2 bg-gray-900 text-white rounded">Login</button></Link>
        <Link href="/signup"><button className="px-2 py-1 sm:px-3 sm:py-2 border border-gray-900 rounded">Sign Up</button></Link>
      </div>
    </motion.div>
  )}
</motion.div>


              )}

              {activeTab === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4">
                      Shipping & Returns
                    </h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      Everything you need to know about delivery and returns
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        <span>Shipping Information</span>
                      </h4>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Free Shipping
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            On orders over ₹999
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Delivery Time
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            2-3 business days
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Tracking
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            Real-time tracking available
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        <span>Return Policy</span>
                      </h4>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              30 Day Returns
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            Easy returns for any reason
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              Money Back Guarantee
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            100% refund guarantee
                          </p>
                        </div>

                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">
                              No Questions Asked
                            </span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">
                            Simple return process
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100">
                    <h4 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-4 sm:mb-6 text-center">
                      Shipping Zones
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {[
                        { zone: "Local", time: "1-2 days", cost: "Free" },
                        { zone: "Metro Cities", time: "2-3 days", cost: "₹99" },
                        {
                          zone: "Other Cities",
                          time: "3-5 days",
                          cost: "₹149",
                        },
                        {
                          zone: "Remote Areas",
                          time: "5-7 days",
                          cost: "₹199",
                        },
                      ].map((zone, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100"
                        >
                          <h5 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                            {zone.zone}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">
                            {zone.time}
                          </p>
                          <p className="text-base sm:text-lg font-extrabold text-gray-900">
                            {zone.cost}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>

      {/* Mobile-Optimized Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-extrabold font-poppies text-gray-900 mb-2">
              You Might Also Like
            </h3>
            <p className="text-[11px] md:text-smtext-gray-600">
              Discover more products that match your style
            </p>
          </div>

          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-4 pb-4 max-w-full">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0"
                   onClick={() => handleClickProduct(relatedProduct.itemId)}
                >
                  <ProductCard
                    img={relatedProduct.mainImage}
                    name={relatedProduct.name}
                    category={relatedProduct.category}
                    price={relatedProduct.price}
                    productId={relatedProduct.itemId}
                    className="transition-shadow duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile-Optimized Trending Products */}
      {trendingProducts && trendingProducts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 flex items-center justify-center space-x-2">
              {/* <Zap className="w-6 h-6 text-orange-500" /> */}
              <span>Trending in {product?.category}</span>
            </h3>
            <p className="text-[11px] md:text-sm text-gray-600">
              Most viewed products in this category
            </p>
          </div>

          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-4 pb-4 max-w-full">
              {trendingProducts.map((trendingItem, index) => (
                <motion.div
                  key={trendingItem.itemId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 relative"
                   onClick={() => handleClickProduct(trendingItem.itemId)}
                >
                  {/* Trending Badge */}

                  {/* View Count Badge */}

                  <ProductCard
                    img={trendingItem.mainImage}
                    name={trendingItem.name}
                    category={trendingItem.category}
                    price={trendingItem.price}
                    productId={trendingItem.itemId}
                    className=" transition-shadow duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile-Optimized Recently Viewed */}
      {recentlyViewed && recentlyViewed.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 flex items-center justify-center space-x-2">
              <History className="w-6 h-6 text-gray-600" />
              <span>Recently Viewed</span>
            </h3>
            <p className="text-[11px] md:text-sm text-gray-600">
              Continue browsing products you've recently explored
            </p>
          </div>

          <div className="flex justify-center">
            <div className="flex overflow-x-auto gap-4 pb-4 max-w-full">
              {recentlyViewed.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 relative"
                   onClick={() => handleClickProduct(recentlyViewed.itemId)}
                >
                  <ProductCard
                    img={item.productImage}
                    name={item.productName}
                    category={item.productCategory}
                    price={item.productPrice}
                    productId={item.productId}
                    className=" transition-shadow duration-300"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Super Minimal Footer */}

      {/* Personalized "For [user name]" Section */}
      {personalizedProducts && personalizedProducts.length > 0 && me && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12  justify-center"
        >
          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2 flex items-center justify-center space-x-2">
              <Heart className="w-6 h-6 text-gray-500" />
              <span>For {me.name}</span>
            </h3>
            <p className="text-gray-600 text-sm">
              Curated based on your interests: {me.interests?.join(", ")}
            </p>
          </div>

          <div className="flex overflow-x-auto items-center justify-center gap-4 pb-4 max-w-full">
            {personalizedProducts.map((personalizedProduct) => (
              <motion.div
                key={personalizedProduct._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-shrink-0 relative"
 onClick={() => handleClickProduct(personalizedProduct.itemId)}
              >
                <ProductCard
                  img={personalizedProduct.mainImage}
                  name={personalizedProduct.name}
                  category={personalizedProduct.category}
                  price={personalizedProduct.price}
                  productId={personalizedProduct.itemId}
                  className=" transition-shadow duration-300"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
