
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { sendEmail } = require('../config/email')

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  emailVerified: user.emailVerified,
  phone: user.phone,
  address: user.address,
  addressLine2: user.addressLine2,
  city: user.city,
  province: user.province,
  postalCode: user.postalCode,
  role: user.role
})

const escapeHtml = (value) => {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// SEND EMAIL VERIFICATION
const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`

  return sendEmail({
    to: user.email,
    subject: 'Verify Your Shiya Kulenga Email',
    html: `
      <div style="background:#0B0C10;padding:35px 20px;font-family:Arial,sans-serif;color:#FFFFFF;">
        <div style="max-width:550px;margin:auto;background:#181A20;padding:35px;border-radius:10px;">
          <h1 style="color:#00F0FF;text-align:center;letter-spacing:2px;">SHIYA KULENGA</h1>
          <p style="color:#94A3B8;text-align:center;">STYLE FOR EVERY YOU</p>

          <h2>Welcome, ${escapeHtml(user.name)}!</h2>

          <p>Thank you for creating a Shiya Kulenga account.</p>

          <p>Please verify your email address by clicking the button below.</p>

          <div style="text-align:center;margin:30px 0;">
            <a href="${verificationUrl}"
              style="background:#00F0FF;color:#0B0C10;padding:14px 25px;text-decoration:none;font-weight:bold;border-radius:5px;">
              VERIFY MY EMAIL
            </a>
          </div>

          <p style="color:#94A3B8;">
            This verification link expires in 15 minutes.
          </p>

          <p style="color:#94A3B8;">
            If you did not create this account, you can ignore this email.
          </p>

          <p style="color:#94A3B8;text-align:center;font-size:12px;">
            © ${new Date().getFullYear()} Shiya Kulenga
          </p>
        </div>
      </div>
    `
  })
}

// CUSTOMER REGISTRATION
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields.'
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingUser = await User.findOne({
      email: normalizedEmail
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: 'customer',
      emailVerified: false,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: Date.now() + 15 * 60 * 1000
    })

    const emailSent = await sendVerificationEmail(user, verificationToken)

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Your account was created, but we could not send the verification email. Please try again later.'
      })
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account before logging in.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed.',
      error: error.message
    })
  }
}

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is missing.'
      })
    }

    const hashedToken = hashToken(token)

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Verification link is invalid or has expired.'
      })
    }

    user.emailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationExpires = null

    await user.save()

    res.json({
      success: true,
      message: 'Email verified successfully. You can now log in.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Email verification failed.'
    })
  }
}


// RESEND VERIFICATION EMAIL
const resendVerification = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim()

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      })
    }

    const user = await User.findOne({ email })

    // Use a general response to avoid revealing account details.
    if (!user || user.emailVerified) {
      return res.json({
        success: true,
        message: 'If your account requires verification, a new email will be sent.'
      })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')

    user.emailVerificationToken = hashToken(verificationToken)
    user.emailVerificationExpires = Date.now() + 15 * 60 * 1000

    await user.save({ validateBeforeSave: false })

    const emailSent = await sendVerificationEmail(user, verificationToken)

    if (!emailSent) {
      user.emailVerificationToken = null
      user.emailVerificationExpires = null

      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        message: 'Unable to send the verification email. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'A new verification email has been sent. Please check your inbox.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Could not resend verification email.'
    })
  }
}
// USER LOGIN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email and password.'
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    })

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      })
    }

    if (user.role === 'customer' && !user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in.'
      })
    }

    res.json({
      success: true,
      message: 'Login successful.',
      token: generateToken(user),
      user: safeUser(user)
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message
    })
  }
}

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim()

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address.'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with that email, a reset link will be sent.'
      })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')

    user.passwordResetToken = hashToken(resetToken)
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`

    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Reset Your Shiya Kulenga Password',
      html: `
        <div style="background:#0B0C10;padding:35px 20px;font-family:Arial,sans-serif;color:#FFFFFF;">
          <div style="max-width:550px;margin:auto;background:#181A20;padding:35px;border-radius:10px;">
            <h1 style="color:#00F0FF;text-align:center;">SHIYA KULENGA</h1>
            <h2>Password Reset Request</h2>
            <p>Hello ${escapeHtml(user.name)},</p>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to create a new password. This link expires in 15 minutes.</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${resetUrl}"
                style="background:#00F0FF;color:#0B0C10;padding:14px 25px;text-decoration:none;font-weight:bold;border-radius:5px;">
                RESET MY PASSWORD
              </a>
            </div>
            <p style="color:#94A3B8;">If you did not request this change, you can ignore this email.</p>
            <p style="color:#94A3B8;">© ${new Date().getFullYear()} Shiya Kulenga</p>
          </div>
        </div>
      `
    })

    if (!emailSent) {
      user.passwordResetToken = null
      user.passwordResetExpires = null
      await user.save({ validateBeforeSave: false })

      return res.status(500).json({
        success: false,
        message: 'Unable to send the reset email. Please try again.'
      })
    }

    res.json({
      success: true,
      message: 'If an account exists with that email, a reset link will be sent.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset request failed.'
    })
  }
}

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters.'
      })
    }

    const hashedToken = hashToken(token)

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Reset link is invalid or has expired.'
      })
    }

    user.password = password
    user.passwordResetToken = null
    user.passwordResetExpires = null

    await user.save()

    res.json({
      success: true,
      message: 'Password reset successfully. You can now log in.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password reset failed.'
    })
  }
}

