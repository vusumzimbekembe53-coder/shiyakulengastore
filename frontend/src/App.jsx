
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import InfoPage from './pages/InfoPage'
import Product from './pages/Product'
import AdminDashboard from './pages/AdminDashboard'
import Shop from './pages/Shop'
import Home from './pages/Home'
import Account from './pages/Account'
import Cart from './pages/Cart'
import Register from './pages/Register'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AdminLogin from './pages/AdminLogin'
import AdminProducts from './pages/AdminProducts'
import AdminOrders from './pages/AdminOrders'
import AdminCustomers from './pages/AdminCustomers'
import About from './pages/About'
import Contact from './pages/Contact'
import OrderConfirmation from './pages/OrderConfirmation'
import Checkout from './pages/Checkout'
import VerifyEmail from './pages/VerifyEmail'

// ADMIN ROUTE PROTECTION
const AdminRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()

  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

// CUSTOMER ROUTE PROTECTION
const CustomerRoute = ({ children }) => {
  const { isLoggedIn, isAdmin } = useAuth()

  if (!isLoggedIn || isAdmin) {
    return <Navigate to="/login" replace />
  }

  return children
}

// MAIN APPLICATION ROUTES
const AppRoutes = () => {
  return (
    <Routes>

      {/* HOMEPAGE */}
      <Route
        path="/"
        element={<><Navbar /><Home /><Footer /></>}
      />

      {/* SHOP */}
      <Route
        path="/shop"
        element={<><Navbar /><Shop /><Footer /></>}
      />

      {/* PRODUCT DETAILS */}
      <Route
        path="/product/:id"
        element={<><Navbar /><Product /><Footer /></>}
      />

      {/* STORE PAGES */}
      <Route
        path="/our-story"
        element={<><Navbar /><About /><Footer /></>}
      />

      <Route
        path="/contact"
        element={<><Navbar /><Contact /><Footer /></>}
      />

      {/* INFORMATION PAGES */}
      <Route
        path="/shipping"
        element={<><Navbar /><InfoPage /><Footer /></>}
      />

      <Route
  path="/verify-email/:token"
  element={<><Navbar /><VerifyEmail /><Footer /></>}
/>

      <Route
        path="/returns"
        element={<><Navbar /><InfoPage /><Footer /></>}
      />

      <Route
        path="/privacy"
        element={<><Navbar /><InfoPage /><Footer /></>}
      />

      {/* SHOPPING CART */}
      <Route
        path="/cart"
        element={<><Navbar /><Cart /><Footer /></>}
      />

      {/* CUSTOMER AUTHENTICATION */}
      <Route
        path="/login"
        element={<><Navbar /><Login /><Footer /></>}
      />

      <Route
        path="/register"
        element={<><Navbar /><Register /><Footer /></>}
      />

      {/* PASSWORD RESET */}
      <Route
        path="/forgot-password"
        element={<><Navbar /><ForgotPassword /><Footer /></>}
      />

      <Route
        path="/reset-password/:token"
        element={<><Navbar /><ResetPassword /><Footer /></>}
      />

      {/* CUSTOMER ACCOUNT */}
      <Route
        path="/account"
        element={
          <CustomerRoute>
            <>
              <Navbar />
              <Account />
              <Footer />
            </>
          </CustomerRoute>
        }
      />

      {/* CHECKOUT */}
      <Route
        path="/checkout"
        element={
          <CustomerRoute>
            <>
              <Navbar />
              <Checkout />
              <Footer />
            </>
          </CustomerRoute>
        }
      />

      {/* ORDER CONFIRMATION */}
      <Route
        path="/order-confirmation"
        element={
          <CustomerRoute>
            <>
              <Navbar />
              <OrderConfirmation />
              <Footer />
            </>
          </CustomerRoute>
        }
      />

      {/* ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />

      {/* ADMIN DASHBOARD */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* ADMIN ORDERS */}
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminOrders />
          </AdminRoute>
        }
      />

      {/* ADMIN PRODUCTS */}
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        }
      />

      {/* ADMIN CUSTOMERS */}
      <Route
        path="/admin/customers"
        element={
          <AdminRoute>
            <AdminCustomers />
          </AdminRoute>
        }
      />

      {/* UNKNOWN URL */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  )
}

// MAIN APP
const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
