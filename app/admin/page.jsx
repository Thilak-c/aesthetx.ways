'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiPackage, FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, FiUpload, FiX } from 'react-icons/fi'
import Image from 'next/image'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    images: [],
    model3D: '',
    stock: '',
  })
  const [editingProduct, setEditingProduct] = useState(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts()
    } else if (activeTab === 'orders') {
      fetchOrders()
    }
  }, [activeTab])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Verify token by making a request to a protected endpoint
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        localStorage.removeItem('token')
        router.push('/login')
        return
      }

      const data = await response.json()
      if (data.role !== 'admin') {
        router.push('/')
        return
      }

      setIsAuthenticated(true)
      fetchOrders()
      fetchProducts()
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch orders')
      }

      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert(error.message || 'Failed to fetch orders. Please try again.')
    }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const uploadPromises = files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`)
        }

        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 5MB`)
        }

        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        })

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token')
            router.push('/login')
            return
          }
          const error = await response.json()
          throw new Error(error.message || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [...editingProduct.images, ...uploadedUrls],
        })
      } else {
        setNewProduct({
          ...newProduct,
          images: [...newProduct.images, ...uploadedUrls],
        })
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      alert(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((_, i) => i !== index),
      })
    } else {
      setNewProduct({
        ...newProduct,
        images: newProduct.images.filter((_, i) => i !== index),
      })
    }
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Validate required fields
      if (!newProduct.name || !newProduct.description || !newProduct.price || !newProduct.category || !newProduct.stock || !newProduct.model3D) {
        alert('Please fill in all required fields')
        return
      }

      // Validate images
      if (newProduct.images.length === 0) {
        alert('Please upload at least one product image')
        return
      }

      // Validate price and stock are positive numbers
      if (newProduct.price <= 0 || newProduct.stock < 0) {
        alert('Price must be greater than 0 and stock must be non-negative')
        return
      }

      // Validate 3D model URL
      try {
        new URL(newProduct.model3D)
      } catch (error) {
        alert('Please enter a valid URL for the 3D model')
        return
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock)
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to add product')
      }

      const data = await response.json()
      alert('Product added successfully!')
      await fetchProducts()
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        images: [],
        model3D: '',
        stock: '',
      })
      setActiveTab('products')
    } catch (error) {
      console.error('Error adding product:', error)
      alert(error.message || 'Failed to add product. Please try again.')
    }
  }

  const handleProductUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      // Validate required fields
      if (!editingProduct.name || !editingProduct.description || !editingProduct.price || !editingProduct.category || !editingProduct.stock || !editingProduct.model3D) {
        alert('Please fill in all required fields')
        return
      }

      // Validate images
      if (editingProduct.images.length === 0) {
        alert('Please upload at least one product image')
        return
      }

      // Validate price and stock are positive numbers
      if (editingProduct.price <= 0 || editingProduct.stock < 0) {
        alert('Price must be greater than 0 and stock must be non-negative')
        return
      }

      // Validate 3D model URL
      try {
        new URL(editingProduct.model3D)
      } catch (error) {
        alert('Please enter a valid URL for the 3D model')
        return
      }

      const response = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingProduct,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock)
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to update product')
      }

      alert('Product updated successfully!')
      await fetchProducts()
      setEditingProduct(null)
      setActiveTab('products')
    } catch (error) {
      console.error('Error updating product:', error)
      alert(error.message || 'Failed to update product. Please try again.')
    }
  }

  const handleProductDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete product')
      }

      alert('Product deleted successfully!')
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert(error.message || 'Failed to delete product. Please try again.')
    }
  }

  const toggleProductVisibility = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVisible: currentStatus }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to update product visibility')
      }

      const data = await response.json()
      console.log('Visibility toggle response:', data) // Debug log
      
      // Update the local state immediately
      setProducts(products.map(product => 
        product._id === productId 
          ? { ...product, isVisible: !currentStatus }
          : product
      ))

      alert(data.message)
    } catch (error) {
      console.error('Error toggling product visibility:', error)
      alert(error.message || 'Failed to update product visibility. Please try again.')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct({
      ...product,
      price: product.price.toString(),
      stock: product.stock.toString()
    })
    setActiveTab('add-product')
  }

  const handleAddProduct = () => {
    setActiveTab('add-product')
    setNewProduct({
      name: '',
      description: '',
      price: '',
      category: '',
      images: [],
      model3D: '',
      stock: '',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Product
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'orders'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={handleAddProduct}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'add-product'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Add Product
            </button>
          </div>

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="border dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Order #{order._id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className={`border dark:border-gray-700 rounded-lg p-4 ${
                    !product.isVisible ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      {product.images[0] && (
                        <div className="relative w-16 h-16">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          ${product.price}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Stock: {product.stock}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Category: {product.category}
                        </p>
                        <p className={`text-sm font-medium ${
                          product.isVisible 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          Status: {product.isVisible ? 'Visible' : 'Hidden'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Product"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleProductDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete Product"
                      >
                        <FiTrash2 />
                      </button>
                      <button
                        onClick={() => toggleProductVisibility(product._id, product.isVisible)}
                        className={`p-2 rounded ${
                          product.isVisible
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={product.isVisible ? "Hide Product" : "Show Product"}
                      >
                        {product.isVisible ? <FiEye /> : <FiEyeOff />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'add-product' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <form onSubmit={editingProduct ? handleProductUpdate : handleProductSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editingProduct ? editingProduct.name : newProduct.name}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, name: e.target.value })
                        : setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editingProduct ? editingProduct.description : newProduct.description}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, description: e.target.value })
                        : setNewProduct({ ...newProduct, description: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    rows="4"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.price : newProduct.price}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, price: e.target.value })
                        : setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={editingProduct ? editingProduct.category : newProduct.category}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, category: e.target.value })
                        : setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Jeans">Jeans</option>
                    <option value="Trousers">Trousers</option>
                    <option value="Jacket">Jacket</option>
                    <option value="T-shirt">T-shirt</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Hoodie">Hoodie</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={editingProduct ? editingProduct.stock : newProduct.stock}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, stock: e.target.value })
                        : setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    3D Model URL
                  </label>
                  <input
                    type="url"
                    value={editingProduct ? editingProduct.model3D : newProduct.model3D}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, model3D: e.target.value })
                        : setNewProduct({ ...newProduct, model3D: e.target.value })
                    }
                    placeholder="https://example.com/model.glb"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Enter the URL of your 3D model file (GLB format recommended)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Images
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload files</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                  {(editingProduct ? editingProduct.images : newProduct.images).length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {(editingProduct ? editingProduct.images : newProduct.images).map((image, index) => (
                        <div key={index} className="relative">
                          <Image
                            src={image}
                            alt={`Product image ${index + 1}`}
                            width={100}
                            height={100}
                            className="rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null)
                      setActiveTab('products')
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 