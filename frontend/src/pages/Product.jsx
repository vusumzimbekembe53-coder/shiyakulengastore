
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { getProducts } from '../services/api'

const Product = () => {
  const { id } = useParams()
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const products = await getProducts()
        const foundProduct = products.find(
          (item) => item._id === id
        )

        setProduct(foundProduct || null)
      } catch (error) {
        console.error('Failed to load product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToBag = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      alert('Please select a size.')
      return
    }

    if (product.colors?.length > 0 && !selectedColor) {
      alert('Please select a colour.')
      return
    }

    addToCart({
      ...product,
      id: product._id,
      size: selectedSize,
      color: selectedColor,
      quantity
    })

    alert('Product added to your bag!')
  }

  if (loading) {
    return <div className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center">Loading product...</div>
  }

  if (!product) {
    return <div className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center">Product not found.</div>
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">

        <div>
          <img
            src={product.image}
            alt={product.name}
            className="w-full object-cover"
          />
        </div>

        <div>
          <p className="text-[#00F0FF] text-xs font-bold tracking-[0.3em] mb-4">
            SHIYA KULENGA
          </p>

          <h1 className="text-4xl md:text-5xl font-black mb-4">
            {product.name}
          </h1>

          <p className="text-2xl font-bold mb-6">
            R{Number(product.price).toFixed(2)}
          </p>

          <p className="text-[#94A3B8] leading-relaxed mb-8">
            {product.description}
          </p>

          {product.sizes?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold mb-3">SELECT SIZE</h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border px-5 py-3 ${
                      selectedSize === size
                        ? 'bg-[#00F0FF] text-[#0B0C10] border-[#00F0FF]'
                        : 'border-[#94A3B8] text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div className="mb-8">
              <h3 className="font-bold mb-3">SELECT COLOUR</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`border px-5 py-3 ${
                      selectedColor === color
                        ? 'bg-[#00F0FF] text-[#0B0C10] border-[#00F0FF]'
                        : 'border-[#94A3B8] text-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h3 className="font-bold mb-3">QUANTITY</h3>
            <div className="flex items-center gap-5">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="border border-[#94A3B8] px-4 py-2"
              >
                -
              </button>

              <span>{quantity}</span>

              <button
                onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                disabled={quantity >= product.stock}
                className="border border-[#94A3B8] px-4 py-2 disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToBag}
            disabled={product.stock <= 0}
            className="w-full bg-[#00F0FF] text-[#0B0C10] py-4 font-black tracking-widest hover:bg-white transition disabled:opacity-40"
          >
            {product.stock > 0 ? 'ADD TO BAG' : 'OUT OF STOCK'}
          </button>

          <p className="text-[#94A3B8] text-sm mt-4">
            {product.stock > 0
              ? `${product.stock} items available`
              : 'This product is currently unavailable.'}
          </p>
        </div>
      </div>
    </main>
  )
}

export default Product
