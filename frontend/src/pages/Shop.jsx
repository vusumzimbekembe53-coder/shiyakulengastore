
import React, { useEffect, useState } from 'react'
import { getProducts } from '../services/api'
import { Link } from 'react-router-dom'

const Shop = () => {

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const categories = [
    'ALL',
    'HEADWEAR',
    'HOODIES',
    'TEES & SETS',
    'TRACKSUITS'
  ]

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        console.error('Shop loading error:', err)
        setError('Unable to load products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const filteredProducts =
    selectedCategory === 'ALL'
      ? products
      : products.filter(
          (product) =>
            product.category?.toUpperCase() === selectedCategory
        )

  const handleAddToCart = (product) => {
    addToCart({
      ...product,
      id: product._id
    })

    alert(`${product.name} has been added to your bag!`)
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 md:px-10 py-16">

      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADING */}
        <div className="mb-12">
          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-4">
            THE SHIYA COLLECTION
          </p>

          <h1 className="text-5xl md:text-7xl font-black">
            SHOP
            <span className="text-[#00F0FF]"> ALL.</span>
          </h1>

          <p className="text-gray-400 mt-5 max-w-xl leading-7">
            Explore our collection of streetwear, headwear and everyday
            essentials. Find your style. Own your shift.
          </p>
        </div>

        {/* CATEGORY FILTERS */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-3 text-xs font-black tracking-widest transition ${
                selectedCategory === category
                  ? 'bg-[#00F0FF] text-[#0B0C10]'
                  : 'bg-[#181A20] text-gray-300 border border-white/10 hover:border-[#00F0FF]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* PRODUCT COUNT */}
        {!loading && !error && (
          <p className="text-gray-400 text-sm mb-6">
            {filteredProducts.length} products found
          </p>
        )}

        {/* PRODUCTS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">

          {loading && (
            <p className="text-gray-400 col-span-full">
              Loading products...
            </p>
          )}

          {error && (
            <p className="text-[#FF5500] col-span-full">
              {error}
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p className="text-gray-400 col-span-full">
              No products found in this category.
            </p>
          )}

          {!loading && !error && filteredProducts.map((product) => (
           <Link
  to={`/product/${product._id}`}
  key={product._id}
  className="group bg-[#181A20] rounded-xl overflow-hidden border border-white/5 hover:border-[#00F0FF]/50 transition block"
>
              <div className="relative overflow-hidden h-[320px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>

              <div className="p-6">

                <p className="text-[#00F0FF] text-xs font-bold tracking-widest mb-2">
                  {product.category}
                </p>

                <h2 className="text-xl font-black mb-2">
                  {product.name}
                </h2>

                <p className="text-gray-400 text-sm leading-6 min-h-[48px]">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mt-6 gap-3">
                  <span className="text-xl font-black">
                    R{Number(product.price).toFixed(2)}
                  </span>

                 
                </div>

              </div>
            </Link>
          ))}

        </div>

      </div>
    </main>
  )
}

export default Shop
