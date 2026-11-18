
const crypto = require('crypto')

const phpEncode = (value) => {
  return encodeURIComponent(String(value).trim())
    .replace(/[!'()*~]/g, char =>
      `%${char.charCodeAt(0).toString(16).toUpperCase()}`
    )
    .replace(/%20/g, '+')
}

// Generate payment or notification signature
const generatePayFastSignature = (data, passphrase) => {
  const parts = []

  for (const [key, value] of Object.entries(data)) {
    if (
      key !== 'signature' &&
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ''
    ) {
      parts.push(`${key}=${phpEncode(value)}`)
    }
  }

  if (passphrase) {
    parts.push(`passphrase=${phpEncode(passphrase)}`)
  }

  return crypto
    .createHash('md5')
    .update(parts.join('&'))
    .digest('hex')
}

// Verify the signature received from PayFast
const verifyPayFastSignature = (data, passphrase) => {
  const receivedSignature = data.signature

  if (!receivedSignature) return false

  const expectedSignature = generatePayFastSignature(
    data,
    passphrase
  )

  const received = Buffer.from(receivedSignature, 'hex')
  const expected = Buffer.from(expectedSignature, 'hex')

  if (received.length !== expected.length) return false

  return crypto.timingSafeEqual(received, expected)
}

const getPayFastHost = () => {
  return process.env.PAYFAST_MODE === 'sandbox'
    ? 'sandbox.payfast.co.za'
    : 'www.payfast.co.za'
}

const getPayFastUrl = () => {
  return `https://${getPayFastHost()}/eng/process`
}

// Ask PayFast to validate an ITN notification
const validatePayFastITN = async (data) => {
  const params = Object.entries(data)
    .filter(([key]) => key !== 'signature')
    .map(([key, value]) =>
      `${key}=${phpEncode(value)}`
    )
    .join('&')

  const response = await fetch(
    `https://${getPayFastHost()}/eng/query/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    }
  )

  const result = await response.text()

  return result.trim() === 'VALID'
}

module.exports = {
  generatePayFastSignature,
  verifyPayFastSignature,
  validatePayFastITN,
  getPayFastUrl
}
