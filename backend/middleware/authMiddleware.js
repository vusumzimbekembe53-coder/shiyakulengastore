
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Verify logged-in user
const protect = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorised. Please log in.'
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      })
    }

    req.user = user
    next()

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    })
  }
}

// Allow administrators only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Administrators only.'
  })
}

// Allow customers only
const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Customer accounts only.'
  })
}

module.exports = {
  protect,
  adminOnly,
  customerOnly
}
