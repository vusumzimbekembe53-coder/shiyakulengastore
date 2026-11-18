
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Account = () => {
  const { user, token, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('personal')

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: ''
  })

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState('')

  // EFT PROOF UPLOAD STATE
  const [proofFiles, setProofFiles] = useState({})
  const [proofLoading, setProofLoading] = useState({})
  const [proofMessages, setProofMessages] = useState({})
  const [proofErrors, setProofErrors] = useState({})

  // LOAD CUSTOMER PROFILE
  useEffect(() => {
    if (user) {
      setProfile({
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

  // FETCH CUSTOMER ORDERS
  const fetchOrders = async () => {
    try {
      setOrdersError('')

      const response = await fetch(`${API_URL}/api/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to load your orders.')
      }

      setOrders(data.orders || [])
    } catch (error) {
      setOrdersError(error.message)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchOrders()
    }
  }, [token])

  // PROFILE INPUTS
  const handleProfileChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    })
  }

  // PASSWORD INPUTS
  const handlePasswordChange = (e) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    })
  }

  const togglePassword = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // UPDATE PROFILE
  const handleProfileSubmit = async (e) => {
    e.preventDefault()

    setProfileMessage('')
    setProfileError('')
    setProfileLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to update profile.')
      }

      updateUser(data.user)
      setProfileMessage('Your profile has been updated successfully.')
    } catch (error) {
      setProfileError(error.message)
    } finally {
      setProfileLoading(false)
    }
  }

  // CHANGE PASSWORD
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    setPasswordMessage('')
    setPasswordError('')

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Your new passwords do not match.')
      return
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError('Your new password must be at least 8 characters.')
      return
    }

    setPasswordLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to change password.')
      }

      setPasswordMessage('Your password has been changed successfully.')

      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

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

  // SELECT EFT PROOF
  const handleProofFileChange = (orderId, file) => {
    setProofMessages(prev => ({ ...prev, [orderId]: '' }))
    setProofErrors(prev => ({ ...prev, [orderId]: '' }))

    if (!file) {
      setProofFiles(prev => ({ ...prev, [orderId]: null }))
      return
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf'
    ]

    if (!allowedTypes.includes(file.type)) {
      setProofErrors(prev => ({
        ...prev,
        [orderId]: 'Please select a JPG, PNG or PDF file.'
      }))

      setProofFiles(prev => ({ ...prev, [orderId]: null }))
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setProofErrors(prev => ({
        ...prev,
        [orderId]: 'Your file must not exceed 5 MB.'
      }))

      setProofFiles(prev => ({ ...prev, [orderId]: null }))
      return
    }

    setProofFiles(prev => ({
      ...prev,
      [orderId]: file
    }))
  }

  // UPLOAD EFT PROOF
  const handleProofUpload = async (e, orderId) => {
    e.preventDefault()

    const file = proofFiles[orderId]

    if (!file) {
      setProofErrors(prev => ({
        ...prev,
        [orderId]: 'Please select your proof of payment first.'
      }))
      return
    }

    setProofLoading(prev => ({
      ...prev,
      [orderId]: true
    }))

    setProofMessages(prev => ({
      ...prev,
      [orderId]: ''
    }))

    setProofErrors(prev => ({
      ...prev,
      [orderId]: ''
    }))

    try {
      const formData = new FormData()
      formData.append('proof', file)

      const response = await fetch(
        `${API_URL}/api/orders/${orderId}/proof-of-payment`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to upload proof of payment.')
      }

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? {
                ...order,
                proofOfPayment: data.proofOfPayment,
                paymentStatus: data.paymentStatus
              }
            : order
        )
      )

      setProofFiles(prev => ({
        ...prev,
        [orderId]: null
      }))

      setProofMessages(prev => ({
        ...prev,
        [orderId]: data.message || 'Proof of payment uploaded successfully.'
      }))

    } catch (error) {
      setProofErrors(prev => ({
        ...prev,
        [orderId]: error.message
      }))
    } finally {
      setProofLoading(prev => ({
        ...prev,
        [orderId]: false
      }))
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const inputClass =
    'w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00F0FF]'

  const labelClass =
    'block text-sm text-[#94A3B8] mb-2'

  const passwordInputClass =
    'w-full bg-[#0B0C10] border border-white/10 rounded-lg pl-4 pr-12 py-3 text-white outline-none focus:border-[#00F0FF]'

  const EyeIcon = ({ visible }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {visible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.5 0 10 7 10 7a15.8 15.8 0 0 1-4 4.8" />
          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.5 7 10 7c1.4 0 2.7-.3 3.8-.8" />
        </>
      )}
    </svg>
  )

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        {/* ACCOUNT HEADER */}

        <div className="mb-10">
          <p className="text-[#FF5500] text-xs font-bold tracking-[4px] mb-3">
            YOUR SHIYA KULENGA ACCOUNT
          </p>

          <p className="text-[#94A3B8] mb-3">
            Welcome back, <span className="text-[#00F0FF] font-bold">
              {user?.name}
            </span>!
          </p>

          <h1 className="text-4xl md:text-5xl font-black">
            MY ACCOUNT<span className="text-[#00F0FF]">.</span>
          </h1>

          <p className="text-[#94A3B8] mt-3">
            Manage your personal details and orders.
          </p>
        </div>

        {/* ACCOUNT NAVIGATION */}

        <div className="grid grid-cols-2 gap-3 mb-8">

          <button
            onClick={() => setActiveTab('personal')}
            className={`p-4 rounded-xl font-bold text-sm transition ${
              activeTab === 'personal'
                ? 'bg-[#00F0FF] text-[#0B0C10]'
                : 'bg-[#181A20] text-[#94A3B8] border border-white/10 hover:border-[#00F0FF]'
            }`}
          >
            👤 PERSONAL DETAILS
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`p-4 rounded-xl font-bold text-sm transition ${
              activeTab === 'orders'
                ? 'bg-[#00F0FF] text-[#0B0C10]'
                : 'bg-[#181A20] text-[#94A3B8] border border-white/10 hover:border-[#00F0FF]'
            }`}
          >
            🛍️ MY ORDERS ({orders.length})
          </button>

        </div>

        {/* PERSONAL DETAILS TAB */}

        {activeTab === 'personal' && (
          <>

            {/* PERSONAL INFORMATION */}

            <section className="bg-[#181A20] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Personal Information
              </h2>

              <p className="text-[#94A3B8] text-sm mb-8">
                Update your name and contact details.
              </p>

              <form onSubmit={handleProfileSubmit} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleProfileChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      className={inputClass}
                      placeholder="Enter your phone number"
                    />
                  </div>

                </div>

                {profileError && (
                  <p className="text-[#FF5500] text-sm">{profileError}</p>
                )}

                {profileMessage && (
                  <p className="text-[#CCFF00] text-sm">{profileMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#00F0FF] text-[#0B0C10] font-bold px-8 py-3 rounded-lg hover:opacity-80 disabled:opacity-50"
                >
                  {profileLoading ? 'SAVING...' : 'SAVE PERSONAL DETAILS'}
                </button>

              </form>
            </section>

            {/* DELIVERY ADDRESS */}

            <section className="bg-[#181A20] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Delivery Address
              </h2>

              <p className="text-[#94A3B8] text-sm mb-8">
                Keep your delivery information up to date.
              </p>

              <form onSubmit={handleProfileSubmit} className="space-y-6">

                <div className="grid md:grid-cols-2 gap-6">

                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleProfileChange}
                      className={inputClass}
                      placeholder="House number and street name"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Apartment / Unit (Optional)</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={profile.addressLine2}
                      onChange={handleProfileChange}
                      className={inputClass}
                      placeholder="Apartment, unit or complex"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>City / Town</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city}
                      onChange={handleProfileChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Province</label>
                    <select
                      name="province"
                      value={profile.province}
                      onChange={handleProfileChange}
                      className={inputClass}
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
                    <label className={labelClass}>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={profile.postalCode}
                      onChange={handleProfileChange}
                      className={inputClass}
                      placeholder="Postal code"
                    />
                  </div>

                </div>

                {profileError && (
                  <p className="text-[#FF5500] text-sm">{profileError}</p>
                )}

                {profileMessage && (
                  <p className="text-[#CCFF00] text-sm">{profileMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-[#00F0FF] text-[#0B0C10] font-bold px-8 py-3 rounded-lg hover:opacity-80 disabled:opacity-50"
                >
                  {profileLoading ? 'SAVING...' : 'SAVE DELIVERY ADDRESS'}
                </button>

              </form>
            </section>

            {/* CHANGE PASSWORD */}

            <section className="bg-[#181A20] border border-white/10 rounded-2xl p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Change Password
              </h2>

              <p className="text-[#94A3B8] text-sm mb-8">
                Choose a new password to keep your account secure.
              </p>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">

                <div>
                  <label className={labelClass}>Current Password</label>

                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwords.currentPassword}
                      onChange={handlePasswordChange}
                      className={passwordInputClass}
                      placeholder="Enter current password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('current')}
                      aria-label="Toggle current password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00F0FF]"
                    >
                      <EyeIcon visible={showPasswords.current} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>New Password</label>

                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className={passwordInputClass}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('new')}
                      aria-label="Toggle new password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00F0FF]"
                    >
                      <EyeIcon visible={showPasswords.new} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Confirm New Password</label>

                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className={passwordInputClass}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                    />

                    <button
                      type="button"
                      onClick={() => togglePassword('confirm')}
                      aria-label="Toggle confirm password visibility"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#00F0FF]"
                    >
                      <EyeIcon visible={showPasswords.confirm} />
                    </button>
                  </div>
                </div>

                {passwordError && (
                  <p className="text-[#FF5500] text-sm">{passwordError}</p>
                )}

                {passwordMessage && (
                  <p className="text-[#CCFF00] text-sm">{passwordMessage}</p>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-[#FF5500] text-white font-bold px-8 py-3 rounded-lg hover:opacity-80 disabled:opacity-50"
                >
                  {passwordLoading ? 'UPDATING...' : 'UPDATE PASSWORD'}
                </button>

              </form>
            </section>

          </>
        )}

        {/* MY ORDERS TAB */}

        {activeTab === 'orders' && (
          <section className="bg-[#181A20] border border-white/10 rounded-2xl p-6 md:p-8">

            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold">My Orders</h2>
                <p className="text-[#94A3B8] text-sm mt-2">
                  View your purchases, upload EFT proof and track your orders.
                </p>
              </div>

              <span className="text-[#00F0FF] font-bold">
                {orders.length} {orders.length === 1 ? 'ORDER' : 'ORDERS'}
              </span>
            </div>

            {ordersLoading ? (
              <p className="text-[#94A3B8]">Loading your orders...</p>
            ) : ordersError ? (
              <p className="text-[#FF5500]">{ordersError}</p>
            ) : orders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[#94A3B8] mb-4">
                  You haven't placed any orders yet.
                </p>

                <Link
                  to="/shop"
                  className="inline-block bg-[#00F0FF] text-[#0B0C10] font-bold px-6 py-3 rounded-lg"
                >
                  START SHOPPING
                </Link>
              </div>
            ) : (
              <div className="space-y-4">

                {orders.map((order) => {
                  const canUploadProof =
                    order.paymentMethod === 'manual' &&
                    order.paymentStatus === 'pending' &&
                    order.orderStatus !== 'cancelled'

                  return (
                    <div
                      key={order._id}
                      className="border border-white/10 rounded-xl p-5"
                    >

                      <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">

                        <div>
                          <p className="font-bold">
                            Order #{order._id.slice(-8).toUpperCase()}
                          </p>

                          <p className="text-[#94A3B8] text-sm mt-1">
                            {new Date(order.createdAt).toLocaleDateString('en-ZA')}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">

  <span className="bg-[#0B0C10] border border-[#00F0FF]/30 text-[#00F0FF] px-3 py-2 rounded-lg text-xs font-bold uppercase">
    ORDER: {order.orderStatus}
  </span>

  <span className={`bg-[#0B0C10] border px-3 py-2 rounded-lg text-xs font-bold uppercase ${
    order.paymentStatus === 'paid'
      ? 'border-[#CCFF00]/30 text-[#CCFF00]'
      : 'border-[#FF5500]/30 text-[#FF5500]'
  }`}>
    PAYMENT: {order.paymentStatus}
  </span>

</div>
                      </div>

                      <div className="space-y-2 mb-4">

                        {order.items.map((item, index) => (
                          <div
                            key={`${item.product || item.name}-${index}`}
                            className="flex justify-between text-sm gap-4"
                          >
                            <span className="text-[#94A3B8]">
                              {item.name} × {item.quantity}
                              {item.size && ` | Size: ${item.size}`}
                              {item.color && ` | Colour: ${item.color}`}
                            </span>

                            <span className="whitespace-nowrap">
                              R{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}

                      </div>

                      <div className="border-t border-white/10 pt-4 flex justify-between font-bold">
                        <span>Order Total</span>

                        <span className="text-[#00F0FF]">
                          R{Number(order.totalAmount).toFixed(2)}
                        </span>
                      </div>

                      {/* EFT PROOF OF PAYMENT */}

                      {canUploadProof && (
                        <div className="mt-5 border-t border-white/10 pt-5">

                          <h3 className="font-bold text-lg mb-2">
                            EFT Proof of Payment
                          </h3>

                          <p className="text-[#94A3B8] text-sm mb-4">
                            Upload your payment confirmation so we can verify your deposit.
                            Accepted formats: JPG, PNG or PDF. Maximum size: 5 MB.
                          </p>

                          {order.proofOfPayment?.originalName ? (
                            <div className="bg-[#0B0C10] rounded-lg p-4 mb-4">
                              <p className="text-[#CCFF00] text-sm font-bold mb-2">
                                Proof submitted
                              </p>

                              <p className="text-white text-sm break-all">
                                {order.proofOfPayment.originalName}
                              </p>

                              {order.proofOfPayment.uploadedAt && (
                                <p className="text-[#94A3B8] text-xs mt-2">
                                  Uploaded: {new Date(
                                    order.proofOfPayment.uploadedAt
                                  ).toLocaleString('en-ZA')}
                                </p>
                              )}

                              <p className="text-[#94A3B8] text-xs mt-2">
                                Awaiting payment verification.
                              </p>
                            </div>
                          ) : (
                            <p className="text-[#FF5500] text-sm mb-4">
                              No proof of payment has been uploaded yet.
                            </p>
                          )}

                          <form
                            onSubmit={(e) => handleProofUpload(e, order._id)}
                            className="space-y-4"
                          >

                            <div>
                              <label className={labelClass}>
                                {order.proofOfPayment?.originalName
                                  ? 'Choose replacement proof'
                                  : 'Choose proof of payment'}
                              </label>

                              <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                                onChange={(e) =>
                                  handleProofFileChange(
                                    order._id,
                                    e.target.files?.[0] || null
                                  )
                                }
                                className="block w-full text-sm text-[#94A3B8] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#00F0FF] file:text-[#0B0C10] file:font-bold hover:file:opacity-80"
                              />
                            </div>

                            {proofFiles[order._id] && (
                              <p className="text-[#94A3B8] text-sm">
                                Selected: {proofFiles[order._id].name}
                              </p>
                            )}

                            {proofErrors[order._id] && (
                              <p className="text-[#FF5500] text-sm">
                                {proofErrors[order._id]}
                              </p>
                            )}

                            {proofMessages[order._id] && (
                              <p className="text-[#CCFF00] text-sm">
                                {proofMessages[order._id]}
                              </p>
                            )}

                            <button
                              type="submit"
                              disabled={
                                proofLoading[order._id] ||
                                !proofFiles[order._id]
                              }
                              className="bg-[#FF5500] text-white font-bold px-6 py-3 rounded-lg hover:opacity-80 disabled:opacity-50"
                            >
                              {proofLoading[order._id]
                                ? 'UPLOADING...'
                                : order.proofOfPayment?.originalName
                                  ? 'REPLACE PROOF OF PAYMENT'
                                  : 'UPLOAD PROOF OF PAYMENT'}
                            </button>

                          </form>
                        </div>
                      )}

                      {order.paymentMethod === 'manual' &&
                        order.paymentStatus === 'paid' && (
                          <p className="text-[#CCFF00] text-sm mt-5 border-t border-white/10 pt-4">
                            Your EFT payment has been verified.
                          </p>
                        )}

                    </div>
                  )
                })}

              </div>
            )}

          </section>
        )}

        {/* ACCOUNT ACTIONS */}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">

          <Link
            to="/"
            className="text-[#00F0FF] hover:underline"
          >
            ← Continue Shopping
          </Link>

          <button
            onClick={handleLogout}
            className="border border-[#FF5500] text-[#FF5500] px-8 py-3 rounded-lg font-bold hover:bg-[#FF5500] hover:text-white"
          >
            LOG OUT
          </button>

        </div>

      </div>
    </main>
  )
}

export default Account
