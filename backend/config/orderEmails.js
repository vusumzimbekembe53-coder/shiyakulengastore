
const { sendEmail } = require('./email')

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

const sendPaidOrderEmails = async (order) => {
  const address = order.shippingAddress

  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #333;">
        <strong>${escapeHtml(item.name)}</strong>
        <br>
        <span style="color:#94A3B8;font-size:13px;">
          Size: ${escapeHtml(item.size || 'N/A')}
          | Colour: ${escapeHtml(item.color || 'N/A')}
          | Quantity: ${item.quantity}
        </span>
      </td>
      <td style="padding:12px;border-bottom:1px solid #333;text-align:right;">
        ${formatMoney(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  // CUSTOMER CONFIRMATION EMAIL
  const customerEmail = sendEmail({
    to: address.email,
    subject: `Order Confirmation - ${order._id}`,
    html: `
      <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
        <div style="max-width:600px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

          <h1 style="color:#00F0FF;text-align:center;letter-spacing:2px;">
            SHIYA KULENGA
          </h1>

          <p style="color:#94A3B8;text-align:center;">
            STYLE FOR EVERY YOU
          </p>

          <h2>Thank you for your order, ${escapeHtml(address.fullName)}!</h2>

          <p>
            Your payment was successful and your order has been received.
            We're excited to get your items ready.
          </p>

          <p style="color:#00F0FF;">
            Order number: ${escapeHtml(order._id)}
          </p>

          <h3>YOUR ORDER</h3>

          <table style="width:100%;border-collapse:collapse;color:#FFFFFF;">
            ${itemRows}
          </table>

          <div style="margin-top:20px;border-top:1px solid #333;padding-top:15px;">
            <p>Subtotal: <strong>${formatMoney(order.subtotal)}</strong></p>
            <p>Delivery: <strong>${formatMoney(order.deliveryFee)}</strong></p>
            <h2 style="color:#00F0FF;">
              Total: ${formatMoney(order.totalAmount)}
            </h2>
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
            Your order is currently being processed.
            We will keep you updated as its status changes.
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

  // ADMIN NEW PAID ORDER EMAIL
  const adminEmail = sendEmail({
    to: process.env.EMAIL_USER,
    subject: `NEW PAID ORDER - ${order._id}`,
    html: `
      <div style="background:#0B0C10;padding:30px 15px;font-family:Arial,sans-serif;color:#FFFFFF;">
        <div style="max-width:600px;margin:auto;background:#181A20;padding:30px;border-radius:10px;">

          <h1 style="color:#00F0FF;text-align:center;">
            SHIYA KULENGA
          </h1>

          <h2>NEW PAID CUSTOMER ORDER!</h2>

          <p style="color:#00F0FF;">
            Order number: ${escapeHtml(order._id)}
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

          <h3>DELIVERY ADDRESS</h3>

          <p>
            ${escapeHtml(address.address)}<br>
            ${address.addressLine2 ? `${escapeHtml(address.addressLine2)}<br>` : ''}
            ${escapeHtml(address.city)}, ${escapeHtml(address.province)}<br>
            ${escapeHtml(address.postalCode)}
          </p>

          <div style="border-top:1px solid #333;padding-top:15px;">
            <p>Subtotal: ${formatMoney(order.subtotal)}</p>
            <p>Delivery: ${formatMoney(order.deliveryFee)}</p>
            <h2 style="color:#CCFF00;">
              TOTAL: ${formatMoney(order.totalAmount)}
            </h2>
          </div>

          <p style="color:#94A3B8;">
            Payment has been verified by PayFast.
            Log in to your admin dashboard to manage this order.
          </p>

        </div>
      </div>
    `
  })

  const results = await Promise.allSettled([
    customerEmail,
    adminEmail
  ])

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(
        index === 0
          ? 'Customer order email error:'
          : 'Admin order notification error:',
        result.reason?.message || result.reason
      )
    }
  })
}

module.exports = { sendPaidOrderEmails }
