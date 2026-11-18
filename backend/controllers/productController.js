
const Product = require('../models/Product')

const cloudinary = require('../config/cloudinary')
const streamifier = require('streamifier')

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'shiya-kulenga/products'
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    streamifier.createReadStream(fileBuffer).pipe(stream)
  })
}


// GET ALL PRODUCTS (PUBLIC)
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      products
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


 // GET ALL PRODUCTS (ADMIN)
const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })

    res.json({
      success: true,
      products
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// GET FEATURED PRODUCTS (PUBLIC)
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFeatured: true
    }).sort({ createdAt: -1 })

    res.json({
      success: true,
      products
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


// ADD PRODUCT (ADMIN)

const addProduct = async (req, res) => {
  try {
   const {
  name,
  description,
  price,
  category,
  sizes,
  colors,
  stock,
  isFeatured

} = req.body

    if (!name || !description || price === undefined || !category || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product details and an image.'
      })
    }

    // Upload image to Cloudinary
    const uploadedImage = await uploadToCloudinary(req.file.buffer)

    // Save product in MongoDB
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      image: uploadedImage.secure_url,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      stock: stock ?? 0,
      isFeatured: isFeatured === 'true',
    })

    res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      product
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}


// UPDATE PRODUCT (ADMIN)

const updateProduct = async (req, res) => {
  try {
   const {
  name,
  description,
  price,
  category,
  sizes,
  colors,
  stock,
   isFeatured
} = req.body

    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      })
    }

    // Update image only if a new one was selected
    if (req.file) {
      const uploadedImage = await uploadToCloudinary(req.file.buffer)
      product.image = uploadedImage.secure_url
    }

    product.name = name ?? product.name
    product.description = description ?? product.description
    product.price = price !== undefined ? Number(price) : product.price
    product.category = category ?? product.category
    product.stock = stock !== undefined ? Number(stock) : product.stock
    if (isFeatured !== undefined) {
  product.isFeatured = isFeatured === 'true'
}
    

    if (sizes !== undefined) {
      product.sizes = JSON.parse(sizes)
    }

    if (colors !== undefined) {
  product.colors = JSON.parse(colors)
}

    await product.save()

    res.json({
      success: true,
      message: 'Product updated successfully.',
      product
    })

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
}


// DELETE PRODUCT (ADMIN)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      })
    }

    res.json({
      success: true,
      message: 'Product deleted successfully.'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getProducts,
  getFeaturedProducts,
  getAdminProducts,
  addProduct,
  updateProduct,
  deleteProduct
}