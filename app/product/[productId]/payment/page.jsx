"use client"
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { convex } from "../../../../convexClient";
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Truck,
  Clock,
  MapPin,
  Eye,
  EyeOff
} from "lucide-react";

// Font classes
const fontClasses = {
  poppins: "font-poppins",
  inter: "font-inter"
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { productId } = params;
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  // Fetch product details
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

  // Get size and quantity from URL params or localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const size = urlParams.get('size') || localStorage.getItem('selectedSize');
      const qty = urlParams.get('quantity') || localStorage.getItem('selectedQuantity') || 1;
      
      if (size) setSelectedSize(size);
      if (qty) setQuantity(parseInt(qty));
    }
  }, []);

  const handleInputChange = (field, value) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const validateForm = () => {
    const required = ['cardNumber', 'cardHolder', 'expiryMonth', 'expiryYear', 'cvv', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    const missing = required.filter(field => !paymentForm[field].trim());
    
    if (missing.length > 0) {
      setPaymentError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }
    
    if (paymentForm.cardNumber.replace(/\s/g, '').length !== 16) {
      setPaymentError('Please enter a valid 16-digit card number');
      return false;
    }
    
    if (paymentForm.cvv.length !== 3 && paymentForm.cvv.length !== 4) {
      setPaymentError('Please enter a valid CVV');
      return false;
    }
    
    if (!paymentForm.email.includes('@')) {
      setPaymentError('Please enter a valid email address');
      return false;
    }
    
    if (paymentForm.phone.length < 10) {
      setPaymentError('Please enter a valid phone number');
      return false;
    }
    
    if (paymentForm.pincode.length !== 6) {
      setPaymentError('Please enter a valid 6-digit pincode');
      return false;
    }
    
    return true;
  };

  const handlePayment = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    setPaymentError(null);
    
    try {
      // Simulate PayU payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In real implementation, you would:
      // 1. Create PayU transaction
      // 2. Redirect to PayU payment gateway
      // 3. Handle payment response
      
      setPaymentSuccess(true);
      
      // Redirect to success page after 3 seconds
      setTimeout(() => {
        router.push(`/product/${productId}/success?orderId=${Date.now()}`);
      }, 3000);
      
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
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
          <p className="text-gray-600 text-lg font-medium">Loading payment details...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Something went wrong</h2>
          <p className="text-red-600 text-lg">{error || "Product not found"}</p>
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

  const totalAmount = product.price * quantity;
  const tax = totalAmount * 0.18; // 18% GST
  const shipping = totalAmount > 999 ? 0 : 99;
  const finalAmount = totalAmount + tax + shipping;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Payment Page</h1>
        <p className="text-center text-gray-600">PayU integration coming soon...</p>
      </div>
    </div>
  );
} 