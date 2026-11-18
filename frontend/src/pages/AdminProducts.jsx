
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminProducts = () => {
  const { token, logout } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)

  const initialFormData = {
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    sizes: '',
    colors: '',
    isFeatured: false,
    stock: ''
  }

  const [formData, setFormData] = useState(initialFormData)

  const fetchProducts = async () => {
    if (!token) return

    try {
      setError('')

      const response = await fetch(`${API_URL}/api/products/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not load products.')
      }

      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    setFormData(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const productData = new FormData()

      productData.append('name', formData.name)
      productData.append('description', formData.description)
      productData.append('price', formData.price)
      productData.append('category', formData.category)
      productData.append('stock', formData.stock)
      productData.append('isFeatured', formData.isFeatured)

      productData.append(
        'sizes',
        JSON.stringify(
          formData.sizes.split(',').map(size => size.trim()).filter(Boolean)
        )
      )

      productData.append(
        'colors',
        JSON.stringify(
          formData.colors.split(',').map(color => color.trim()).filter(Boolean)
        )
      )

      if (!selectedImage) {
        throw new Error('Please select a product image.')
      }

      productData.append('image', selectedImage)

      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: productData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not add product.')
      }

      setFormData(initialFormData)
      setSelectedImage(null)
      setShowForm(false)

      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProductId(product._id)
    setSelectedImage(null)

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      sizes: (product.sizes || []).join(', '),
      colors: (product.colors || []).join(', '),
      stock: product.stock,
      isFeatured: product.isFeatured || false
    })

    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const productData = new FormData()

      productData.append('name', formData.name)
      productData.append('description', formData.description)
      productData.append('price', formData.price)
      productData.append('category', formData.category)
      productData.append('stock', formData.stock)
      productData.append('isFeatured', formData.isFeatured)

      productData.append(
        'sizes',
        JSON.stringify(
          formData.sizes.split(',').map(size => size.trim()).filter(Boolean)
        )
      )

      productData.append(
        'colors',
        JSON.stringify(
          formData.colors.split(',').map(color => color.trim()).filter(Boolean)
        )
      )

      if (selectedImage) {
        productData.append('image', selectedImage)
      }

      const response = await fetch(
        `${API_URL}/api/products/${editingProductId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: productData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update product.')
      }

      setEditingProductId(null)
      setSelectedImage(null)
      setShowForm(false)
      setFormData(initialFormData)

      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product? This action cannot be undone.'
    )

    if (!confirmed) return

    try {
      setError('')

      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not delete product.')
      }

      await fetchProducts()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingProductId(null)
    setSelectedImage(null)
    setFormData(initialFormData)
    setError('')
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex">

      {/* SIDEBAR */}
      <aside className="hidden md:flex w-64 bg-[#181A20] border-r border-white/10 flex-col p-6">

        <Link to="/" className="text-2xl font-black mb-12">
          SHIYA<span className="text-[#00F0FF]"> KULENGA.</span>
        </Link>

        <p className="text-[#94A3B8] text-xs tracking-[3px] mb-6">
          ADMINISTRATION
        </p>

        <nav className="space-y-3">

          <Link
            to="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>📊</span> Overview
          </Link>

          <Link
            to="/admin/products"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-[#00F0FF] text-[#0B0C10]"
          >
            <span>📦</span> Products
          </Link>

          <Link
            to="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>🛍️</span> Orders
          </Link>

          <Link
            to="/admin/customers"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>👥</span> Customers
          </Link>

        </nav>

        <div className="mt-auto space-y-4">
          <Link
            to="/"
            className="block text-sm text-[#94A3B8] hover:text-[#00F0FF]"
          >
            ← View Store
          </Link>

          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-[#FF5500] font-bold"
          >
            LOG OUT
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 p-6 md:p-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">

          <div>
            <p className="text-[#FF5500] text-xs font-bold tracking-[4px] mb-3">
              STORE MANAGEMENT
            </p>

            <h1 className="text-3xl md:text-4xl font-black">
              PRODUCTS<span className="text-[#00F0FF]">.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm mt-2">
              Manage your Shiya Kulenga products.
            </p>
          </div>

          <button
            onClick={() => {
              if (showForm) {
                handleCancelForm()
              } else {
                setShowForm(true)
              }
            }}
            className="bg-[#00F0FF] text-[#0B0C10] px-6 py-3 rounded-lg font-bold hover:opacity-90"
          >
            {showForm ? 'CANCEL' : '+ ADD NEW PRODUCT'}
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-[#FF5500]/10 border border-[#FF5500]/30 rounded-lg p-4 mb-6">
            <p className="text-[#FF5500]">{error}</p>
          </div>
        )}

        {/* PRODUCT FORM */}
        {showForm && (
          <form
            onSubmit={editingProductId ? handleUpdateProduct : handleAddProduct}
            className="bg-[#181A20] border border-white/10 rounded-xl p-6 mb-8 space-y-5"
          >

            <h2 className="text-xl font-bold">
              {editingProductId ? 'EDIT PRODUCT' : 'ADD NEW PRODUCT'}
            </h2>

            <div>
              <label className="block text-sm mb-2">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="3"
                className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                placeholder="Describe the product"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm mb-2">Price (R)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                  placeholder="e.g. Hoodies"
                />
              </div>

              <div>
                <label className="block text-sm mb-2">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0] || null)}
                  required={!editingProductId}
                  className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                />

                {selectedImage && (
                  <p className="text-[#CCFF00] text-sm mt-2">
                    Selected: {selectedImage.name}
                  </p>
                )}

                {editingProductId && formData.image && !selectedImage && (
                  <p className="text-[#94A3B8] text-xs mt-2">
                    Current product image will be kept.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm mb-2">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                  placeholder="0"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm mb-2">Available Sizes</label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleInputChange}
                className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
                placeholder="S, M, L, XL, XXL"
              />
              <p className="text-xs text-[#94A3B8] mt-2">
                Separate sizes with commas.
              </p>
            </div>

            <div>
              <label className="block text-sm mb-2">Colours</label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleInputChange}
                placeholder="e.g. Black, White, Red"
                className="w-full bg-[#0B0C10] border border-white/20 rounded-lg p-3 text-white"
              />
              <p className="text-xs text-[#94A3B8] mt-2">
                Separate colours with commas.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData(previous => ({
                    ...previous,
                    isFeatured: e.target.checked
                  }))
                }
                className="w-5 h-5 accent-[#CCFF00]"
              />

              <label htmlFor="isFeatured" className="text-white">
                Feature this product on the homepage
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[#CCFF00] text-[#0B0C10] px-8 py-3 rounded-lg font-bold hover:opacity-90"
              >
                {editingProductId ? 'UPDATE PRODUCT' : 'SAVE PRODUCT'}
              </button>

              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-white/10 text-white px-8 py-3 rounded-lg font-bold hover:bg-white/20"
              >
                CANCEL
              </button>
            </div>

          </form>
        )}

        {/* PRODUCT COUNT */}
        <div className="bg-[#181A20] border border-white/10 rounded-xl p-6 mb-8">
          <p className="text-[#94A3B8] text-sm">
            TOTAL PRODUCTS
          </p>

          <h2 className="text-3xl font-black mt-2">
            {products.length}
          </h2>
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-[#94A3B8]">
            Loading products...
          </p>
        )}

        {/* EMPTY PRODUCTS */}
        {!loading && !error && products.length === 0 && (
          <div className="bg-[#181A20] rounded-xl p-8 text-center">
            <p className="text-[#94A3B8]">
              No products have been added yet.
            </p>
          </div>
        )}

        {/* PRODUCT LIST */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map(product => (
              <div
                key={product._id}
                className="bg-[#181A20] border border-white/10 rounded-xl overflow-hidden"
              >

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                />

                <div className="p-5">

                  <h3 className="font-bold text-lg">
                    {product.name}
                  </h3>

                  <p className="text-[#94A3B8] text-sm mt-1">
                    {product.category}
                  </p>

                  <p className="text-[#94A3B8] text-sm mt-1">
                    Colours: {(product.colors || []).join(', ') || 'Not specified'}
                  </p>

                  <p className="text-[#94A3B8] text-sm mt-1">
                    Sizes: {(product.sizes || []).join(', ') || 'Not specified'}
                  </p>

                  <p className="text-[#00F0FF] font-bold mt-3">
                    R{Number(product.price).toFixed(2)}
                  </p>

                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span className="text-[#94A3B8]">
                      Stock: {product.stock}
                    </span>

                    <span className={product.isActive ? 'text-[#CCFF00]' : 'text-[#FF5500]'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {product.isFeatured && (
                    <p className="text-[#CCFF00] text-xs font-bold mt-3">
                      FEATURED PRODUCT
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">

                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-[#00F0FF] text-[#0B0C10] py-3 rounded-lg font-bold text-sm hover:opacity-90"
                    >
                      EDIT
                    </button>

                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="bg-[#FF5500] text-white py-3 rounded-lg font-bold text-sm hover:opacity-90"
                    >
                      DELETE
                    </button>

                  </div>

                </div>
              </div>
            ))}

          </div>
        )}

      </main>
    </div>
  )
}

export default AdminProducts
