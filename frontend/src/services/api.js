
const API_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '')

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/api/products`)

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  const data = await response.json()
  return data.products || []
}

export const getFeaturedProducts = async () => {
  const response = await fetch(`${API_URL}/api/products/featured`)

  if (!response.ok) {
    throw new Error('Failed to fetch featured products')
  }

  const data = await response.json()
  return data.products || []
}
