
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const authRoutes = require('./routes/authRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')

const app = express()

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// API Routes
app.use('/api/products', productRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/orders', orderRoutes)

// Home route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Shiya Kulenga API is running!'
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy'
  })
})

// Server and database connection
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully')

    app.listen(PORT, () => {
      console.log(`Shiya Kulenga API running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  })
