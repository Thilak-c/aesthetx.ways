"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  CreditCard,
  Clock,
  CheckCircle,
  Truck,
  XCircle
} from "lucide-react";

export default function OrdersPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    } else if (token && !me) {
      setIsLoggedIn(false);
    }
  }, [me, token]);

  // Get user orders
  const userOrders = useQuery(
    api.orders.getUserOrders, 
    me ? { userId: me._id } : "skip"
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50';
      case 'shipped':
        return 'text-purple-600 bg-purple-50';
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <Package className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Login Required</h2>
          <p className="text-sm text-gray-600">Please login to view your orders.</p>
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
              <Package className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
              <span className="hidden sm:inline">My Orders</span>
              <span className="sm:hidden">Orders</span>
            </h1>
            
            <div className="w-16 lg:w-20"></div>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-3 lg:px-8 py-4 lg:py-8">
        {!userOrders || userOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6 py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
            
            {userOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg text-gray-900">
                        Order #{order.orderNumber}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="text-right mt-4 sm:mt-0">
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{order.orderTotal.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
                  <div className="space-y-2">
                                         {order.items.map((item, itemIndex) => (
                       <div key={itemIndex} className="flex justify-between items-center text-sm">
                         <span className="text-gray-600">{item.productName} x {item.quantity}</span>
                         <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Delivery Address:</span>
                      </div>
                      <p className="text-gray-700 ml-6">
                        {order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.pincode}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Payment Status:</span>
                      </div>
                      <p className="text-gray-700 ml-6 capitalize">
                        {order.paymentDetails.status}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 