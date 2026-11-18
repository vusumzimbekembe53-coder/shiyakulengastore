
const mongoose = require('mongoose')
const path = require('path')
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')
const { sendEmail } = require('../config/email')

const escapeHtml = (value) => {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])
}

const formatMoney = (amount) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  }).format(amount)
}

// CHECK THE ACTUAL FILE CONTENT
const validateProofFile = (file) => {
  if (!file || !file.buffer) {
    return false
  }

  const buffer = file.buffer

  if (
    file.mimetype === 'image/jpeg' &&
    buffer.length >= 3 &&
    buffer[0] === 0xFF &&
    buffer[1] === 0xD8 &&
    buffer[2] === 0xFF
  ) {
    return true
  }

  if (
    file.mimetype === 'image/png' &&
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])
    )
  ) {
    return true
  }

  if (
    file.mimetype === 'application/pdf' &&
    buffer.subarray(0, 5).toString() === '%PDF-'
  ) {
    return true
  }

  return false
}

// UPLOAD PROOF TO CLOUDINARY AS AN AUTHENTICATED FILE
const uploadProofToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const isPdf = file.mimetype === 'application/pdf'

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'shiya-kulenga/proof-of-payment',
        resource_type: isPdf ? 'raw' : 'image',
        type: 'authenticated'
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    streamifier.createReadStream(file.buffer).pipe(stream)
  })
}

// DELETE A CLOUDINARY PROOF
const deleteCloudinaryProof = async (publicId, resourceType) => {
  if (!publicId) return

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      type: 'authenticated'
    })
  } catch (error) {
    console.error('Cloudinary proof deletion error:', error.message)
  }
}


// CUSTOMER: PLACE MANUAL EFT ORDER
const createOrder = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const { items, shippingAddress } = req.body
    const deliveryFee = 100

    if (!Array.isArray(items) || items.length === 0 || !shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide products and delivery details.'
      })
    }

    const requiredFields = [
      'fullName',
      'email',
      'phone',
      'address',
      'city',
      'province',
      'postalCode'
    ]

    for (const field of requiredFields) {
      if (
        typeof shippingAddress[field] !== 'string' ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Please provide your ${field}.`
        })
      }
    }

    let createdOrder

    await session.withTransaction(async () => {
      const orderItems = []
      let subtotal = 0

      for (const item of items) {
        const quantity = Number(item.quantity)

        if (
          !mongoose.Types.ObjectId.isValid(item.product) ||
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          throw new Error('Invalid product or quantity.')
        }

        const product = await Product.findOne({
          _id: item.product,
          isActive: true
        }).session(session)

        if (!product) {
          throw new Error('A selected product is unavailable.')
        }

        const validSize = !item.size ||
          !product.sizes?.length ||
          product.sizes.includes(item.size)

        const validColor = !item.color ||
          !product.colors?.length ||
          product.colors.includes(item.color)

        if (!validSize || !validColor) {
          throw new Error(`Invalid size or colour for ${product.name}.`)
        }

        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity },
            isActive: true
          },
          {
            $inc: { stock: -quantity }
          },
          {
            new: true,
            session
          }
        )

        if (!updatedProduct) {
          throw new Error(`Not enough stock for ${product.name}.`)
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          size: item.size || '',
          color: item.color || ''
        })

        subtotal += product.price * quantity
      }

      const totalAmount = Number(
        (subtotal + deliveryFee).toFixed(2)
      )

      const orders = await Order.create([{
        customer: req.user._id,
        items: orderItems,
        subtotal,
        deliveryFee,
        totalAmount,
        shippingAddress,
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        orderStatus: 'processing'
      }], { session })

      createdOrder = orders[0]
    })

    const address = createdOrder.shippingAddress
    const orderReference = createdOrder._id.toString()

    const itemRows = createdOrder.items.map((item) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #333;">
          <strong>${escapeHtml(item.name)}</strong><br>
          <span style="color:#94A3B8;font-size:13px;">
            Size: ${escapeHtml(item.size || 'N/A')}
            | Colour: ${escapeHtml(item.color || 'N/A')}
            | Quantity: ${item.quantity}
          </span>
        </td>
        <td style="padding:12px;text-align:right;">
          ${formatMoney(item.price * item.quantity)}
        </td>
      </tr>
    `).join('')

    // CUSTOMER ORDER EMAIL
    try {
      await sendEmail({
        to: address.email,
        subject: `Order Received - ${orderReference}`,
        html: `
          <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
            <div style="max-width:600px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

              <h1 style="color:#00F0FF;text-align:center;">
                SHIYA KULENGA
              </h1>

              <p style="color:#94A3B8;text-align:center;">
                STYLE FOR EVERY YOU
              </p>

              <h2>Hello ${escapeHtml(address.fullName)}!</h2>

              <p>
                Thank you for shopping with Shiya Kulenga.
                Your order has been received successfully.
              </p>

              <p style="color:#FF5500;">
                PAYMENT STATUS: AWAITING EFT PAYMENT
              </p>

              <p>
                <strong>Order reference:</strong>
                ${escapeHtml(orderReference)}
              </p>

              <h3>YOUR ORDER</h3>

              <table style="width:100%;border-collapse:collapse;color:#FFFFFF;">
                ${itemRows}
              </table>

              <p>Subtotal: ${formatMoney(createdOrder.subtotal)}</p>
              <p>Delivery: ${formatMoney(createdOrder.deliveryFee)}</p>

              <h2 style="color:#00F0FF;">
                Total: ${formatMoney(createdOrder.totalAmount)}
              </h2>

              <div style="background:#0B0C10;padding:20px;border-radius:8px;">
                <h3 style="color:#00F0FF;">EFT PAYMENT DETAILS</h3>

                <p>Account holder: To be updated</p>
                <p>Bank: To be updated</p>
                <p>Account number: To be updated</p>
                <p>Branch code: To be updated</p>

                <p>
                  <strong>Payment reference:</strong>
                  ${escapeHtml(orderReference)}
                </p>

                <p style="color:#FF5500;">
                  Banking details are coming soon.
                  Please wait for our official banking details
                  before making payment.
                </p>
              </div>

              <h3>DELIVERY DETAILS</h3>

              <p>
                ${escapeHtml(address.fullName)}<br>
                ${escapeHtml(address.address)}<br>
                ${address.addressLine2 ? `${escapeHtml(address.addressLine2)}<br>` : ''}
                ${escapeHtml(address.city)}, ${escapeHtml(address.province)}<br>
                ${escapeHtml(address.postalCode)}<br>
                ${escapeHtml(address.phone)}
              </p>

              <p style="color:#94A3B8;">
                Your order will only be confirmed after
                your EFT payment has been verified.
              </p>

              <p style="text-align:center;color:#94A3B8;margin-top:30px;">
                Born in Germiston. Rooted in culture.
                Made for every version of you.
              </p>

              <p style="text-align:center;color:#94A3B8;font-size:12px;">
                © ${new Date().getFullYear()} Shiya Kulenga
              </p>

            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Customer order email error:', emailError.message)
    }

    // ADMIN NEW ORDER EMAIL
    try {
      await sendEmail({
        to: process.env.EMAIL_USER,
        subject: `NEW EFT ORDER - ${orderReference}`,
        html: `
          <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
            <div style="max-width:600px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

              <h1 style="color:#00F0FF;text-align:center;">
                SHIYA KULENGA
              </h1>

              <h2>NEW CUSTOMER ORDER</h2>

              <p>Order reference: ${escapeHtml(orderReference)}</p>

              <p style="color:#FF5500;">
                PAYMENT STATUS: PENDING EFT
              </p>

              <h3>CUSTOMER DETAILS</h3>

              <p>
                Name: ${escapeHtml(address.fullName)}<br>
                Email: ${escapeHtml(address.email)}<br>
                Phone: ${escapeHtml(address.phone)}
              </p>

              <h3>ORDERED PRODUCTS</h3>

              <table style="width:100%;border-collapse:collapse;color:#FFFFFF;">
                ${itemRows}
              </table>

              <p>Subtotal: ${formatMoney(createdOrder.subtotal)}</p>
              <p>Delivery: ${formatMoney(createdOrder.deliveryFee)}</p>

              <h2 style="color:#CCFF00;">
                TOTAL: ${formatMoney(createdOrder.totalAmount)}
              </h2>

              <p>
                Log in to your admin dashboard to manage this order
                and verify payment after the deposit arrives.
              </p>

            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Admin order email error:', emailError.message)
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully. Awaiting EFT payment.',
      order: createdOrder
    })

  } catch (error) {
    console.error('Create order error:', error)

    return res.status(400).json({
      success: false,
      message: error.message
    })

  } finally {
    await session.endSession()
  }
}


// CUSTOMER: UPLOAD PROOF OF PAYMENT
const uploadProofOfPayment = async (req, res) => {
  let uploadedFile

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order reference.'
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a proof-of-payment file.'
      })
    }

    if (!validateProofFile(req.file)) {
      return res.status(400).json({
        success: false,
        message: 'The file content is invalid. Upload a genuine JPG, PNG or PDF.'
      })
    }

    const order = await Order.findOne({
      _id: req.params.id,
      customer: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      })
    }

    if (order.paymentMethod !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'Proof uploads are only available for EFT orders.'
      })
    }

    if (
      order.paymentStatus !== 'pending' ||
      order.orderStatus === 'cancelled'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Proof cannot be uploaded for this order.'
      })
    }

    // Upload new proof first
    uploadedFile = await uploadProofToCloudinary(req.file)

    const oldPublicId = order.proofOfPayment?.publicId
    const oldResourceType = order.proofOfPayment?.resourceType

    const originalName = path.basename(req.file.originalname)
      .replace(/[\r\n]/g, '')
      .slice(0, 150)

    order.proofOfPayment = {
      url: null,
      publicId: uploadedFile.public_id,
      originalName,
      uploadedAt: new Date(),
      resourceType: req.file.mimetype === 'application/pdf'
        ? 'raw'
        : 'image'
    }

    await order.save()

    // Delete previous proof only after the new proof is saved
    if (oldPublicId) {
      await deleteCloudinaryProof(oldPublicId, oldResourceType)
    }

    return res.json({
      success: true,
      message: 'Proof of payment uploaded successfully. Awaiting admin verification.',
      proofOfPayment: {
        originalName: order.proofOfPayment.originalName,
        uploadedAt: order.proofOfPayment.uploadedAt
      },
      paymentStatus: order.paymentStatus
    })

  } catch (error) {
    // Remove newly uploaded file if saving the order failed
    if (uploadedFile?.public_id) {
      const resourceType = req.file?.mimetype === 'application/pdf'
        ? 'raw'
        : 'image'

      await deleteCloudinaryProof(uploadedFile.public_id, resourceType)
    }

    console.error('Proof of payment upload error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to upload proof of payment. Please try again.'
    })
  }
}


// CUSTOMER: VIEW OWN ORDERS
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.user._id
    }).sort({ createdAt: -1 })

    return res.json({
      success: true,
      orders
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ADMIN: VIEW ALL ORDERS
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })

    return res.json({
      success: true,
      orders
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ADMIN: VIEW PROOF OF PAYMENT
const getProofOfPayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order reference.'
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      })
    }

    const proof = order.proofOfPayment

    if (!proof?.publicId || !proof?.resourceType || !proof?.originalName) {
      return res.status(404).json({
        success: false,
        message: 'No proof of payment has been uploaded.'
      })
    }

    const extension = path.extname(proof.originalName)
      .replace('.', '')
      .toLowerCase()

    if (!['jpg', 'jpeg', 'png', 'pdf'].includes(extension)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported proof file format.'
      })
    }

    const viewingUrl = cloudinary.utils.private_download_url(
      proof.publicId,
      extension,
      {
        resource_type: proof.resourceType,
        type: 'authenticated',
        expires_at: Math.floor(Date.now() / 1000) + 300
      }
    )

    return res.json({
      success: true,
      viewingUrl,
      originalName: proof.originalName,
      uploadedAt: proof.uploadedAt
    })

  } catch (error) {
    console.error('View proof error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve proof of payment.'
    })
  }
}



// ADMIN: DASHBOARD OVERVIEW
const getAdminOverview = async (req, res) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      pendingPayments
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Order.countDocuments({ orderStatus: 'processing' }),
      Order.countDocuments({ paymentStatus: 'pending' })
    ])

    return res.json({
      success: true,
      overview: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingOrders,
        pendingPayments
      }
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ADMIN: VERIFY EFT PAYMENT
const verifyOrderPayment = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        paymentMethod: 'manual',
        paymentStatus: 'pending',
        orderStatus: { $ne: 'cancelled' }
      },
      {
        $set: {
          paymentStatus: 'paid',
          orderStatus: 'confirmed'
        }
      },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Pending EFT order not found or payment already verified.'
      })
    }

    try {
      await sendEmail({
        to: order.shippingAddress.email,
        subject: `EFT Payment Confirmed - ${order._id}`,
        html: `
          <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
            <div style="max-width:550px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

              <h1 style="color:#00F0FF;text-align:center;">
                SHIYA KULENGA
              </h1>

              <h2>Hello ${escapeHtml(order.shippingAddress.fullName)}!</h2>

              <p>
                Your EFT payment has been verified successfully.
                Your order is now confirmed and will be prepared.
              </p>

              <p style="color:#CCFF00;">
                PAYMENT STATUS: PAID
              </p>

              <p>Order reference: ${escapeHtml(order._id)}</p>
              <h2>Total paid: ${formatMoney(order.totalAmount)}</h2>

              <p>Thank you for shopping with Shiya Kulenga.</p>

            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Payment confirmation email error:', emailError.message)
    }

    return res.json({
      success: true,
      message: 'EFT payment verified successfully.',
      order
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ADMIN: UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const allowedStatuses = [
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled'
    ]

    const { orderStatus } = req.body

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status.'
      })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      })
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'A cancelled order cannot be updated.'
      })
    }

    if (
      ['confirmed', 'shipped', 'delivered'].includes(orderStatus) &&
      order.paymentStatus !== 'paid'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Verify payment before confirming or shipping this order.'
      })
    }

    // Cancel unpaid order and restore reserved stock
    if (
      orderStatus === 'cancelled' &&
      order.paymentStatus === 'pending'
    ) {
      const session = await mongoose.startSession()

      try {
        await session.withTransaction(async () => {
          const cancelledOrder = await Order.findOneAndUpdate(
            {
              _id: order._id,
              paymentStatus: 'pending',
              orderStatus: { $ne: 'cancelled' }
            },
            {
              $set: { orderStatus: 'cancelled' }
            },
            { new: true, session }
          )

          if (!cancelledOrder) {
            throw new Error('Order could not be cancelled.')
          }

          for (const item of cancelledOrder.items) {
            await Product.updateOne(
              { _id: item.product },
              { $inc: { stock: item.quantity } },
              { session }
            )
          }
        })
      } finally {
        await session.endSession()
      }
    } else {
      order.orderStatus = orderStatus
      await order.save()
    }

    const updatedOrder = await Order.findById(order._id)

    // CUSTOMER STATUS EMAIL
    try {
      const statusMessages = {
        processing: 'Your order is being processed.',
        confirmed: 'Your payment has been verified and your order is confirmed.',
        shipped: 'Great news! Your order has been shipped.',
        delivered: 'Your order has been delivered. We hope you love it!',
        cancelled: 'Your order has been cancelled.'
      }

      await sendEmail({
        to: updatedOrder.shippingAddress.email,
        subject: `Your Shiya Kulenga Order is ${orderStatus.toUpperCase()}`,
        html: `
          <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
            <div style="max-width:550px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

              <h1 style="color:#00F0FF;text-align:center;">
                SHIYA KULENGA
              </h1>

              <h2>Hello ${escapeHtml(updatedOrder.shippingAddress.fullName)}!</h2>

              <p>${statusMessages[orderStatus]}</p>

              <h2 style="color:#CCFF00;">
                ${escapeHtml(orderStatus.toUpperCase())}
              </h2>

              <p>Order reference: ${escapeHtml(updatedOrder._id)}</p>

              <p>Thank you for shopping with Shiya Kulenga.</p>

            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Order status email error:', emailError.message)
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully.',
      order: updatedOrder
    })

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    })
  }
}


module.exports = {
  createOrder,
  uploadProofOfPayment,
  getMyOrders,
  getAllOrders,
  getProofOfPayment,
  getAdminOverview,
  verifyOrderPayment,
  updateOrderStatus
}