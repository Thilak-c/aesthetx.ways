'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/products/${id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product')
      }

      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading product details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-8 text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            ← Back to Products
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-xl text-red-600 dark:text-red-400 mb-4">
              {error}
            </div>
            <button
              onClick={fetchProduct}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-8 text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            ← Back to Products
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-xl text-gray-600 dark:text-gray-400 mb-4">
              Product not found
            </div>
            <button
              onClick={() => router.push('/test')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              View All Products
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-8 text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          ← Back to Products
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image Section */}
            <div className="relative h-[400px] md:h-[500px]">
              {product.images && product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-500">No image available</span>
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {product.description}
                </p>
                <div className="mb-6">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${product.price}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-full">
                    Category: {product.category}
                  </span>
                </div>
                <div className="mb-6">
                  <span className="text-gray-600 dark:text-gray-400">
                    Stock: {product.stock} units
                  </span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  onClick={() => {
                    // Add to cart functionality can be added here
                    alert('Add to cart functionality coming soon!')
                  }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 