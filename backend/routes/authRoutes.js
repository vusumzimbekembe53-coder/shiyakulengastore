
const express = require('express')
const router = express.Router()

const {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  changeAdminPassword,
  getAdminCustomers
} = require('../controllers/authController')

const {
  protect,
  adminOnly,
  customerOnly
} = require('../middleware/authMiddleware')

// PUBLIC AUTH ROUTES
router.post('/register', registerUser)
router.post('/login', loginUser)

// EMAIL VERIFICATION
router.get('/verify-email/:token', verifyEmail)
router.post('/resend-verification', resendVerification)

// PASSWORD RESET
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

// CUSTOMER PROFILE
router.put('/profile', protect, customerOnly, updateProfile)
router.put('/change-password', protect, customerOnly, changePassword)

// ADMIN PASSWORD
router.put('/admin/change-password', protect, adminOnly, changeAdminPassword)

// ADMIN CUSTOMERS
router.get('/admin/customers', protect, adminOnly, getAdminCustomers)

module.exports = router
