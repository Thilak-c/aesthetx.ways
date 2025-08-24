"use client"
import { useState, useEffect } from "react";

export default function PayUPayment({ product, onSuccess, onFailure }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [lastPaymentAttempt, setLastPaymentAttempt] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Rate limiting: minimum 60 seconds between payment attempts
  const RATE_LIMIT_MS = 60000; // 60 seconds

  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1000) {
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownTime]);

  const handleBuyNow = () => {
    setShowPaymentForm(true);
  };

  const handlePayment = async (formData) => {
    const now = Date.now();
    const timeSinceLastAttempt = now - lastPaymentAttempt;

    // Check rate limiting
    if (timeSinceLastAttempt < RATE_LIMIT_MS) {
      const remainingTime = Math.ceil((RATE_LIMIT_MS - timeSinceLastAttempt) / 1000);
      alert(`Please wait ${remainingTime} seconds before trying again. PayU requires a 60-second cooldown between payment attempts.`);
      return;
    }

    setIsLoading(true);
    setLastPaymentAttempt(now);
    
    try {
      // Call our secure API to get payment data
      const response = await fetch('/api/payu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: {
            name: product.name,
            price: product.price,
          },
          customer: {
            firstname: formData.firstname,
            email: formData.email,
            phone: formData.phone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          // Rate limit error from server
          setCooldownTime(60000); // 60 seconds cooldown
          throw new Error(errorData.error || 'Too many requests. Please wait 60 seconds.');
        }
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Payment initialization failed');
      }

      // Create a form and submit to PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = result.payuUrl;
      
      Object.keys(result.paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = result.paymentData[key];
        form.appendChild(input);
      });
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      
    } catch (error) {
      console.error('Payment error:', error);
      
      // Handle specific PayU errors
      if (error.message.includes('Too many Requests') || error.message.includes('rate limit') || error.message.includes('wait 60 seconds')) {
        setCooldownTime(60000); // 60 seconds cooldown
        alert('PayU is experiencing high traffic. Please wait 60 seconds before trying again.');
      } else {
        onFailure && onFailure(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPaymentForm) {
    return (
      <button 
        onClick={handleBuyNow}
        className="flex-1 border-2 border-black text-black py-3 px-6 rounded-lg font-semibold hover:bg-black hover:text-white transition-colors duration-200"
      >
        Buy Now
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Complete Payment</h3>
          <button 
            onClick={() => setShowPaymentForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Product: {product.name}</p>
          <p className="text-lg font-bold">₹{product.price}</p>
        </div>

        {/* Rate Limit Warning */}
        {cooldownTime > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              ⚠️ Please wait <span className="font-bold">{Math.ceil(cooldownTime / 1000)}</span> seconds before trying again.
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              PayU requires a 60-second cooldown between payment attempts.
            </p>
          </div>
        )}

        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          handlePayment({
            firstname: formData.get('firstname'),
            email: formData.get('email'),
            phone: formData.get('phone')
          });
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              name="firstname"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Enter your phone number"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPaymentForm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || cooldownTime > 0}
              className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : cooldownTime > 0 ? `Wait ${Math.ceil(cooldownTime / 1000)}s` : 'Pay ₹' + product.price}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
          <p><strong>Note:</strong> PayU has a 60-second cooldown between payment attempts to prevent spam.</p>
        </div>
      </div>
    </div>
  );
} 