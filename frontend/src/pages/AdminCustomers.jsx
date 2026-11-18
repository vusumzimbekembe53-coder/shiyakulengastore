
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminCustomers = () => {
  const { token, logout } = useAuth()

  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedCustomer, setExpandedCustomer] = useState(null)
  const [search, setSearch] = useState('')

  const fetchCustomers = async () => {
    try {
      setError('')

      const headers = {
        Authorization: `Bearer ${token}`
      }

      const [customersResponse, ordersResponse] = await Promise.all([
        fetch(`${API_URL}/api/auth/admin/customers`, { headers }),
        fetch(`${API_URL}/api/orders/admin/all`, { headers })
      ])

      const customersData = await customersResponse.json()
      const ordersData = await ordersResponse.json()

      if (!customersResponse.ok) {
        throw new Error(customersData.message || 'Unable to load customers.')
      }

      if (!ordersResponse.ok) {
        throw new Error(ordersData.message || 'Unable to load orders.')
      }

      setCustomers(customersData.customers || [])
      setOrders(ordersData.orders || [])
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchCustomers()
  }, [token])

  const handleLogout = () => {
    logout()
    window.location.href = '/admin/login'
  }

  const getCustomerOrders = (customerId) => {
    return orders.filter(order => {
      const orderCustomerId =
        order.customer?._id || order.customer?.id || order.customer

      return String(orderCustomerId) === String(customerId)
    })
  }

  const filteredCustomers = customers.filter(customer => {
    const searchText = search.toLowerCase()

    return (
      customer.name?.toLowerCase().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText)
    )
  })

  const customersWithOrders = customers.filter(
    customer => getCustomerOrders(customer._id).length > 0
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

  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-[#94A3B8] hover:bg-white/5 hover:text-white"
          >
            <span>🛍️</span> Orders
          </Link>

          <Link
            to="/admin/customers"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold bg-[#00F0FF] text-[#0B0C10]"
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
              CUSTOMERS<span className="text-[#00F0FF]">.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm mt-2">
              View registered customers and their purchase history.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true)
              fetchCustomers()
            }}
            className="bg-[#181A20] border border-white/10 px-5 py-3 rounded-lg text-sm font-bold hover:border-[#00F0FF]"
          >
            ↻ REFRESH CUSTOMERS
          </button>

        </div>

        {/* STATISTICS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              TOTAL CUSTOMERS
            </p>
            <h2 className="text-3xl font-black">
              {customers.length}
            </h2>
          </div>

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              CUSTOMERS WITH ORDERS
            </p>
            <h2 className="text-3xl font-black text-[#00F0FF]">
              {customersWithOrders}
            </h2>
          </div>

          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <p className="text-[#94A3B8] text-xs font-bold mb-4">
              TOTAL CUSTOMER ORDERS
            </p>
            <h2 className="text-3xl font-black text-[#CCFF00]">
              {orders.length}
            </h2>
          </div>

        </div>

        {/* SEARCH */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:max-w-md bg-[#181A20] border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-[#00F0FF]"
          />
        </div>

        {/* CUSTOMER LIST */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">REGISTERED CUSTOMERS</h2>
          <p className="text-[#94A3B8] text-sm mt-2">
            Select a customer to view their information and order history.
          </p>
        </div>

        {error && (
          <p className="text-[#FF5500] bg-[#FF5500]/10 p-4 rounded-lg mb-6">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-[#94A3B8]">Loading customers...</p>
        ) : customers.length === 0 ? (
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-10 text-center">
            <p className="text-4xl mb-4">👥</p>
            <h3 className="text-xl font-bold mb-2">No Customers Yet</h3>
            <p className="text-[#94A3B8] text-sm">
              Registered customers will appear here.
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-10 text-center">
            <p className="text-[#94A3B8]">
              No customers match your search.
            </p>
          </div>
        ) : (

          <div className="space-y-5">

            {filteredCustomers.map(customer => {
              const customerOrders = getCustomerOrders(customer._id)

              return (

                <div
                  key={customer._id}
                  className="bg-[#181A20] border border-white/10 rounded-xl overflow-hidden"
                >

                  {/* CUSTOMER SUMMARY */}
                  <div className="p-6">

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                      <div>
                        <p className="text-[#94A3B8] text-xs mb-2">
                          CUSTOMER
                        </p>

                        <h3 className="font-bold">
                          {customer.name}
                        </h3>

                        <p className="text-[#94A3B8] text-sm mt-1">
                          {customer.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#94A3B8] text-xs mb-2">
                          PHONE NUMBER
                        </p>

                        <p className="font-bold">
                          {customer.phone || 'Not provided'}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#94A3B8] text-xs mb-2">
                          TOTAL ORDERS
                        </p>

                        <p className="text-[#00F0FF] text-xl font-black">
                          {customerOrders.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-[#94A3B8] text-xs mb-2">
                          DATE REGISTERED
                        </p>

                        <p className="font-bold text-sm">
                          {formatDate(customer.createdAt)}
                        </p>
                      </div>

                      <button
                        onClick={() => setExpandedCustomer(
                          expandedCustomer === customer._id
                            ? null
                            : customer._id
                        )}
                        className="text-[#00F0FF] font-bold text-sm hover:underline"
                      >
                        {expandedCustomer === customer._id
                          ? 'CLOSE DETAILS ↑'
                          : 'VIEW DETAILS ↓'}
                      </button>

                    </div>

                  </div>

                  {/* CUSTOMER DETAILS */}
                  {expandedCustomer === customer._id && (

                    <div className="border-t border-white/10 p-6">

                      <h3 className="font-bold mb-4">
                        CUSTOMER INFORMATION
                      </h3>

                      <div className="bg-[#0B0C10] rounded-lg p-5 mb-8 text-sm space-y-3">

                        <p>
                          <span className="text-[#94A3B8]">Name:</span>{' '}
                          {customer.name}
                        </p>

                        <p>
                          <span className="text-[#94A3B8]">Email:</span>{' '}
                          {customer.email}
                        </p>

                        <p>
                          <span className="text-[#94A3B8]">Phone:</span>{' '}
                          {customer.phone || 'Not provided'}
                        </p>

                        <p>
                          <span className="text-[#94A3B8]">Joined:</span>{' '}
                          {formatDate(customer.createdAt)}
                        </p>

                      </div>

                      <h3 className="font-bold mb-4">
                        DELIVERY ADDRESS
                      </h3>

                      <div className="bg-[#0B0C10] rounded-lg p-5 mb-8 text-sm space-y-2">

                        <p>{customer.address || 'No address provided'}</p>

                        {customer.addressLine2 && (
                          <p>{customer.addressLine2}</p>
                        )}

                        <p className="text-[#94A3B8]">
                          {[
                            customer.city,
                            customer.province,
                            customer.postalCode
                          ].filter(Boolean).join(', ') || 'No location provided'}
                        </p>

                      </div>

                      <h3 className="font-bold mb-4">
                        ORDER HISTORY
                      </h3>

                      {customerOrders.length === 0 ? (

                        <div className="bg-[#0B0C10] rounded-lg p-6 text-center">
                          <p className="text-[#94A3B8] text-sm">
                            This customer has not placed any orders yet.
                          </p>
                        </div>

                      ) : (

                        <div className="space-y-4">

                          {customerOrders.map(order => (

                            <div
                              key={order._id}
                              className="bg-[#0B0C10] border border-white/10 rounded-lg p-5"
                            >

                              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-5">

                                <div>
                                  <p className="text-[#94A3B8] text-xs mb-2">
                                    ORDER NUMBER
                                  </p>

                                  <p className="font-bold">
                                    #{order._id.slice(-8).toUpperCase()}
                                  </p>

                                  <p className="text-[#94A3B8] text-sm mt-2">
                                    {formatDate(order.createdAt)}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[#94A3B8] text-xs mb-2">
                                    ORDER TOTAL
                                  </p>

                                  <p className="text-[#00F0FF] text-xl font-black">
                                    R{Number(order.totalAmount || 0).toFixed(2)}
                                  </p>
                                </div>

                                <div className="flex flex-col gap-2">

                                  <span className={`px-3 py-2 rounded-full text-xs font-bold uppercase text-center ${statusClass(order.orderStatus)}`}>
                                    {order.orderStatus}
                                  </span>

                                  <span className="bg-white/5 text-[#CCFF00] px-3 py-2 rounded-full text-xs font-bold uppercase text-center">
                                    {order.paymentStatus}
                                  </span>

                                </div>

                              </div>

                              <div className="border-t border-white/10 pt-4">

                                <p className="font-bold text-sm mb-3">
                                  ORDERED PRODUCTS
                                </p>

                                <div className="space-y-3">

                                  {(order.items || []).map((item, index) => (

                                    <div
                                      key={index}
                                      className="flex flex-col sm:flex-row justify-between gap-2 text-sm"
                                    >
                                      <div>
                                        <p className="font-bold">
                                          {item.name}
                                        </p>

                                        <p className="text-[#94A3B8] mt-1">
                                          Quantity: {item.quantity}
                                          {item.size && ` | Size: ${item.size}`}
                                          {item.color && ` | Colour: ${item.color}`}
                                        </p>
                                      </div>

                                      <p className="font-bold">
                                        R{(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                                      </p>

                                    </div>

                                  ))}

                                </div>

                              </div>

                            </div>

                          ))}

                        </div>

                      )}

                    </div>

                  )}

                </div>

              )
            })}

          </div>

        )}

      </main>
    </div>
  )
}

export default AdminCustomers
