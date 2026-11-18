
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminOrders = () => {
  const { token, logout } = useAuth()

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [viewingProof, setViewingProof] = useState(null)
  const [verifyingOrder, setVerifyingOrder] = useState(null)

  const fetchOrders = async () => {
    try {
      setError('')

      const response = await fetch(`${API_URL}/api/orders/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load orders.')
      }

      setOrders(data.orders || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchOrders()
  }, [token])

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingOrder(orderId)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ orderStatus: status })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update order.')
      }

      await fetchOrders()
    } catch (error) {
      setError(error.message)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const handleViewProof = async (orderId) => {
    setViewingProof(orderId)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/proof-of-payment`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to retrieve proof.')
      }

      if (!data.viewingUrl) {
        throw new Error('Proof viewing link was not returned.')
      }

      window.open(data.viewingUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      setError(error.message)
    } finally {
      setViewingProof(null)
    }
  }

  const handleVerifyPayment = async (orderId) => {
    const confirmed = window.confirm(
      'Have you checked your bank account and confirmed that the full payment has arrived?'
    )

    if (!confirmed) return

    setVerifyingOrder(orderId)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/orders/admin/${orderId}/verify-payment`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to verify payment.')
      }

      await fetchOrders()

      window.alert('Payment verified successfully.')
    } catch (error) {
      setError(error.message)
    } finally {
      setVerifyingOrder(null)
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/admin/login'
  }

  const pendingOrders = orders.filter(
    order => order.orderStatus === 'processing'
  ).length

  const deliveredOrders = orders.filter(
    order => order.orderStatus === 'delivered'
  ).length

  const statusClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'text-[#CCFF00] bg-[#CCFF00]/10'
      case 'shipped':
      case 'confirmed':
        return 'text-[#00F0FF] bg-[#00F0FF]/10'
      case 'cancelled':
        return 'text-[#FF5500] bg-[#FF5500]/10'
      default:
        return 'text-[#94A3B8] bg-white/5'
    }
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>📊</span> Overview
          </Link>

          <Link
            to="/admin/products"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>📦</span> Products
          </Link>

          <Link
            to="/admin/orders"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-[#00F0FF] text-[#0B0C10]"
          >
            <span>🛍️</span> Orders
          </Link>

          <Link
            to="/admin/customers"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
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
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">

          <div>
            <p className="text-[#FF5500] text-xs font-bold tracking-[4px] mb-3">
              STORE MANAGEMENT
            </p>

            <h1 className="text-3xl md:text-4xl font-black">
              ORDERS<span className="text-[#00F0FF]">.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm mt-2">
              View and manage customer purchases.
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="bg-[#181A20] border border-white/10 px-5 py-3 rounded-lg text-sm font-bold hover:border-[#00F0FF]"
          >
            ↻ REFRESH ORDERS
          </button>

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              TOTAL ORDERS
            </p>
            <h2 className="text-3xl font-black">{orders.length}</h2>
          </div>

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              PROCESSING ORDERS
            </p>
            <h2 className="text-3xl font-black text-[#FF5500]">
              {pendingOrders}
            </h2>
          </div>

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              DELIVERED ORDERS
            </p>
            <h2 className="text-3xl font-black text-[#CCFF00]">
              {deliveredOrders}
            </h2>
          </div>

        </div>

        {/* ORDERS LIST */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">CUSTOMER ORDERS</h2>
          <p className="text-[#94A3B8] text-sm mt-2">
            Select an order to view its details and update its status.
          </p>
        </div>

        {error && (
          <p className="text-[#FF5500] bg-[#FF5500]/10 p-4 rounded-lg mb-6">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-[#94A3B8]">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-10 text-center">
            <p className="text-4xl mb-4">🛍️</p>
            <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
            <p className="text-[#94A3B8] text-sm">
              Customer orders will appear here.
            </p>
          </div>
        ) : (

          <div className="space-y-5">

            {orders.map(order => (

              <div
                key={order._id}
                className="bg-[#181A20] border border-white/10 rounded-xl overflow-hidden"
              >

                {/* ORDER SUMMARY */}
                <div className="p-6">

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                    <div>
                      <p className="text-[#94A3B8] text-xs mb-2">
                        ORDER NUMBER
                      </p>

                      <h3 className="font-bold">
                        #{order._id.slice(-8).toUpperCase()}
                      </h3>

                      <p className="text-[#94A3B8] text-sm mt-2">
                        {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#94A3B8] text-xs mb-2">
                        CUSTOMER
                      </p>

                      <p className="font-bold">
                        {order.customer?.name || order.shippingAddress?.fullName || 'Customer'}
                      </p>

                      <p className="text-[#94A3B8] text-sm">
                        {order.customer?.email || order.shippingAddress?.email || ''}
                      </p>
                    </div>

                    <div>
                      <p className="text-[#94A3B8] text-xs mb-2">
                        ORDER TOTAL
                      </p>

                      <p className="text-[#00F0FF] text-xl font-black">
                        R{Number(order.totalAmount).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">

                      <span className={`px-3 py-2 rounded-full text-xs font-bold uppercase text-center ${statusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>

                      <span className={`px-3 py-2 rounded-full text-xs font-bold uppercase text-center ${
                        order.paymentStatus === 'paid'
                          ? 'bg-[#CCFF00]/10 text-[#CCFF00]'
                          : 'bg-[#FF5500]/10 text-[#FF5500]'
                      }`}>
                        {order.paymentStatus}
                      </span>

                    </div>

                    <button
                      onClick={() => setExpandedOrder(
                        expandedOrder === order._id ? null : order._id
                      )}
                      className="text-[#00F0FF] font-bold text-sm hover:underline"
                    >
                      {expandedOrder === order._id ? 'CLOSE DETAILS ↑' : 'VIEW DETAILS ↓'}
                    </button>

                  </div>

                </div>

                {/* ORDER DETAILS */}
                {expandedOrder === order._id && (

                  <div className="border-t border-white/10 p-6">

                    <h3 className="font-bold mb-4">ORDERED PRODUCTS</h3>

                    <div className="space-y-3 mb-8">

                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex flex-col sm:flex-row justify-between gap-2 bg-[#0B0C10] rounded-lg p-4"
                        >
                          <div>
                            <p className="font-bold">{item.name}</p>

                            <p className="text-[#94A3B8] text-sm mt-1">
                              Quantity: {item.quantity}
                              {item.size && ` | Size: ${item.size}`}
                              {item.color && ` | Colour: ${item.color}`}
                            </p>
                          </div>

                          <p className="font-bold">
                            R{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}

                    </div>

                    {/* PROOF OF PAYMENT */}
                    <div className="bg-[#0B0C10] border border-white/10 rounded-xl p-5 mb-8">

                      <h3 className="font-bold mb-3">
                        PROOF OF PAYMENT
                      </h3>

                      {order.proofOfPayment?.publicId ? (
                        <div className="space-y-3">

                          <p className="text-[#CCFF00] text-sm font-bold">
                            Proof submitted
                          </p>

                          <p className="text-[#94A3B8] text-sm">
                            File: {order.proofOfPayment.originalName}
                          </p>

                          {order.proofOfPayment.uploadedAt && (
                            <p className="text-[#94A3B8] text-sm">
                              Uploaded: {new Date(
                                order.proofOfPayment.uploadedAt
                              ).toLocaleString('en-ZA')}
                            </p>
                          )}

                          <button
                            onClick={() => handleViewProof(order._id)}
                            disabled={viewingProof === order._id}
                            className="bg-[#00F0FF] text-[#0B0C10] px-5 py-3 rounded-lg text-sm font-black disabled:opacity-50"
                          >
                            {viewingProof === order._id
                              ? 'OPENING PROOF...'
                              : 'VIEW PROOF'}
                          </button>

                        </div>
                      ) : (
                        <p className="text-[#94A3B8] text-sm">
                          No proof of payment has been submitted.
                        </p>
                      )}

                      {order.paymentStatus === 'pending' &&
                        order.paymentMethod === 'manual' && (
                          <div className="mt-5 pt-5 border-t border-white/10">

                            <p className="text-[#94A3B8] text-sm mb-3">
                              Only verify after checking your bank account
                              and confirming the full payment has arrived.
                            </p>

                            <button
                              onClick={() => handleVerifyPayment(order._id)}
                              disabled={verifyingOrder === order._id}
                              className="bg-[#CCFF00] text-[#0B0C10] px-5 py-3 rounded-lg text-sm font-black disabled:opacity-50"
                            >
                              {verifyingOrder === order._id
                                ? 'VERIFYING...'
                                : 'VERIFY EFT PAYMENT'}
                            </button>

                          </div>
                        )}

                    </div>

                    <h3 className="font-bold mb-4">DELIVERY INFORMATION</h3>

                    <div className="bg-[#0B0C10] rounded-lg p-4 mb-8 text-sm space-y-2">
                      <p>{order.shippingAddress?.fullName}</p>
                      <p className="text-[#94A3B8]">
                        {order.shippingAddress?.email}
                      </p>
                      <p className="text-[#94A3B8]">
                        {order.shippingAddress?.phone}
                      </p>
                      <p className="text-[#94A3B8]">
                        {order.shippingAddress?.address}
                        {order.shippingAddress?.addressLine2 &&
                          `, ${order.shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-[#94A3B8]">
                        {order.shippingAddress?.city},
                        {' '}{order.shippingAddress?.province}
                        {' '}{order.shippingAddress?.postalCode}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between gap-4">

                      <div>
                        <p className="text-[#94A3B8] text-sm mb-2">
                          UPDATE ORDER STATUS
                        </p>

                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                          disabled={updatingOrder === order._id}
                          className="bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00F0FF]"
                        >
                          <option value="processing">Processing</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        {updatingOrder === order._id && (
                          <p className="text-[#94A3B8] text-xs mt-2">
                            Updating order...
                          </p>
                        )}
                      </div>

                      <div className="text-sm sm:text-right space-y-2">
                        <p className="text-[#94A3B8]">
                          Subtotal: R{Number(order.subtotal).toFixed(2)}
                        </p>

                        <p className="text-[#94A3B8]">
                          Delivery: R{Number(order.deliveryFee).toFixed(2)}
                        </p>

                        <p className="font-bold text-[#00F0FF]">
                          Total: R{Number(order.totalAmount).toFixed(2)}
                        </p>
                      </div>

                    </div>

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  )
}

export default AdminOrders
