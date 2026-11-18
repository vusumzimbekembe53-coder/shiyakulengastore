
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendMessage('')
    setLoading(true)

    try {
      const user = await login(email, password)

      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setError('')
    setResendMessage('')

    if (!email.trim()) {
      setError('Please enter your email address first.')
      return
    }

    setResending(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/resend-verification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not resend verification email.')
      }

      setResendMessage(data.message)

    } catch (err) {
      setError(err.message || 'Could not resend verification email.')
    } finally {
      setResending(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black">
            SHIYA<span className="text-[#00F0FF]"> KULENGA.</span>
          </Link>

          <p className="text-[#94A3B8] text-xs tracking-[4px] mt-4">
            STYLE FOR EVERY YOU
          </p>
        </div>

        <div className="bg-[#181A20] border border-white/10 rounded-2xl p-8">

          <p className="text-[#FF5500] text-xs font-bold tracking-[4px] mb-3">
            YOUR ACCOUNT
          </p>

          <h1 className="text-3xl font-black">
            WELCOME BACK.
          </h1>

          <p className="text-[#94A3B8] text-sm mt-3 mb-8">
            Sign in to access your Shiya Kulenga account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {location.state?.message && (
              <p className="text-[#CCFF00] text-sm">
                {location.state.message}
              </p>
            )}

            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                EMAIL ADDRESS
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoComplete="username"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#00F0FF]"
              />
            </div>

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
                  className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 pr-20 outline-none focus:border-[#00F0FF]"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00F0FF] text-xs font-bold"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              <div className="text-right mt-3">
                <Link
                  to="/forgot-password"
                  className="text-[#00F0FF] text-xs font-bold hover:text-white transition"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            {error && (
              <p className="text-[#FF5500] text-sm">
                {error}
              </p>
            )}

            {resendMessage && (
              <p className="text-[#CCFF00] text-sm">
                {resendMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F0FF] text-[#0B0C10] py-4 rounded-lg font-black text-xs tracking-[3px] hover:bg-white transition disabled:opacity-50"
            >
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>

          </form>

          <div className="border-t border-white/10 mt-6 pt-6 text-center">
            <p className="text-[#94A3B8] text-sm mb-3">
              Haven't verified your email yet?
            </p>

            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="text-[#00F0FF] text-xs font-bold hover:text-white transition disabled:opacity-50"
            >
              {resending ? 'SENDING...' : 'RESEND VERIFICATION EMAIL'}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#94A3B8] text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#00F0FF] font-bold hover:text-white transition"
              >
                Sign up
              </Link>
            </p>

            <div className="border-t border-white/10 mt-6 pt-6">
              <Link
                to="/"
                className="text-[#94A3B8] text-xs hover:text-[#00F0FF]"
              >
                ← BACK TO STORE
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Login
