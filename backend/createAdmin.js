
require('dotenv').config()

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const email = 'supportshiyakulenga@gmail.com'
    const password = 'Shiya@kulenga1401'

    const existingAdmin = await User.findOne({ email })

    if (existingAdmin) {
      console.log('Admin account already exists.')
      process.exit(0)
    }

    await User.create({
      name: 'Shiya Kulenga Admin',
      email,
      password,
      role: 'admin'
    })

    console.log('Admin account created successfully!')
    process.exit(0)

  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

createAdmin()
