
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      setMessage(data.message)
      setEmail('')

    } catch (err) {
      setError(err.message || 'Unable to process your request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#181A20] border border-white/10 rounded-2xl p-8">

        <h1 className="text-3xl font-black text-center mb-3">
          FORGOT <span className="text-[#00F0FF]">PASSWORD?</span>
        </h1>

        <p className="text-[#94A3B8] text-center text-sm mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] p-3 rounded-lg text-sm mb-5">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-[#FF5500]/10 border border-[#FF5500]/30 text-[#FF5500] p-3 rounded-lg text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00F0FF] text-[#0B0C10] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'SENDING...' : 'SEND RESET LINK'}
          </button>

        </form>

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-[#00F0FF] text-sm hover:underline"
          >
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword
