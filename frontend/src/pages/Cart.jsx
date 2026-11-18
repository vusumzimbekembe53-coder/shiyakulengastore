
import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const Cart = () => {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    subtotal
  } = useCart()

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-5 md:px-10 py-16">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-12 border-b border-white/10 pb-8">
          <span className="text-[#00F0FF] text-xs font-bold tracking-[3px]">
            YOUR SELECTION
          </span>

          <h1 className="text-5xl md:text-7xl font-black mt-3 tracking-tight">
            YOUR <span className="text-[#00F0FF]">BAG.</span>
          </h1>

          <p className="text-[#94A3B8] mt-3 text-sm">
            Your style. Your rules. Make every fit count.
          </p>
        </div>

        {cart.length === 0 ? (

          /* EMPTY CART */
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center">

            <span className="text-6xl mb-6">🛍</span>

            <h2 className="text-3xl font-bold mb-3">
              YOUR BAG IS EMPTY.
            </h2>

            <p className="text-[#94A3B8] text-sm mb-8">
              Looks like you haven't found your next favourite fit.
            </p>

            <Link
              to="/"
              className="bg-[#00F0FF] text-[#0B0C10] px-8 py-4 font-black text-xs tracking-widest hover:bg-[#CCFF00] transition"
            >
              CONTINUE SHOPPING →
            </Link>

          </div>

        ) : (

          /* CART CONTENT */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* CART ITEMS */}
            <div className="lg:col-span-2 space-y-6">

              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h2 className="font-bold tracking-widest text-sm">
                  SHOPPING BAG ({cart.reduce((total, item) => total + item.quantity, 0)})
                </h2>

                <span className="text-xs text-[#94A3B8]">
                  {cart.length} PRODUCT(S)
                </span>
              </div>

              {cart.map((item) => (

                <div
                  key={`${item.id}-${item.size || 'no-size'}-${item.color || 'no-color'}`}
                  className="flex flex-col sm:flex-row gap-5 p-4 bg-[#181A20] border border-white/5 hover:border-[#00F0FF]/30 transition"
                >

                  {/* PRODUCT IMAGE */}
                  <div className="w-full sm:w-36 h-44 bg-[#0B0C10] shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* PRODUCT DETAILS */}
                  <div className="flex-1 flex flex-col justify-between">

                    <div>
                      <span className="text-[#00F0FF] text-[10px] font-bold tracking-widest uppercase">
                        {item.category}
                      </span>

                      <h3 className="text-lg font-bold mt-2">
                        {item.name}
                      </h3>

                     <p className="text-[#94A3B8] text-sm mt-2">
  R{Number(item.price).toFixed(2)}
</p>

{item.size && (
  <p className="text-sm text-[#94A3B8] mt-2">
    Size: <span className="text-white">{item.size}</span>
  </p>
)}

{item.color && (
  <p className="text-sm text-[#94A3B8] mt-1">
    Colour: <span className="text-white">{item.color}</span>
  </p>
)}
                    </div>

                    {/* QUANTITY */}
                    <div className="flex flex-wrap items-center gap-6 mt-5">

                      <div className="flex items-center border border-white/20">

                        <button
                         onClick={() => decreaseQuantity(item.id, item.size, item.color)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="px-4 py-2 hover:text-[#00F0FF] disabled:opacity-30"
                        >
                          −
                        </button>

                        <span className="px-3 text-sm">
                          {item.quantity}
                        </span>

                        <button
                         onClick={() => increaseQuantity(item.id, item.size, item.color)}
                          aria-label="Increase quantity"
                          className="px-4 py-2 hover:text-[#00F0FF]"
                        >
                          +
                        </button>

                      </div>

                      <button
                       onClick={() => removeFromCart(item.id, item.size, item.color)}
                        className="text-xs font-bold tracking-widest text-[#FF5500] hover:text-white transition"
                      >
                        REMOVE
                      </button>

                    </div>

                  </div>

                  {/* ITEM TOTAL */}
                  <div className="sm:text-right">
                    <p className="text-xs text-[#94A3B8] mb-2">
                      ITEM TOTAL
                    </p>

                    <p className="font-bold text-lg">
                      R{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                </div>

              ))}

              <Link
                to="/"
                className="inline-block text-[#00F0FF] text-xs font-bold tracking-widest hover:text-white transition pt-4"
              >
                ← CONTINUE SHOPPING
              </Link>

            </div>


            {/* ORDER SUMMARY */}
            <aside className="h-fit bg-[#181A20] p-6 md:p-8 border border-white/10">

              <h2 className="text-xl font-black tracking-wide mb-8">
                ORDER SUMMARY
              </h2>

              <div className="flex justify-between text-sm text-[#94A3B8] mb-5">
                <span>Subtotal</span>
                <span className="text-white">
                  R{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-[#94A3B8] mb-6">
                <span>Delivery</span>
                <span>Calculated at checkout</span>
              </div>

              <div className="border-t border-white/10 pt-6 flex justify-between items-center">
                <span className="font-bold tracking-widest text-sm">
                  TOTAL
                </span>

                <span className="text-2xl font-black text-[#00F0FF]">
                  R{subtotal.toFixed(2)}
                </span>
              </div>

              <Link
  to="/checkout"
  className="block w-full mt-8 bg-[#00F0FF] text-[#0B0C10] py-4 font-black text-xs tracking-widest text-center hover:bg-[#CCFF00] transition"
>
  PROCEED TO CHECKOUT →
</Link>

              <div className="mt-6 text-center">
                <p className="text-[#94A3B8] text-xs">
                  🚚 Nationwide delivery across South Africa
                </p>
              </div>

            </aside>

          </div>

        )}

      </div>

    </main>
  )
}

export default Cart
