
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const AdminDashboard = () => {
  const { logout, token } = useAuth()
  const navigate = useNavigate()

  const [overview, setOverview] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders/admin/overview`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load dashboard statistics.')
        }

        setOverview(data.overview)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchOverview()
    }
  }, [token])

  // ADMIN LOGOUT
  // Redirects to the normal customer login page.
  const handleLogout = () => {
  logout()
  window.location.replace('/login')
}

  const togglePassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // CHANGE ADMIN PASSWORD
  const handleChangePassword = async (e) => {
    e.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Your new passwords do not match.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.')
      return
    }

    try {
      setPasswordLoading(true)

      const response = await fetch(`${API_URL}/api/auth/admin/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change admin password.')
      }

      setPasswordMessage(data.message || 'Admin password changed successfully.')

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setShowPasswords({
        current: false,
        new: false,
        confirm: false
      })

    } catch (error) {
      setPasswordError(error.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  const menuItems = [
    { name: 'Overview', icon: '📊', path: '/admin', active: true },
    { name: 'Products', icon: '📦', path: '/admin/products' },
    { name: 'Orders', icon: '🛍️', path: '/admin/orders' },
    { name: 'Customers', icon: '👥', path: '/admin/customers' },
  ]

  const stats = [
    { title: 'TOTAL PRODUCTS', value: overview.totalProducts, icon: '📦' },
    { title: 'TOTAL ORDERS', value: overview.totalOrders, icon: '🛍️' },
    { title: 'TOTAL CUSTOMERS', value: overview.totalCustomers, icon: '👥' },
    { title: 'PENDING ORDERS', value: overview.pendingOrders, icon: '⏳' },
  ]

  const passwordInputClass =
    'w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white outline-none focus:border-[#00F0FF]'

  const renderPasswordField = (label, field, value, setter, placeholder) => (
    <div>
      <label className="block text-sm font-bold mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={showPasswords[field] ? 'text' : 'password'}
          value={value}
          onChange={(e) => setter(e.target.value)}
          required
          minLength={field === 'current' ? undefined : 8}
          autoComplete={field === 'current' ? 'current-password' : 'new-password'}
          className={passwordInputClass}
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => togglePassword(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00F0FF] transition"
          aria-label={showPasswords[field] ? 'Hide password' : 'Show password'}
          title={showPasswords[field] ? 'Hide password' : 'Show password'}
        >
          {showPasswords[field] ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
              <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 4.5 10 7-0.4 1-1.2 2.2-2.5 3.4" />
              <path d="M6.2 6.2C3.8 7.7 2.4 10 2 12c1 2.5 5 7 10 7 1.1 0 2.1-.2 3.1-.6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )

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
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition ${
                item.active
                  ? 'bg-[#00F0FF] text-[#0B0C10]'
                  : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
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
              DASHBOARD<span className="text-[#00F0FF]">.</span>
            </h1>

            <p className="text-[#94A3B8] text-sm mt-2">
              Welcome to your Shiya Kulenga store administration.
            </p>
          </div>

          <span className="bg-[#181A20] border border-white/10 px-4 py-3 rounded-lg text-xs text-[#CCFF00] font-bold">
            ADMIN PANEL
          </span>

        </div>

        {/* OVERVIEW CARDS */}
        {error && (
          <p className="text-[#FF5500] text-sm mb-5">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

          {stats.map((item) => (
            <div
              key={item.title}
              className="bg-[#181A20] border border-white/10 rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <p className="text-[#94A3B8] text-xs font-bold tracking-wider">
                  {item.title}
                </p>
                <span className="text-2xl">{item.icon}</span>
              </div>

              <h2 className="text-3xl font-black">
                {loading ? '...' : item.value}
              </h2>
            </div>
          ))}

        </div>

        {/* MANAGEMENT SECTIONS */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            STORE MANAGEMENT
          </h2>

          <p className="text-[#94A3B8] text-sm mt-2">
            Manage your store from one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

          {/* PRODUCTS */}
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <span className="text-3xl">📦</span>

            <h3 className="text-xl font-bold mt-5">
              Products
            </h3>

            <p className="text-[#94A3B8] text-sm mt-2 mb-6">
              Add new products, update existing items and manage your stock.
            </p>

            <Link
              to="/admin/products"
              className="text-[#00F0FF] text-sm font-bold hover:underline"
            >
              MANAGE PRODUCTS →
            </Link>
          </div>

          {/* ORDERS */}
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <span className="text-3xl">🛍️</span>

            <h3 className="text-xl font-bold mt-5">
              Orders
            </h3>

            <p className="text-[#94A3B8] text-sm mt-2 mb-6">
              View customer orders and manage order statuses.
            </p>

            <Link
              to="/admin/orders"
              className="text-[#00F0FF] text-sm font-bold hover:underline"
            >
              MANAGE ORDERS →
            </Link>
          </div>

          {/* CUSTOMERS */}
          <div className="bg-[#181A20] border border-white/10 rounded-xl p-6">
            <span className="text-3xl">👥</span>

            <h3 className="text-xl font-bold mt-5">
              Customers
            </h3>

            <p className="text-[#94A3B8] text-sm mt-2 mb-6">
              View registered customers and their account information.
            </p>

            <Link
              to="/admin/customers"
              className="text-[#00F0FF] text-sm font-bold hover:underline"
            >
              VIEW CUSTOMERS →
            </Link>
          </div>

        </div>

        {/* ADMIN PASSWORD */}
        <div className="mt-10 bg-[#181A20] border border-white/10 rounded-xl p-6 md:p-8 max-w-2xl">

          <p className="text-[#FF5500] text-xs font-bold tracking-[3px] mb-3">
            ACCOUNT SECURITY
          </p>

          <h2 className="text-2xl font-black">
            CHANGE ADMIN PASSWORD<span className="text-[#00F0FF]">.</span>
          </h2>

          <p className="text-[#94A3B8] text-sm mt-2 mb-6">
            Update the password used to access your admin account.
          </p>

          <form onSubmit={handleChangePassword} className="space-y-5">

            {renderPasswordField(
              'Current Admin Password',
              'current',
              currentPassword,
              setCurrentPassword,
              'Enter current password'
            )}

            {renderPasswordField(
              'New Password',
              'new',
              newPassword,
              setNewPassword,
              'Enter new password'
            )}

            {renderPasswordField(
              'Confirm New Password',
              'confirm',
              confirmPassword,
              setConfirmPassword,
              'Confirm new password'
            )}

            {passwordError && (
              <p className="text-[#FF5500] text-sm">
                {passwordError}
              </p>
            )}

            {passwordMessage && (
              <p className="text-[#CCFF00] text-sm">
                {passwordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-[#00F0FF] text-[#0B0C10] px-6 py-3 rounded-lg font-black text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {passwordLoading ? 'UPDATING...' : 'UPDATE ADMIN PASSWORD'}
            </button>

          </form>
        </div>

      </main>
    </div>
  )
}

export default AdminDashboard
