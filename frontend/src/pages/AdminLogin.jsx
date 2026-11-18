
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login, logout } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const loggedInUser = await login(email, password)

      if (loggedInUser.role !== 'admin') {
        logout()
        throw new Error('Access denied. Admin accounts only.')
      }

      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Unable to log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-6 py-16">

      <div className="w-full max-w-md">

        {/* BRAND */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-black tracking-tight">
              SHIYA<span className="text-[#00F0FF]"> KULENGA.</span>
            </h1>
          </Link>

          <p className="text-[#00F0FF] text-xs font-bold tracking-[5px] mt-4">
            ADMINISTRATION PORTAL
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-8 sm:p-10">

          <div className="mb-8">
            <p className="text-[#FF5500] text-xs font-black tracking-[4px] mb-3">
              WELCOME BACK
            </p>

            <h2 className="text-3xl font-black">
              ADMIN LOGIN.
            </h2>

            <p className="text-gray-400 text-sm mt-3 leading-6">
              Sign in to manage your products, orders and Shiya Kulenga store.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                required
                autoComplete="username"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 text-white outline-none focus:border-[#00F0FF] transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                PASSWORD
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 pr-20 text-white outline-none focus:border-[#00F0FF] transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00F0FF] text-xs font-bold"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-4 rounded-lg">
                {error}
              </div>
            )}

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F0FF] text-[#0B0C10] py-4 rounded-lg font-black text-xs tracking-[3px] hover:bg-white transition disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN TO DASHBOARD'}
            </button>

          </form>

          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <Link
              to="/"
              className="text-gray-400 text-xs hover:text-[#00F0FF] transition"
            >
              ← BACK TO STORE
            </Link>
          </div>

        </div>

        <p className="text-center text-gray-600 text-xs mt-8">
          SHIYA KULENGA © 2026. ADMIN ACCESS ONLY.
        </p>

      </div>
    </main>
  )
}

export default AdminLogin
