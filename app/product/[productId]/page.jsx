"use client"
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { convex } from "../../../convexClient";
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
  Lock
} from "lucide-react";

// Font classes
const fontClasses = {
  poppins: "font-poppins",
  inter: "font-inter"
};

export default function ProductPage() {
  const [token, setToken] = useState(null);

  const params = useParams();
  const router = useRouter();
  const { productId } = params;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('reviews');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Add login state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    size: '',
    recommend: true
  });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);

  // Update login state when me data changes
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  
  useEffect(() => {
    if (me) {
      setIsLoggedIn(true);
    } else if (token && !me) {
      setIsLoggedIn(false);
    }
  }, [me, token]);

  // Reviews data
  const reviews = useQuery(api.reviews.getProductReviews, productId ? { productId } : "skip");
  const reviewStats = useQuery(api.reviews.getProductReviewStats, productId ? { productId } : "skip");
  
  // Mutations
  const addReviewMutation = useMutation(api.reviews.addReview);
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const result = await convex.query("products:getProductById", { productId });
        if (result) {
          setProduct(result);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = () => {
    // Add to cart functionality
    console.log('Added to cart:', {
      product: product.name,
      size: selectedSize,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity
    });
  };

  const handleBuyNow = () => {
    // Buy now functionality
    console.log('Buy now:', {
      product: product.name,
      size: selectedSize,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity
    });
  };

  const handleAddReview = async () => {
    console.log('handleAddReview called');
    console.log('isLoggedIn:', isLoggedIn);
    console.log('me:', me);
    console.log('token:', token);
    console.log('reviewForm:', reviewForm);
    
    if (!isLoggedIn || !me) {
      console.log('Early return - not logged in or no user data');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      // Submit review to Convex
      await addReviewMutation({
        productId: productId,
        userId: me._id,
        userName: me.name || 'Anonymous',
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        size: reviewForm.size || '',
        recommend: reviewForm.recommend,
      });
      
      // Reset form
      setReviewForm({
        rating: 5,
        title: '',
        comment: '',
        size: '',
        recommend: true
      });
      
      // Show success message
      setReviewSubmitted(true);
      setTimeout(() => setReviewSubmitted(false), 5000); // Hide after 5 seconds
      
      // Show toast
      setToastMessage('Review submitted successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      console.log('Review submitted successfully');
    } catch (error) {
      console.error('Error submitting review:', error);
      // Show error toast
      setToastMessage(error.message || 'Failed to submit review');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your product...</p>
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
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Oops! Something went wrong</h2>
          <p className="text-red-600 text-lg">{error}</p>
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
          <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
          <p className="text-gray-600 text-lg">The product you&apos;re looking for doesn&apos;t exist.</p>
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
    { id: 'reviews', label: 'Customer Reviews', icon: Star, description: 'What others are saying' },
    { id: 'details', label: 'Product Details', icon: Check, description: 'Learn more about this product' },
    { id: 'specifications', label: 'Specifications', icon: Shield, description: 'Technical details and materials' },
    { id: 'shipping', label: 'Shipping & Returns', icon: Truck, description: 'Delivery and return policy' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className={`border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm ${fontClasses.poppins}`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 mr-1.5 sm:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-xs sm:text-sm lg:text-base hidden sm:inline">Back to Products</span>
              <span className="font-medium text-xs sm:hidden">Back</span>
            </motion.button>
            
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: product.name,
                      text: `Check out this amazing ${product.name} - ${product.category}`,
                      url: window.location.href
                    });
                  } else {
                    // Fallback for browsers that don't support native sharing
                    navigator.clipboard.writeText(window.location.href);
                    setToastMessage('Link copied to clipboard!');
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 3000);
                  }
                }}
                className="p-1.5 sm:p-2 lg:p-3 text-black hover:bg-gray-100 rounded-lg sm:rounded-xl transition-all duration-200 group relative"
                title="Share this sustainable product and support ethical fashion"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform" />
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-1.5 sm:p-2 lg:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                  isWishlisted 
                    ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-16 sm:top-20 lg:top-24 left-1/2 transform -translate-x-1/2 z-50 mx-3 sm:mx-4 lg:mx-0 max-w-xs sm:max-w-sm lg:max-w-md w-full ${fontClasses.poppins}`}
          >
            <div className="bg-gray-900 text-white px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl border border-gray-700 flex items-center space-x-2 sm:space-x-3">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-400 flex-shrink-0" />
              <span className="font-medium text-xs sm:text-sm lg:text-base">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={`max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-12 ${fontClasses.poppins}`}
      >
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-16">
          {/* Enhanced Product Images */}
          <motion.div variants={itemVariants} className="space-y-3 sm:space-y-4 lg:space-y-6">
            <div className="relative group">
              <div className="relative aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl">
                <Image
                  src={product.mainImage}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                
                {/* Quick View Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  className="absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 p-1.5 sm:p-2 lg:p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-700" />
                </motion.button>
              </div>
            </div>
            
            {/* Enhanced Thumbnail Images */}
            <div className="flex space-x-2 sm:space-x-3 lg:space-x-4 overflow-x-auto pb-2">
              {[product.mainImage, product.mainImage, product.mainImage, product.mainImage].map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-lg flex-shrink-0 ${
                    selectedImage === index 
                      ? 'border-gray-900 ring-4 ring-gray-900/20' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover object-center"
                  />
                  
                  {/* Selection Indicator */}
                  {selectedImage === index && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-black/20 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Enhanced Product Info */}
          <motion.div variants={itemVariants} className={`space-y-4 sm:space-y-6 lg:space-y-8 ${fontClasses.poppins}`}>
            {/* Product Header */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
                  <motion.span 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold rounded-full border border-gray-200 w-fit"
                  >
                    {product.category}
                  </motion.span>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center space-x-1"
                  >
                     {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${
                                star <= (reviewStats?.averageRating || 0) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                    <span className="text-xs sm:text-sm text-gray-600 ml-1.5 sm:ml-2 font-medium">({reviews.length} reviews)</span>
                  </motion.div>
                </div>
                
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-500"
                >
                  <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                  <span>In Stock</span>
                </motion.div>
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl sm:text-2xl lg:text-3xl xl:text-3xl font-bold text-gray-900 leading-tight"
              >
                {product.name}
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6"
              >
                <div className="flex items-baseline space-x-1.5 sm:space-x-2 lg:space-x-3">
                  <span className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900"> <span className="text-green-800">₹</span>{product.price}</span>
                  <span className="text-base sm:text-lg lg:text-xl text-gray-400 line-through">₹{Math.round(product.price * 1.2)}</span>
                </div>
              </motion.div>
            </div>

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`space-y-2.5 sm:space-y-3 lg:space-y-4 ${fontClasses.poppins}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1.5 sm:space-y-0">
                  <label className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Select Size</label>
                  
                </div>
                
                <div className="flex flex-wrap gap-1.5 sm:gap-2 lg:gap-3">
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
                        className={`relative px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-md sm:rounded-lg lg:rounded-xl border-2 font-medium transition-all duration-200 text-xs sm:text-sm lg:text-base ${
                          isSelected
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : isOutOfStock
                              ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <span>{size}</span>
                        {sizeStock > 0 && sizeStock < 10 && (
                          <div className="absolute -top-0.5 sm:-top-1 lg:-top-1 -right-0.5 sm:-right-1 lg:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-3 lg:h-3 bg-gray-500 rounded-full"></div>
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
                
                {/* Size Selection Warning */}
                {!selectedSize && product.availableSizes.length > 0 && (
                  <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                    <span>Please select a size to continue</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Enhanced Quantity Selector */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`space-y-2.5 sm:space-y-3 lg:space-y-4 ${fontClasses.poppins}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1.5 sm:space-y-0">
                <label className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">Quantity</label>
              </div>
              
              <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 sm:p-2 lg:p-3 border-2 border-gray-200 rounded-md sm:rounded-lg lg:rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </motion.button>
                
                <span className="w-14 sm:w-16 lg:w-20 text-center text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {quantity}
                </span>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={selectedSize && product.sizeStock?.[selectedSize] !== undefined && quantity >= product.sizeStock[selectedSize]}
                  className="p-1.5 sm:p-2 lg:p-3 border-2 border-gray-200 rounded-md sm:rounded-lg lg:rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                </motion.button>
              </div>
              
              {/* Stock Warnings for Selected Size */}
              {selectedSize && product.sizeStock?.[selectedSize] !== undefined && (
                <>
                  {product.sizeStock[selectedSize] === 0 && (
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-red-600 bg-red-50 p-2 sm:p-3 rounded-lg border border-red-200">
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span>Size {selectedSize} is currently out of stock</span>
                    </div>
                  )}
                  
                  {product.sizeStock[selectedSize] > 0 && product.sizeStock[selectedSize] < 10 && (
                    <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4" />
                      <span>Only few units left in size {selectedSize}!</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-gray-500" />
                <span>Free shipping on orders over ₹999</span>
              </div>
            </motion.div>

            {/* Enhanced Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`space-y-2.5 sm:space-y-3 lg:space-y-4 ${fontClasses.poppins}`}
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={
                  !selectedSize || 
                  (selectedSize && product.sizeStock?.[selectedSize] === 0) ||
                  (product.availableSizes && product.availableSizes.length > 0 && !selectedSize)
                }
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg hover:from-gray-800 hover:to-gray-700 transition-all duration-300 flex items-center justify-center space-x-2 sm:space-x-2 lg:space-x-3 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-gray-900 disabled:hover:to-gray-800"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                <span className="text-xs sm:text-sm lg:text-base">
                  {!selectedSize && product.availableSizes && product.availableSizes.length > 0
                    ? 'Select Size to Add to Cart'
                    : selectedSize && product.sizeStock?.[selectedSize] === 0
                      ? `Size ${selectedSize} Out of Stock`
                      : `Add to Cart - ₹${product.price * quantity}`
                  }
                </span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBuyNow}
                disabled={
                  !selectedSize || 
                  (selectedSize && product.sizeStock?.[selectedSize] === 0) ||
                  (product.availableSizes && product.availableSizes.length > 0 && !selectedSize)
                }
                className="w-full bg-white text-gray-900 py-3 sm:py-4 lg:py-5 px-3 sm:px-4 lg:px-6 rounded-lg sm:rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg border-3 border-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-900"
              >
                <span className="text-xs sm:text-sm lg:text-base">
                  {!selectedSize && product.availableSizes && product.availableSizes.length > 0
                    ? 'Select Size to Buy Now'
                    : selectedSize && product.sizeStock?.[selectedSize] === 0
                      ? `Size ${selectedSize} Out of Stock`
                      : `Buy Now - ₹${product.price * quantity}`
                  }
                </span>
              </motion.button>
            </motion.div>

            {/* Enhanced Features */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 pt-4 sm:pt-6 lg:pt-8 border-t border-gray-200 ${fontClasses.poppins}`}
            >
              <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4 p-2.5 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="p-1.5 sm:p-2 lg:p-3 bg-gray-100 rounded-md sm:rounded-lg lg:rounded-xl">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Free Shipping</p>
                  <p className="text-xs sm:text-sm text-gray-600">On orders over ₹999</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4 p-2.5 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="p-1.5 sm:p-2 lg:p-3 bg-gray-100 rounded-md sm:rounded-lg lg:rounded-xl">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Easy Returns</p>
                  <p className="text-xs sm:text-sm text-gray-600">30 day return policy</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4 p-2.5 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="p-1.5 sm:p-2 lg:p-3 bg-gray-100 rounded-md sm:rounded-lg lg:rounded-xl">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Secure Payment</p>
                  <p className="text-xs sm:text-sm text-gray-600">100% secure checkout</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2.5 sm:space-x-3 lg:space-x-4 p-2.5 sm:p-3 lg:p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg sm:rounded-xl lg:rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200">
                <div className="p-1.5 sm:p-2 lg:p-3 bg-gray-100 rounded-md sm:rounded-lg lg:rounded-xl">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base">Premium Quality</p>
                  <p className="text-xs sm:text-sm text-gray-600">Certified materials</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Enhanced Product Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className={`mt-8 sm:mt-12 lg:mt-16 xl:mt-20 ${fontClasses.poppins}`}
        >
          {/* Enhanced Tab Navigation */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="flex space-x-3 sm:space-x-4 lg:space-x-6 xl:space-x-8 min-w-max px-3 sm:px-4 lg:px-0">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center space-y-1 sm:space-y-2 py-3 sm:py-4 lg:py-6 px-1.5 sm:px-2 lg:px-4 border-b-2 font-semibold text-xs sm:text-sm transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    <span>{tab.label}</span>
                    <span className="text-xs font-normal text-gray-400 hidden sm:block">{tab.description}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>

          {/* Enhanced Tab Content */}
          <div className="py-6 sm:py-8 lg:py-12">
            <AnimatePresence mode="wait">
              {activeTab === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div className="text-center mb-12">
                    <h3 className="text-4xl font-bold text-gray-900 mb-4">Product Details</h3>
                                      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Discover the exceptional quality and craftsmanship that makes this product truly special
                  </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                        <Check className="w-6 h-6 text-gray-500" />
                        <span>Key Features</span>
                      </h4>
                      <ul className="space-y-4">
                        {[
                          'Premium quality materials sourced from the finest suppliers',
                          'Expert craftsmanship with attention to every detail',
                          'Comfortable fit designed for all-day wear',
                          'Versatile design perfect for any occasion',
                          'Sustainable and eco-friendly production methods'
                        ].map((feature, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Check className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="space-y-6">
                      <h4 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                        <Shield className="w-6 h-6 text-gray-500" />
                        <span>Care Instructions</span>
                      </h4>
                      <ul className="space-y-4">
                        {[
                          'Machine wash cold with similar colors',
                          'Tumble dry low or air dry for best results',
                          'Iron on low heat if needed',
                          'Do not bleach or use harsh detergents',
                          'Store in a cool, dry place'
                        ].map((care, index) => (
                          <motion.li 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-3"
                          >
                            <Check className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{care}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-100">
                    <h4 className="text-2xl font-bold text-gray-900 mb-4 text-center">Why Choose This Product?</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { icon: Award, title: 'Premium Quality', description: 'Made with the finest materials' },
                        { icon: Zap, title: 'Fast Delivery', description: 'Get it delivered in 2-3 days' },
                        { icon: Shield, title: 'Warranty', description: '1 year manufacturer warranty' }
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
                          <h5 className="font-semibold text-gray-900">{item.title}</h5>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Technical Specifications</h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      Detailed technical information and material specifications
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900">Material & Construction</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: 'Material', value: '100% Premium Cotton' },
                          { label: 'Weight', value: '180 GSM (Lightweight)' },
                          { label: 'Weave', value: 'Single Jersey' },
                          { label: 'Construction', value: '20s Single Yarn' },
                          { label: 'Finish', value: 'Soft Touch' }
                        ].map((spec, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-4 border-b border-gray-100 space-y-1 sm:space-y-0"
                          >
                            <span className="text-sm sm:text-base text-gray-600 font-medium">{spec.label}</span>
                            <span className="text-sm sm:text-base font-semibold text-gray-900">{spec.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900">Fit & Sizing</h4>
                      <div className="space-y-3 sm:space-y-4">
                        {[
                          { label: 'Fit Type', value: 'Regular Fit' },
                          { label: 'Sleeve Length', value: 'Full Sleeve' },
                          { label: 'Neck Style', value: 'Round Neck' },
                          { label: 'Hem Style', value: 'Straight Hem' },
                          { label: 'Care Instructions', value: 'Machine Washable' }
                        ].map((spec, index) => (
                          <motion.div 
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col sm:flex-row sm:justify-between py-3 sm:py-4 border-b border-gray-100 space-y-1 sm:space-y-0"
                          >
                            <span className="text-sm sm:text-base text-gray-600 font-medium">{spec.label}</span>
                            <span className="text-sm sm:text-base font-semibold text-gray-900">{spec.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Size-Based Inventory Information */}
                  {product.availableSizes && product.availableSizes.length > 0 && (
                    <div className="mt-12 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-3xl p-8 border border-gray-100">
                      <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Size-Based Inventory</h4>
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
                                  <div className={`w-4 h-4 rounded-full ${
                                    sizeStock > 10 
                                      ? 'bg-gray-500' 
                                      : sizeStock > 0 
                                        ? 'bg-gray-500' 
                                        : 'bg-red-500'
                                  }`}></div>
                                  <h5 className="font-bold text-lg text-gray-900">Size {size}</h5>
                                </div>
                                <p className={`text-sm font-medium ${
                                  sizeStock > 10 
                                    ? 'text-gray-600' 
                                    : sizeStock > 0 
                                      ? 'text-gray-600' 
                                      : 'text-red-600'
                                }`}>
                                  {sizeStock === 0 
                                    ? 'Out of Stock' 
                                    : `${sizeStock} units available`
                                  }
                                </p>
                                {sizeStock > 0 && sizeStock < 10 && (
                                  <p className="text-xs text-gray-500 mt-1">Low Stock!</p>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                        
                        {/* Total Stock Summary */}
                        <div className="mt-6 p-4 bg-white rounded-2xl border border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600">Total Stock Across All Sizes:</span>
                            <span className="text-lg font-bold text-gray-900">
                              {product.availableSizes.reduce((total, size) => {
                                return total + (product.sizeStock?.[size] || 0);
                              }, 0)} units
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-100">
                    <h4 className="text-2xl font-bold text-gray-900 mb-6 text-center">Quality Certifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { icon: Award, title: 'OEKO-TEX® Certified', description: 'Safe for human health' },
                        { icon: Shield, title: 'GOTS Certified', description: 'Organic cotton standard' },
                        { icon: Check, title: 'ISO 9001', description: 'Quality management system' }
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
                          <h5 className="font-semibold text-gray-900">{cert.title}</h5>
                          <p className="text-sm text-gray-600">{cert.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Customer Reviews</h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      See what our customers are saying about this product
                    </p>
                  </div>
                  
                  {/* Review Statistics */}
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 mb-8 sm:mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Overall Rating */}
                      <div className="text-center space-y-3 sm:space-y-4">
                        <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900">
                          {reviewStats ? reviewStats.averageRating.toFixed(1) : '0.0'}
                        </div>
                        <div className="flex items-center justify-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${
                                star <= (reviewStats?.averageRating || 0) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-300'
                              }`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm sm:text-base text-gray-600">
                          Based on {reviewStats?.totalReviews || 0} reviews
                        </p>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="lg:col-span-2 space-y-2 sm:space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const count = reviewStats?.ratingDistribution?.[rating] || 0;
                          const percentage = reviewStats?.totalReviews 
                            ? Math.round((count / reviewStats.totalReviews) * 100) 
                            : 0;
                          
                          return (
                            <div key={rating} className="flex items-center space-x-2 sm:space-x-3">
                              <div className="flex items-center space-x-1 w-10 sm:w-12 lg:w-16">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">{rating}</span>
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                              </div>
                              <div className="flex-1 bg-gray-200 rounded-full h-1.5 sm:h-2">
                                <div 
                                  className="bg-yellow-400 h-1.5 sm:h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 lg:w-12 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 sm:space-y-8">
                    {reviews === undefined ? (
                      // Loading state
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm sm:text-base text-gray-600">Loading reviews...</p>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      reviews.map((review, index) => {
                        // Format date
                        const reviewDate = new Date(review.createdAt);
                        const now = new Date();
                        const diffTime = Math.abs(now - reviewDate);
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const dateText = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
                        
                        return (
                          <motion.div
                          key={review._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                          className="border border-gray-200 dark:border-gray-800 rounded-2xl p-5 sm:p-7 lg:p-8 
                                     bg-white dark:bg-gray-900 shadow-sm hover:shadow-md 
                                     hover:scale-[1.01] transition-all duration-300"
                        >
                          {/* Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:mb-5">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 
                                              dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                                <span className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200">
                                  {review.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                                    {review.userName}
                                  </p>
                                  {review.verified && (
                                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" strokeWidth={3} />
                                  )}
                                </div>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{dateText}</p>
                              </div>
                            </div>
                        
                            {/* Stars */}
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <motion.div
                                  key={star}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: index * 0.1 + star * 0.05 }}
                                >
                                  <Star
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      star <= review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300 dark:text-gray-600"
                                    }`}
                                  />
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        
                          {/* Content */}
                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm sm:text-base">
                              {review.title}
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                              {review.comment}
                            </p>
                          </div>
                        
                          {/* Footer */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3">
                              {review.recommend && (
                                <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 
                                                 bg-green-50 dark:bg-green-900/30 
                                                 px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                                  <Check className="w-3.5 h-3.5" />
                                  Recommends this product
                                </span>
                              )}
                        
                              <button
                                className="flex items-center gap-1.5 text-xs sm:text-sm 
                                           text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 
                                           px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                Helpful ({review.helpful})
                              </button>
                            </div>
                        
                            {review.size && (
                              <span className="text-xs text-center sm:text-sm text-gray-600 dark:text-gray-300 
                                               bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
                                Size {review.size}
                              </span>
                            )}
                          </div>
                        </motion.div>
                        
                        );
                      })
                    ) : (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                        </div>
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h4>
                        <p className="text-sm sm:text-base text-gray-600">Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Add Review Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 border-t border-gray-200 pt-12"
                  >
                    <div className="text-center mb-8">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Write a Review</h4>
                      <p className="text-gray-600">Share your experience with this product</p>
                    </div>
                    
                    {token && me ? (
                      // Check if user already reviewed this product
                      reviews && reviews.find(review => review.userId === me._id) ? (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-blue-600" />
                          </div>
                          <h5 className="text-lg font-semibold text-blue-900 mb-2">Review Submitted</h5>
                          <p className="text-blue-700 mb-6">You have already reviewed this product. Thank you for your feedback!</p>
                          <button 
                            onClick={() => {
                              // Show user's existing review
                              const userReview = reviews.find(review => review.userId === me._id);
                              if (userReview) {
                                setToastMessage(`Your review: ${userReview.title}`);
                                setShowToast(true);
                                setTimeout(() => setShowToast(false), 3000);
                              }
                            }}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                          >
                            View My Review
                          </button>
                        </div>
                      ) : (
                      <>
                        {/* Success Message */}
                        {reviewSubmitted && (
                          <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl text-center"
                          >
                            <div className="flex items-center justify-center space-x-2 text-green-700">
                              <Check className="w-5 h-5" />
                              <span className="font-semibold">Review submitted successfully! Thank you for your feedback.</span>
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Review Form for Logged In Users */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-200"
                        >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* Rating and Title */}
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Overall Rating *
                              </label>
                              <div className="flex items-center space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <motion.button
                                    key={star}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                  >
                                    <Star 
                                      className={`w-8 h-8 ${
                                        star <= reviewForm.rating 
                                          ? 'fill-yellow-400 text-yellow-400' 
                                          : 'text-gray-300'
                                      }`} 
                                    />
                                  </motion.button>
                                ))}
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {reviewForm.rating === 5 && 'Excellent!'}
                                {reviewForm.rating === 4 && 'Very Good!'}
                                {reviewForm.rating === 3 && 'Good!'}
                                {reviewForm.rating === 2 && 'Fair!'}
                                {reviewForm.rating === 1 && 'Poor!'}
                              </p>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Review Title *
                              </label>
                              <input
                                type="text"
                                value={reviewForm.title}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Summarize your experience in a few words"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                                maxLength={100}
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {reviewForm.title.length}/100 characters
                              </p>
                            </div>
                          </div>
                          
                          {/* Size and Recommendation */}
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Size Purchased
                              </label>
                              <select
                                value={reviewForm.size}
                                onChange={(e) => setReviewForm(prev => ({ ...prev, size: e.target.value }))}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                              >
                                <option value="">Select size</option>
                                {product.availableSizes?.map((size) => (
                                  <option key={size} value={size}>Size {size}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Would you recommend this product?
                              </label>
                              <div className="flex items-center space-x-6">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={reviewForm.recommend}
                                    onChange={() => setReviewForm(prev => ({ ...prev, recommend: true }))}
                                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                                  />
                                  <span className="text-gray-700">Yes, I recommend it</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    checked={!reviewForm.recommend}
                                    onChange={() => setReviewForm(prev => ({ ...prev, recommend: false }))}
                                    className="w-4 h-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                                  />
                                  <span className="text-gray-700">No, I don&apos;t recommend it</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comment */}
                        <div className="mt-6">
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Your Review *
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                            placeholder="Share your detailed experience with this product. What did you like? What could be improved?"
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors resize-none"
                            maxLength={1000}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {reviewForm.comment.length}/1000 characters
                          </p>
                        </div>
                        
                        {/* Debug Info */}
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
                          <div className="font-semibold mb-2">Debug Information:</div>
                          <div>isLoggedIn: {isLoggedIn.toString()}</div>
                          <div>me exists: {me ? 'Yes' : 'No'}</div>
                          <div>title length: {reviewForm.title.length}</div>
                          <div>comment length: {reviewForm.comment.length}</div>
                          <div>button disabled: {(!reviewForm.title.trim() || !reviewForm.comment.trim() || isSubmittingReview).toString()}</div>
                        </div>
                        
                        {/* Test Button */}
                        <div className="mt-4">
                          <button 
                            onClick={() => {
                              alert('Test button works!');
                              console.log('Test button clicked');
                            }}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm"
                          >
                            Test Button (Click me first)
                          </button>
                        </div>
                        
                        {/* Submit Button */}
                        <div className="mt-8 flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-gray-500" />
                            <span>Your review will be visible to other customers</span>
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              alert('Button clicked!');
                              handleAddReview();
                            }}
                            disabled={!reviewForm.title.trim() || !reviewForm.comment.trim() || isSubmittingReview}
                            className="px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            {isSubmittingReview ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Submitting...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Submit Review</span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                      )
                    ) : (
                      /* Login Required Message for Non-Logged In Users */
                      <div className="bg-gradient-to-r from-gray-50 to-white rounded-3xl p-8 border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Lock className="w-8 h-8 text-gray-600" />
                        </div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-2">Login Required</h5>
                        <p className="text-gray-600 mb-6">You need to be logged in to write a review</p>
                        <div className="flex items-center justify-center space-x-4">
                          <Link href="/login">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLoggedIn(true)}
                            href="/login"
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                          >
                            Login
                          </motion.button>
                          </Link>

                          <Link href="/signup">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLoggedIn(true)}
                            href="/signup"
                            className="px-6 py-3 bg-white text-gray-900 rounded-xl font-medium border-2 border-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
                          >
                            Sign Up
                          </motion.button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="text-center mb-8 sm:mb-12">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Shipping & Returns</h3>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
                      Everything you need to know about delivery and returns
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                        <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        <span>Shipping Information</span>
                      </h4>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">Free Shipping</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">On orders over ₹999</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">Delivery Time</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">2-3 business days</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">Tracking</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">Real-time tracking available</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center space-x-2 sm:space-x-3">
                        <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                        <span>Return Policy</span>
                      </h4>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">30 Day Returns</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">Easy returns for any reason</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">Money Back Guarantee</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">100% refund guarantee</p>
                        </div>
                        
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100">
                          <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            <span className="font-semibold text-gray-900 text-sm sm:text-base">No Questions Asked</span>
                          </div>
                          <p className="text-gray-700 text-xs sm:text-sm">Simple return process</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-100">
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">Shipping Zones</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {[
                        { zone: 'Local', time: '1-2 days', cost: 'Free' },
                        { zone: 'Metro Cities', time: '2-3 days', cost: '₹99' },
                        { zone: 'Other Cities', time: '3-5 days', cost: '₹149' },
                        { zone: 'Remote Areas', time: '5-7 days', cost: '₹199' }
                      ].map((zone, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-center p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100"
                        >
                          <h5 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{zone.zone}</h5>
                          <p className="text-xs sm:text-sm text-gray-600 mb-1">{zone.time}</p>
                          <p className="text-base sm:text-lg font-bold text-gray-900">{zone.cost}</p>
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
    </div>
  );
} 