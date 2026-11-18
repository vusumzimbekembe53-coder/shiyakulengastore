require('dotenv').config()

const { sendEmail } = require('./config/email')

const testEmail = async () => {
  const sent = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: 'Shiya Kulenga Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 25px; background: #0B0C10; color: #FFFFFF;">
        <h1 style="color: #00F0FF;">Shiya Kulenga</h1>
        <p>Your email notification system is working!</p>
        <p style="color: #94A3B8;">Style for Every You.</p>
      </div>
    `
  })

  if (sent) {
    console.log('Test email sent successfully.')
  } else {
    console.log('Email test failed. Check your Gmail settings.')
  }

  process.exit(sent ? 0 : 1)
}

testEmail()