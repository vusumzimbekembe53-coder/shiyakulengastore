
import React, { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setMessage('')
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ password })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to reset password.')
      }

      setMessage(data.message)
      setPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        navigate('/login')
      }, 2500)

    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-[#181A20] border border-white/10 rounded-2xl p-8">

        <h1 className="text-3xl font-black text-center mb-3">
          RESET <span className="text-[#00F0FF]">PASSWORD</span>
        </h1>

        <p className="text-[#94A3B8] text-center text-sm mb-8">
          Create a new password for your Shiya Kulenga account.
        </p>

        {message && (
          <div className="bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] p-3 rounded-lg text-sm mb-5">
            {message}
            <p className="mt-2">Redirecting you to login...</p>
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
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              minLength={8}
              required
              autoComplete="new-password"
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <div>
            <label className="block text-sm mb-2">
              Confirm New Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-[#00F0FF]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!message}
            className="w-full bg-[#00F0FF] text-[#0B0C10] font-bold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'UPDATING...' : 'RESET PASSWORD'}
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

export default ResetPassword
