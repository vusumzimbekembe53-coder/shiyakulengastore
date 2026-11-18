
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    default: '',
    trim: true
  },

  address: {
    type: String,
    default: '',
    trim: true
  },

  addressLine2: {
    type: String,
    default: '',
    trim: true
  },

  city: {
    type: String,
    default: '',
    trim: true
  },

  province: {
    type: String,
    default: '',
    trim: true
  },

  postalCode: {
    type: String,
    default: '',
    trim: true
  },

  password: {
    type: String,
    required: true,
    minlength: 8
  },

  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },

  // EMAIL VERIFICATION
  emailVerified: {
    type: Boolean,
    default: true
  },

  emailVerificationToken: {
    type: String,
    default: null
  },

  emailVerificationExpires: {
    type: Date,
    default: null
  },

  // PASSWORD RESET
  passwordResetToken: {
    type: String,
    default: null
  },

  passwordResetExpires: {
    type: Date,
    default: null
  }

}, { timestamps: true })

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
