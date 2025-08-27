"use client"
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Home, ShoppingBag, Package, Calendar, MapPin } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  
  const orderNumber = searchParams.get('orderNumber');
  
  // Get order details if order number is available
  const order = useQuery(
    api.orders.getOrderByNumber, 
    orderNumber ? { orderNumber } : "skip"
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="text-center space-y-8"
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto"
          >
            <Check className="w-12 h-12 text-green-600" />
          </motion.div>

          {/* Success Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">Payment Successful!</h1>
            <p className="text-gray-600">
              Your order has been placed successfully. You will receive a confirmation email shortly.
            </p>
            {orderNumber && (
              <p className="text-lg font-semibold text-green-600">
                Order Number: {orderNumber}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Redirecting to home page in {countdown} seconds...
            </p>
          </div>

          {/* Order Details */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-2xl mx-auto"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
              
              <div className="space-y-4 text-left">
                {/* Order Info */}
                <div className="flex items-center space-x-3 text-gray-600">
                  <Package className="w-5 h-5" />
                  <span>Order Status: <span className="font-semibold text-green-600 capitalize">{order.status}</span></span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>Order Date: <span className="font-semibold">{formatDate(order.createdAt)}</span></span>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span>Delivery Address: <span className="font-semibold">{order.shippingDetails.address}, {order.shippingDetails.city}, {order.shippingDetails.state} - {order.shippingDetails.pincode}</span></span>
                </div>
                
                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items ({order.items.length})</h3>
                  <div className="space-y-2">
                                         {order.items.map((item, index) => (
                       <div key={index} className="flex justify-between items-center text-sm">
                         <span className="text-gray-600">{item.productName} x {item.quantity}</span>
                         <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                     ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-green-600">₹{order.orderTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 max-w-md mx-auto">
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </button>
            
            <button
              onClick={() => router.push('/orders')}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Orders</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-gray-200 max-w-md mx-auto">
            <p className="text-xs text-gray-500">
              If you have any questions, please contact our support team.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 