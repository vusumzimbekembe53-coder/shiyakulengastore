
const multer = require('multer')
const path = require('path')

const allowedTypes = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf']
}

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase()
  const allowedExtensions = allowedTypes[file.mimetype]

  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return cb(
      new Error('Only JPG, PNG and PDF files are allowed.'),
      false
    )
  }

  cb(null, true)
}

const proofUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
})

module.exports = proofUpload
