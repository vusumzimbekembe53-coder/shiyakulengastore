
const express = require('express')
const upload = require('../middleware/uploadMiddleware')

const {
  getProducts,
  getFeaturedProducts,
  getAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController')

const { protect, adminOnly } = require('../middleware/authMiddleware')

const router = express.Router()

// Public product listing
router.get('/', getProducts)
router.get('/featured', getFeaturedProducts)


// Admin-only product management
router.get('/admin/all', protect, adminOnly, getAdminProducts)
router.post('/', protect, adminOnly, upload.single('image'), addProduct)
router.put('/:id', protect, adminOnly, upload.single('image'), updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = router
