
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const Checkout = () => {
  const { cart, subtotal } = useCart()
  const { user, token } = useAuth()
  const navigate = useNavigate()

  const [isProcessing, setIsProcessing] = useState(false)

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    province: user?.province || '',
    postalCode: user?.postalCode || ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        addressLine2: user.addressLine2 || '',
        city: user.city || '',
        province: user.province || '',
        postalCode: user.postalCode || ''
      })
    }
  }, [user])

  const [deliveryMethod, setDeliveryMethod] = useState('standard')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const deliveryFee = deliveryMethod === 'standard' ? 100 : 0
  const total = subtotal + deliveryFee

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isProcessing) return

    if (!token) {
      alert('Please log in before placing your order.')
      navigate('/login')
      return
    }

    setIsProcessing(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item.id,
            quantity: item.quantity,
            size: item.size || '',
            color: item.color || ''
          })),

          shippingAddress: {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            addressLine2: formData.addressLine2,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode
          }
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to place your order.')
      }

      const order = data.order || data

      if (!order._id && !order.id) {
        throw new Error('Your order was created, but its reference could not be retrieved. Please contact support before placing another order.')
      }

      // Continue to the order confirmation page.
      navigate('/order-confirmation', {
        state: {
          order,
          orderId: order._id || order.id
        }
      })

    } catch (error) {
      alert(error.message)
      setIsProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white px-6 py-24 text-center">
        <h1 className="text-4xl font-black">
          YOUR BAG IS <span className="text-[#00F0FF]">EMPTY.</span>
        </h1>

        <p className="text-gray-400 mt-5">
          Add something from our collection before checking out.
        </p>

        <Link
          to="/shop"
          className="inline-block mt-8 bg-[#00F0FF] text-[#0B0C10] px-8 py-4 font-black text-xs tracking-widest"
        >
          SHOP NOW
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 md:px-10 py-16">
      <div className="max-w-7xl mx-auto">

        <div className="mb-12">
          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-4">
            ALMOST YOURS
          </p>

          <h1 className="text-5xl md:text-7xl font-black">
            CHECK<span className="text-[#00F0FF]">OUT.</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* CUSTOMER DETAILS */}
            <div className="lg:col-span-2 space-y-10">

              <section className="bg-[#181A20] p-6 md:p-8 rounded-xl">
                <h2 className="text-2xl font-black mb-7">
                  01. CONTACT DETAILS
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[
                    { name: 'name', label: 'FULL NAME', type: 'text' },
                    { name: 'email', label: 'EMAIL ADDRESS', type: 'email' },
                    { name: 'phone', label: 'PHONE NUMBER', type: 'tel' }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-bold mb-2">
                        {field.label}
                      </label>

                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* DELIVERY ADDRESS */}
              <section className="bg-[#181A20] p-6 md:p-8 rounded-xl">
                <h2 className="text-2xl font-black mb-7">
                  02. DELIVERY ADDRESS
                </h2>

                <div className="space-y-5">

                  <div>
                    <label className="block text-xs font-bold mb-2">
                      STREET ADDRESS
                    </label>

                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="House number and street name"
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-2">
                      APARTMENT, UNIT OR COMPLEX (OPTIONAL)
                    </label>

                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        CITY / TOWN
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        PROVINCE
                      </label>

                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                      >
                        <option value="">Select province</option>
                        <option value="Eastern Cape">Eastern Cape</option>
                        <option value="Free State">Free State</option>
                        <option value="Gauteng">Gauteng</option>
                        <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                        <option value="Limpopo">Limpopo</option>
                        <option value="Mpumalanga">Mpumalanga</option>
                        <option value="Northern Cape">Northern Cape</option>
                        <option value="North West">North West</option>
                        <option value="Western Cape">Western Cape</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2">
                        POSTAL CODE
                      </label>

                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                        className="w-full bg-[#0B0C10] border border-white/10 rounded-lg p-4 text-white outline-none focus:border-[#00F0FF]"
                      />
                    </div>

                  </div>
                </div>
              </section>

              {/* DELIVERY METHOD */}
              <section className="bg-[#181A20] p-6 md:p-8 rounded-xl">
                <h2 className="text-2xl font-black mb-7">
                  03. DELIVERY METHOD
                </h2>

                <label className="flex items-center justify-between gap-4 border border-[#00F0FF] rounded-lg p-5 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === 'standard'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="accent-[#00F0FF]"
                    />

                    <div>
                      <p className="font-bold">Standard Delivery</p>
                      <p className="text-gray-400 text-sm">
                        Delivery across South Africa
                      </p>
                    </div>
                  </div>

                  <span className="font-black">R100.00</span>
                </label>

                <p className="text-gray-500 text-xs mt-4">
                  Delivery fees are provisional and will be confirmed before payment.
                </p>
              </section>

              {/* PAYMENT METHOD */}
              <section className="bg-[#181A20] p-6 md:p-8 rounded-xl">
                <h2 className="text-2xl font-black mb-5">
                  04. PAYMENT METHOD
                </h2>

                <div className="border border-[#00F0FF] rounded-lg p-5">
                  <p className="font-bold text-[#00F0FF]">
                    Manual EFT
                  </p>

                  <p className="text-gray-400 text-sm mt-2">
                    Place your order first. Banking details and payment
                    instructions will be provided once they are available.
                  </p>

                  <p className="text-[#FF5500] text-xs font-bold mt-4">
                    DO NOT MAKE A PAYMENT YET. BANKING DETAILS ARE COMING SOON.
                  </p>
                </div>
              </section>

            </div>

            {/* ORDER SUMMARY */}
            <aside className="bg-[#181A20] p-6 md:p-8 rounded-xl h-fit">

              <h2 className="text-2xl font-black mb-7">
                YOUR ORDER
              </h2>

              <div className="space-y-5">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 border-b border-white/10 pb-5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-24 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <h3 className="font-bold">{item.name}</h3>

                      <p className="text-gray-400 text-sm mt-1">
                        Quantity: {item.quantity}
                      </p>

                      <p className="text-[#00F0FF] font-black mt-2">
                        R{(Number(item.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mt-7">

                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>R{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-400">
                  <span>Delivery</span>
                  <span>R{deliveryFee.toFixed(2)}</span>
                </div>

                <div className="border-t border-white/10 pt-5 flex justify-between text-xl font-black">
                  <span>TOTAL</span>
                  <span className="text-[#00F0FF]">
                    R{total.toFixed(2)}
                  </span>
                </div>

              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full mt-8 bg-[#00F0FF] text-[#0B0C10] py-4 font-black text-xs tracking-widest hover:bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'PLACING ORDER...' : 'PLACE ORDER →'}
              </button>

              <Link
                to="/cart"
                className="block text-center text-gray-400 text-xs mt-6 hover:text-[#00F0FF]"
              >
                RETURN TO BAG
              </Link>

            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Checkout
