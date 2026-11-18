
const express = require('express')
const router = express.Router()

const {
  createOrder,
  uploadProofOfPayment,
  getMyOrders,
  getAllOrders,
  getProofOfPayment,
  getAdminOverview,
  verifyOrderPayment,
  updateOrderStatus
} = require('../controllers/orderController')

const proofUpload = require('../middleware/proofUploadMiddleware')

const {
  protect,
  adminOnly,
  customerOnly
} = require('../middleware/authMiddleware')

// CUSTOMER ROUTES
router.post('/', protect, customerOnly, createOrder)
router.get('/my-orders', protect, customerOnly, getMyOrders)

router.post(
  '/:id/proof-of-payment',
  protect,
  customerOnly,
  proofUpload.single('proof'),
  uploadProofOfPayment
)

// ADMIN ROUTES
router.get('/admin/overview', protect, adminOnly, getAdminOverview)
router.get('/admin/all', protect, adminOnly, getAllOrders)

router.get(
  '/admin/:id/proof-of-payment',
  protect,
  adminOnly,
  getProofOfPayment
)

router.put(
  '/admin/:id/verify-payment',
  protect,
  adminOnly,
  verifyOrderPayment
)

router.put(
  '/admin/:id/status',
  protect,
  adminOnly,
  updateOrderStatus
)

module.exports = router
