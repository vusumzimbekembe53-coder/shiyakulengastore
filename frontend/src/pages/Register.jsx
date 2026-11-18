
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const Register = () => {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Your passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed.')
      }

      navigate('/login', {
        state: { message: 'Your account has been created. Please sign in.' }
      })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
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
            JOIN THE MOVEMENT
          </p>

          <h1 className="text-3xl font-black">
            CREATE ACCOUNT.
          </h1>

          <p className="text-[#94A3B8] text-sm mt-3 mb-8">
            Create your Shiya Kulenga account and start shopping.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                FULL NAME
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoComplete="name"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#00F0FF]"
              />
            </div>

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
                autoComplete="email"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                PASSWORD
              </label>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold tracking-widest mb-3">
                CONFIRM PASSWORD
              </label>

              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                autoComplete="new-password"
                className="w-full bg-[#0B0C10] border border-white/10 rounded-lg px-4 py-4 outline-none focus:border-[#00F0FF]"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-[#94A3B8]">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="accent-[#00F0FF]"
              />
              Show passwords
            </label>

            {error && (
              <p className="text-[#FF5500] text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F0FF] text-[#0B0C10] py-4 rounded-lg font-black text-xs tracking-[3px] hover:bg-white transition disabled:opacity-50"
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>

          </form>

          <div className="border-t border-white/10 mt-8 pt-6 text-center">
            <p className="text-[#94A3B8] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00F0FF] font-bold hover:text-white">
                Sign in
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}

export default Register
