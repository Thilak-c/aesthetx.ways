"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ShoppingCart, 
  CreditCard, 
  Truck,
  Shield,
  Check,
  Lock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar
} from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Form states
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/(?:^|; )sessionToken=([^;]+)/);
      setToken(match ? decodeURIComponent(match[1]) : null);
    }
  }, []);

  // Get user data
  const me = useQuery(api.users.meByToken, token ? { token } : "skip");
  
  useEffect(() => {
    if (me) {
      setIsLoggedIn(true);
      console.log('User object:', me); // Debug log
      
      // Pre-fill shipping details with user data if available
      if (me.name) setShippingDetails(prev => ({ ...prev, fullName: me.name }));
      if (me.email) setShippingDetails(prev => ({ ...prev, email: me.email }));
      if (me.phoneNumber) setShippingDetails(prev => ({ ...prev, phone: me.phoneNumber }));
      
      // Handle address fields with proper type checking
      if (me.address && typeof me.address === 'object') {
        // Extract address fields from nested structure
        if (me.address.fullAddress) {
          setShippingDetails(prev => ({ ...prev, address: me.address.fullAddress }));
        }
        if (me.address.city) {
          setShippingDetails(prev => ({ ...prev, city: me.address.city }));
        }
        if (me.address.state) {
          setShippingDetails(prev => ({ ...prev, state: me.address.state }));
        }
        if (me.address.pinCode) {
          setShippingDetails(prev => ({ ...prev, pincode: me.address.pinCode }));
        }
      } else if (me.address && typeof me.address === 'string') {
        // Fallback for string address
        setShippingDetails(prev => ({ ...prev, address: me.address }));
      } else {
        // Clear address fields if no valid data
        clearInvalidAddressData();
      }
      
      if (me.city && typeof me.city === 'string') setShippingDetails(prev => ({ ...prev, city: me.city }));
      if (me.state && typeof me.state === 'string') setShippingDetails(prev => ({ ...prev, state: me.state }));
      if (me.pincode && typeof me.pincode === 'string') setShippingDetails(prev => ({ ...prev, pincode: me.pincode }));
    } else if (token && !me) {
      setIsLoggedIn(false);
    }
  }, [me, token]);

  // Cart data and mutations
  const userCart = useQuery(api.cart.getUserCart, me ? { userId: me._id } : "skip");
  const removeFromCartMutation = useMutation(api.cart.removeFromCart);
  const clearCartMutation = useMutation(api.cart.clearCart);
  const createOrderMutation = useMutation(api.orders.createOrder);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const clearInvalidAddressData = () => {
    setShippingDetails(prev => ({
      ...prev,
      address: '',
      city: '',
      state: '',
      pincode: ''
    }));
  };

  // Razorpay Integration Functions
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(window.Razorpay);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: finalTotal,
          currency: 'INR',
          receipt: `order_${Date.now()}`,
          notes: {
            userId: me._id,
            userEmail: shippingDetails.email,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      return data.order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      showToastMessage('Please fill all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      // Load Razorpay script
      const Razorpay = await loadRazorpayScript();
      if (!Razorpay) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order
      const order = await createRazorpayOrder();
      console.log('Razorpay order created:', order);

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RAMQAuyK0c66gh',
        amount: order.amount,
        currency: order.currency,
        name: 'AesthetX Ways',
        description: `Order for ${shippingDetails.fullName}`,
        order_id: order.id,
        prefill: {
          name: shippingDetails.fullName,
          email: shippingDetails.email,
          contact: shippingDetails.phone,
        },
        notes: {
          address: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} - ${shippingDetails.pincode}`,
        },
        theme: {
          color: '#000000',
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              // Create order in database
              try {
                const orderResult = await createOrderMutation({
                  userId: me._id,
                  items: userCart.items.map(item => ({
                    productId: item.productId,
                    productName: item.productName,
                    productImage: item.productImage,
                    price: item.price,
                    size: item.size,
                    quantity: item.quantity,
                  })),
                  shippingDetails: shippingDetails,
                  paymentDetails: {
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    amount: finalTotal,
                    currency: 'INR',
                    status: 'completed',
                  },
                  orderTotal: finalTotal,
                });

                // Clear the cart after successful order
                await clearCartMutation({ userId: me._id });

                showToastMessage('Payment successful! Order placed successfully.');
                
                // Redirect to success page with order details
                setTimeout(() => {
                  router.push(`/order-success?orderNumber=${orderResult.orderNumber}`);
                }, 2000);
              } catch (dbError) {
                console.error('Database error:', dbError);
                showToastMessage('Order created but database update failed. Please contact support.');
              }
            } else {
              showToastMessage('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            showToastMessage('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      // Open Razorpay checkout
      console.log('Razorpay options:', options);
      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error('Payment error:', error);
      showToastMessage(error.message || 'Failed to process payment');
      setIsProcessing(false);
    }
  };

  const handleInputChange = (field, value) => {
    setShippingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isFormValid = () => {
    return (
      shippingDetails.fullName &&
      shippingDetails.email &&
      shippingDetails.phone &&
      shippingDetails.address &&
      shippingDetails.city &&
      shippingDetails.pincode
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-sm mx-auto"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
          <p className="text-sm text-gray-600">Please login to proceed with checkout.</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Login
          </button>
        </motion.div>
      </div>
    );
  }

  if (!userCart || !userCart.items || userCart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 max-w-sm mx-auto"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Cart is Empty</h2>
          <p className="text-sm text-gray-600">Please add items to your cart before checkout.</p>
          <button 
            onClick={() => router.push('/cart')}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Cart
          </button>
        </motion.div>
      </div>
    );
  }

  const deliveryFee = userCart.totalPrice >= 999 ? 0 : 50;
  const finalTotal = userCart.totalPrice + (userCart.totalItems * 9) + deliveryFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-3 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-20">
            <motion.button
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 text-black lg:w-5 lg:h-5 mr-1.5 lg:mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm hidden text-black sm:inline">Back</span>
            </motion.button>
            
            <h1 className="text-base sm:text-lg lg:text-2xl font-bold text-gray-900 flex justify-center items-center space-x-1.5 lg:space-x-2">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
              <span className="hidden sm:inline">Checkout</span>
              <span className="sm:hidden">Checkout</span>
            </h1>
            
            <div className="w-16 lg:w-20"></div>
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
            className="fixed top-16 lg:top-20 left-1/2 transform -translate-x-1/2 z-50 mx-3 max-w-xs w-full"
          >
            <div className="bg-gray-900 text-white px-3 py-2.5 rounded-lg shadow-2xl border border-gray-700 flex items-center space-x-2">
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
              <span className="font-medium text-sm">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 shadow-sm"
            >
              {/* Progress Steps */}
              {/* Step Navigation */}
              <div className="flex items-center justify-center space-x-8 mb-8">
                <div className={`flex items-center space-x-2 text-black`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold bg-black text-white`}>
                    1
                  </div>
                  <span className="font-medium">Shipping Details</span>
                </div>
              </div>

              {/* Shipping Details */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Shipping Details</h2>
                      <p className="text-gray-600">Where should we deliver your order?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={shippingDetails.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingDetails.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your 10-digit phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.country}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="House/Flat number, Street, Landmark, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your city name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter your state name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        value={shippingDetails.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        placeholder="Enter 6-digit pincode"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Payment Method</h3>
                        <p className="text-gray-600">Choose how you want to pay</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <input
                          type="radio"
                          id="razorpay"
                          name="paymentMethod"
                          value="razorpay"
                          defaultChecked
                          className="w-4 h-4 text-black border-gray-300 focus:ring-black"
                        />
                        <label htmlFor="razorpay" className="flex items-center space-x-3 cursor-pointer">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Credit/Debit Card</span>
                            <p className="text-sm text-gray-500">Pay securely with Razorpay</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4">
                    <Shield className="w-4 h-4" />
                    <span>Your payment is secured by Razorpay</span>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-end pt-6">
                    <button
                      onClick={handlePayment}
                      disabled={!isFormValid() || isProcessing}
                      className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Proceed to Pay</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
            </motion.div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="block lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 font-bold">
                  {/* Items */}
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({userCart.totalItems})</span>
                    <span>₹{(userCart.totalPrice * 1.2).toFixed(2)}</span>
                  </div>
                  
                  {/* Discount */}
                  <div className="flex justify-between text-green-600">
                    <span>Discount </span>
                    <span>- ₹{(userCart.totalPrice * 0.24).toFixed(2)}</span>
                  </div>
                  
                  {/* Coupon */}
                  <div className="flex justify-between text-gray-500">
                    <span>Coupons</span>
                    <span>No coupons available for now</span>
                  </div>
                  
                  {/* Protection Fee */}
                  <div className="flex justify-between text-gray-600">
                    <span>Protection Fee</span>
                    <span>₹{(userCart.totalItems * 9).toFixed(2)}</span>
                  </div>
                  
                  {/* Delivery Fee */}
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className={userCart.totalPrice >= 999 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                      {userCart.totalPrice >= 999 ? 'Free' : '₹50.00'}
                    </span>
                  </div>
                  
                  {/* Shipping */}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>₹{(userCart.totalPrice + (userCart.totalItems * 9) + (userCart.totalPrice >= 999 ? 0 : 50)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Savings Info */}
                  <div className="text-center pt-2">
                    <span className="text-sm text-green-600 font-medium">
                      You saved ₹{(userCart.totalPrice * 0.24).toFixed(2)} on this order!
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
} 