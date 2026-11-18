
const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },

    name: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    size: {
      type: String,
      default: ''
    },

    color: {
      type: String,
      default: ''
    }
  }],

  totalAmount: {
    type: Number,
    required: true
  },

  subtotal: {
    type: Number,
    required: true
  },

  deliveryFee: {
    type: Number,
    required: true,
    default: 100
  },

  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    addressLine2: { type: String, default: '' },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String, required: true }
  },

  proofOfPayment: {
    url: {
      type: String,
      default: null
    },
    publicId: {
      type: String,
      default: null
    },
    originalName: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    },
    resourceType: {
  type: String,
  enum: ['image', 'raw'],
  default: null
},
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  paymentReference: {
    type: String,
    default: null
  },

  paymentMethod: {
    type: String,
    enum: ['payfast', 'manual'],
    default: 'manual'
  },

  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  }

}, {
  timestamps: true
})

module.exports = mongoose.model('Order', orderSchema)
