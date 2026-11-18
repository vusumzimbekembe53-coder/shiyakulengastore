
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const OrderConfirmation = () => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { token } = useAuth()
  const { clearCart } = useCart()

  const [order, setOrder] = useState(location.state?.order || null)
  const [loading, setLoading] = useState(!location.state?.order)
  const [error, setError] = useState('')

  const orderId =
    location.state?.orderId ||
    location.state?.order?._id ||
    searchParams.get('orderId')

  const fetchOrder = async () => {
    if (!orderId || !token) {
      setError('Unable to find your order. Please check your account order history.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to retrieve your order.')
      }

      const foundOrder = data.orders.find(
        item => item._id === orderId
      )

      if (!foundOrder) {
        throw new Error('Order not found in your account.')
      }

      setOrder(foundOrder)
      clearCart()

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (location.state?.order) {
      setOrder(location.state.order)
      clearCart()
      setLoading(false)
      return
    }

    fetchOrder()
  }, [orderId, token])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-6 text-center">
        <p className="text-[#00F0FF] font-black tracking-widest">
          LOADING YOUR ORDER...
        </p>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-[#0B0C10] text-white flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-black">
          ORDER NOT FOUND
        </h1>

        <p className="text-[#94A3B8] mt-4">
          {error || 'Please check your account for your order history.'}
        </p>

        <Link
          to="/account"
          className="mt-8 bg-[#00F0FF] text-[#0B0C10] px-8 py-4 font-black"
        >
          VIEW MY ORDERS
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 py-20">
      <div className="max-w-3xl mx-auto">

        {/* ORDER SUCCESS */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-5 text-[#CCFF00]">
            ✓
          </div>

          <p className="text-[#FF5500] text-xs font-black tracking-[5px] mb-4">
            SHIYA KULENGA
          </p>

          <h1 className="text-4xl md:text-6xl font-black">
            ORDER <span className="text-[#00F0FF]">RECEIVED.</span>
          </h1>

          <p className="text-[#94A3B8] mt-5">
            Thank you for shopping with us. Your order has been received successfully.
          </p>
        </div>

        {/* PAYMENT INFORMATION */}
        <section className="bg-[#181A20] rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-black mb-5">
            PAYMENT INFORMATION
          </h2>

          <div className="border border-[#FF5500] rounded-lg p-5">
            <p className="text-[#FF5500] font-black text-sm">
              AWAITING EFT PAYMENT
            </p>

            <p className="text-[#94A3B8] text-sm mt-3">
              Your order will only be confirmed once your EFT payment has been received and verified.
            </p>

            <p className="text-white text-sm mt-4">
              Banking details are coming soon.
            </p>

            <p className="text-[#FF5500] text-xs font-bold mt-3">
              PLEASE DO NOT MAKE A PAYMENT UNTIL OFFICIAL BANKING DETAILS ARE PROVIDED.
            </p>
          </div>

          <p className="text-[#94A3B8] text-sm mt-6">
            YOUR ORDER NUMBER
          </p>

          <h2 className="text-xl font-black text-[#00F0FF] mt-2 break-all">
            {order._id}
          </h2>

          <p className="text-[#94A3B8] text-sm mt-5">
            Payment status:{' '}
            <span className="text-[#FF5500] uppercase font-bold">
              {order.paymentStatus || 'pending'}
            </span>
          </p>

          <p className="text-[#94A3B8] text-sm mt-2">
            Order status:{' '}
            <span className="text-white uppercase">
              {order.orderStatus || 'processing'}
            </span>
          </p>
        </section>

        {/* ORDER SUMMARY */}
        <section className="bg-[#181A20] rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-black mb-6">
            ORDER SUMMARY
          </h2>

          <div className="space-y-5">
            {order.items?.map((item, index) => (
              <div
                key={index}
                className="border-b border-white/10 pb-5"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <h3 className="font-bold">{item.name}</h3>

                    {item.size && (
                      <p className="text-sm text-[#94A3B8] mt-2">
                        Size: {item.size}
                      </p>
                    )}

                    {item.color && (
                      <p className="text-sm text-[#94A3B8] mt-1">
                        Colour: {item.color}
                      </p>
                    )}

                    <p className="text-sm text-[#94A3B8] mt-1">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="font-bold whitespace-nowrap">
                    R{(Number(item.price) * Number(item.quantity)).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 mt-7">
            <div className="flex justify-between text-[#94A3B8]">
              <span>Subtotal</span>
              <span>R{Number(order.subtotal).toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-[#94A3B8]">
              <span>Delivery</span>
              <span>R{Number(order.deliveryFee).toFixed(2)}</span>
            </div>

            <div className="border-t border-white/10 pt-5 flex justify-between text-xl font-black">
              <span>TOTAL</span>
              <span className="text-[#00F0FF]">
                R{Number(order.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* DELIVERY ADDRESS */}
        <section className="bg-[#181A20] rounded-xl p-6 md:p-8 mb-8">
          <h2 className="text-xl font-black mb-5">
            DELIVERY ADDRESS
          </h2>

          <p>{order.shippingAddress?.fullName}</p>

          <p className="text-[#94A3B8] mt-2">
            {order.shippingAddress?.address}
          </p>

          {order.shippingAddress?.addressLine2 && (
            <p className="text-[#94A3B8]">
              {order.shippingAddress.addressLine2}
            </p>
          )}

          <p className="text-[#94A3B8]">
            {order.shippingAddress?.city}, {order.shippingAddress?.province}
          </p>

          <p className="text-[#94A3B8]">
            {order.shippingAddress?.postalCode}
          </p>
        </section>

        <div className="flex flex-col sm:flex-row justify-center gap-4 text-center">
          <Link
            to="/account"
            className="bg-[#181A20] border border-white/10 px-8 py-4 font-black text-xs tracking-widest hover:border-[#00F0FF] transition"
          >
            MY ACCOUNT
          </Link>

          <Link
            to="/shop"
            className="bg-[#00F0FF] text-[#0B0C10] px-8 py-4 font-black text-xs tracking-widest hover:bg-white transition"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

      </div>
    </main>
  )
}

export default OrderConfirmation