// UPDATE CUSTOMER PROFILE
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found.'
      })
    }

    const previousEmail = user.email

    const allowedFields = [
      'name',
      'email',
      'phone',
      'address',
      'addressLine2',
      'city',
      'province',
      'postalCode'
    ]

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field]
      }
    }

    if (!user.name || !user.email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required.'
      })
    }

    user.email = user.email.toLowerCase().trim()

    const existingEmail = await User.findOne({
      email: user.email,
      _id: { $ne: user._id }
    })

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already in use.'
      })
    }

    const emailChanged = user.email !== previousEmail

    let verificationToken = null

    if (emailChanged) {
      verificationToken = crypto.randomBytes(32).toString('hex')

      user.emailVerified = false
      user.emailVerificationToken = hashToken(verificationToken)
      user.emailVerificationExpires = Date.now() + 15 * 60 * 1000
    }

    await user.save()

    if (emailChanged) {
      await sendVerificationEmail(user, verificationToken)
    }

    res.json({
      success: true,
      message: emailChanged
        ? 'Profile updated. Please verify your new email address before logging in again.'
        : 'Profile updated successfully.',
      user: safeUser(user)
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Profile update failed.',
      error: error.message
    })
  }
}

// CHANGE CUSTOMER PASSWORD
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current and new password.'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.'
      })
    }

    const user = await User.findById(req.user.id)

    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer account not found.'
      })
    }

    const passwordMatches = await user.comparePassword(currentPassword)

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Your current password is incorrect.'
      })
    }

    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Password change failed.',
      error: error.message
    })
  }
}


const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your current and new password.'
      })
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters.'
      })
    }

    const user = await User.findById(req.user.id)

    if (!user || user.role !== 'admin') {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      })
    }

    const passwordMatches = await user.comparePassword(currentPassword)

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Your current admin password is incorrect.'
      })
    }

    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Admin password changed successfully.'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Admin password change failed.'
    })
  }
}


// ADMIN: VIEW ALL CUSTOMERS
const getAdminCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: 'customer' })
      .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires')
      .sort({ createdAt: -1 })
      .lean()

    res.json({
      success: true,
      customers
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers.',
      error: error.message
    })
  }
}

module.exports = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  changeAdminPassword,
  getAdminCustomers
}