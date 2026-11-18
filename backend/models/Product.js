
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    required: true
  },

  image: {
    type: String,
    required: true
  },

  
  sizes: [{ type: String }],
colors: [{ type: String }],

  stock: {
    type: Number,
    default: 0,
    min: 0
  },

  isActive: {
    type: Boolean,
    default: true
  },

  isFeatured: { type: Boolean, default: false }

}, {
  timestamps: true
})

module.exports = mongoose.model('Product', productSchema)
