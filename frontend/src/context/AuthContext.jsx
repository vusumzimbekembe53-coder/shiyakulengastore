
import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('shiya-user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [token, setToken] = useState(() => {
    return localStorage.getItem('shiya-token') || null
  })

  const login = async (email, password) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Login failed')
    }

    localStorage.setItem('shiya-token', data.token)
    localStorage.setItem('shiya-user', JSON.stringify(data.user))

    setToken(data.token)
    setUser(data.user)

    return data.user
  }

  const logout = () => {
    localStorage.removeItem('shiya-token')
    localStorage.removeItem('shiya-user')

    setToken(null)
    setUser(null)
  }

    const updateUser = (updatedUser) => {
  localStorage.setItem('shiya-user', JSON.stringify(updatedUser))
  setUser(updatedUser)
}

  return (
    <AuthContext.Provider
      value={{
  user,
  token,
  login,
  logout,
  updateUser,
  isLoggedIn: Boolean(token && user),
  isAdmin: user?.role === 'admin'
}}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
