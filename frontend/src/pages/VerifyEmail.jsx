import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const VerifyEmail = () => {
  const { token } = useParams()

  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/verify-email/${token}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Email verification failed.')
        }

        setMessage(data.message)
        setSuccess(true)
      } catch (error) {
        setMessage(error.message)
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#181A20] p-8 rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-4">
          Email Verification
        </h1>

        {loading ? (
          <p className="text-[#94A3B8]">
            Verifying your email address...
          </p>
        ) : (
          <>
            <p className={success ? 'text-[#CCFF00]' : 'text-[#FF5500]'}>
              {message}
            </p>

            {success && (
              <Link
                to="/login"
                className="inline-block mt-6 bg-[#00F0FF] text-[#0B0C10] font-semibold px-6 py-3 rounded-lg"
              >
                Go to Login
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail