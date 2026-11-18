
const mongoose = require('mongoose')
const dns = require('dns').promises
const net = require('net')

const Order = require('../models/Order')
const Product = require('../models/Product')
const { sendPaidOrderEmails } = require('../config/orderEmails')

const {
  generatePayFastSignature,
  verifyPayFastSignature,
  validatePayFastITN,
  getPayFastUrl
} = require('../config/payfast')

// CHECK WHETHER THE REQUEST CAME FROM PAYFAST
const isPayFastSourceIP = async (req) => {
  const hosts = [
    'www.payfast.co.za',
    'sandbox.payfast.co.za',
    'w1w.payfast.co.za',
    'w2w.payfast.co.za'
  ]

  const sourceIP = req.socket.remoteAddress

  if (!sourceIP) return false

  const normalizedIP = sourceIP.replace(/^::ffff:/, '')

  if (!net.isIP(normalizedIP)) return false

  const allowedIPs = new Set()

  for (const host of hosts) {
    try {
      const addresses = await dns.lookup(host, { all: true })

      addresses.forEach(address => {
        allowedIPs.add(address.address)
      })
    } catch (error) {
      console.error(`Could not resolve ${host}:`, error.message)
    }
  }

  return allowedIPs.has(normalizedIP)
}
// CREATE PAYFAST PAYMENT
const createPayFastPayment = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const merchantId = process.env.PAYFAST_MERCHANT_ID
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY
    const clientUrl = process.env.CLIENT_URL
    const serverUrl = process.env.SERVER_URL

    if (!merchantId || !merchantKey || !clientUrl || !serverUrl) {
      return res.status(500).json({
        success: false,
        message: 'Payment configuration is incomplete.'
      })
    }

    const { items, shippingAddress } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.'
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
        typeof shippingAddress?.[field] !== 'string' ||
        !shippingAddress[field].trim()
      ) {
        return res.status(400).json({
          success: false,
          message: `Please provide your ${field}.`
        })
      }
    }

    let createdOrder
    let subtotal = 0
    const deliveryFee = 100
    const orderItems = []

    await session.withTransaction(async () => {
      subtotal = 0
      orderItems.length = 0

      for (const item of items) {
        if (
          !mongoose.Types.ObjectId.isValid(item.product) ||
          !Number.isInteger(Number(item.quantity)) ||
          Number(item.quantity) < 1
        ) {
          throw new Error('Invalid product or quantity.')
        }

        const product = await Product.findOne({
          _id: item.product,
          isActive: true
        }).session(session)

        if (!product) {
          throw new Error('One of the products is unavailable.')
        }

        const quantity = Number(item.quantity)

        const validSize = !item.size ||
          product.sizes.includes(item.size)

        const validColor = !item.color ||
          product.colors.includes(item.color)

        if (!validSize || !validColor) {
          throw new Error(
            `Invalid size or color selected for ${product.name}.`
          )
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
          throw new Error(
            `${product.name} does not have enough stock.`
          )
        }

        subtotal += product.price * quantity

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          size: item.size || '',
          color: item.color || ''
        })
      }

      const totalAmount = Number(
        (subtotal + deliveryFee).toFixed(2)
      )

      const orders = await Order.create(
        [{
          customer: req.user._id,
          items: orderItems,
          subtotal,
          deliveryFee,
          totalAmount,
          shippingAddress,
          paymentStatus: 'pending',
          paymentMethod: 'payfast'
        }],
        { session }
      )

      createdOrder = orders[0]
    })

    const paymentData = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: `${clientUrl}/order-confirmation?orderId=${createdOrder._id}`,
      cancel_url: `${clientUrl}/checkout?cancelled=true`,
      notify_url: `${serverUrl}/api/orders/payment/notify`,
      name_first: shippingAddress.fullName,
      email_address: shippingAddress.email,
      m_payment_id: createdOrder._id.toString(),
      amount: createdOrder.totalAmount.toFixed(2),
      item_name: `Shiya Kulenga Order ${createdOrder._id}`
    }

    const signature = generatePayFastSignature(
      paymentData,
      process.env.PAYFAST_PASSPHRASE
    )

    return res.status(200).json({
      success: true,
      paymentUrl: getPayFastUrl(),
      paymentData: {
        ...paymentData,
        signature
      }
    })

  } catch (error) {
    console.error('PayFast payment creation error:', error)

    return res.status(400).json({
      success: false,
      message: error.message || 'Unable to create payment.'
    })

  } finally {
    await session.endSession()
  }
}

// HANDLE PAYFAST ITN NOTIFICATION
const handlePayFastNotification = async (req, res) => {
  try {
    const data = req.body

    if (!data || !data.signature || !data.m_payment_id) {
      return res.status(400).send('Invalid notification')
    }

    const validSignature = verifyPayFastSignature(
      data,
      process.env.PAYFAST_PASSPHRASE
    )

    if (!validSignature) {
      return res.status(400).send('Invalid signature')
    }

    const validSource = await isPayFastSourceIP(req)

    if (!validSource) {
      return res.status(403).send('Unverified source IP')
    }

    if (data.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      return res.status(400).send('Invalid merchant')
    }

    const order = await Order.findById(data.m_payment_id)

    if (!order) {
      return res.status(404).send('Order not found')
    }

    const receivedAmount = Number(data.amount_gross)

    if (
      !Number.isFinite(receivedAmount) ||
      Math.abs(receivedAmount - order.totalAmount) > 0.01
    ) {
      return res.status(400).send('Amount mismatch')
    }

    const validNotification = await validatePayFastITN(data)

    if (!validNotification) {
      return res.status(400).send('PayFast validation failed')
    }

    // Ignore duplicate notifications for an already-paid order
    if (order.paymentStatus === 'paid') {
      return res.status(200).send('Payment already processed')
    }

    if (data.payment_status === 'COMPLETE') {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: order._id,
          paymentStatus: 'pending'
        },
        {
          $set: {
            paymentStatus: 'paid',
            paymentReference: data.pf_payment_id || null,
            orderStatus: 'processing'
          }
        },
        { new: true }
      )

      if (!updatedOrder) {
        return res.status(200).send('Payment already processed')
      }

      console.log(`Order ${order._id} successfully paid.`)

// Send customer and admin emails after verified payment
await sendPaidOrderEmails(updatedOrder)

return res.status(200).send('Payment processed')
}

    if (data.payment_status === 'FAILED') {
      const session = await mongoose.startSession()

      try {
        await session.withTransaction(async () => {
          const failedOrder = await Order.findOneAndUpdate(
            {
              _id: order._id,
              paymentStatus: 'pending'
            },
            {
              $set: { paymentStatus: 'failed' }
            },
            { new: true, session }
          )

          if (failedOrder) {
            for (const item of failedOrder.items) {
              await Product.updateOne(
                { _id: item.product },
                { $inc: { stock: item.quantity } },
                { session }
              )
            }
          }
        })
      } finally {
        await session.endSession()
      }

      return res.status(200).send('Failed payment recorded')
    }

    return res.status(200).send('Notification received')

  } catch (error) {
    console.error('PayFast notification error:', error)
    return res.status(500).send('Notification processing failed')
  }
}

module.exports = {
  createPayFastPayment,
  handlePayFastNotification
}
