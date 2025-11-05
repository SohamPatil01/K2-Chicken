// Shop location coordinates (K2 Chicken)
export const SHOP_LOCATION = {
  lat: 18.5996, // Approximate coordinates for Pimple Nilakh, Pune
  lng: 73.7689,
  address: "Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027"
}

// Delivery settings - defaults (will be overridden by database settings)
export const DELIVERY_CONFIG = {
  FREE_DELIVERY_RADIUS_KM: 5, // Free delivery within 5km
  BASE_DELIVERY_FEE: 0, // Base delivery fee (free within radius)
  CHARGE_PER_KM: 5, // Charge ₹5 per km beyond the free radius
  MIN_ORDER_FOR_FREE_DELIVERY: 500 // Minimum order amount for free delivery (if needed)
}

// Get delivery settings from database
export async function getDeliverySettings(): Promise<{
  FREE_DELIVERY_RADIUS_KM: number
  BASE_DELIVERY_FEE: number
  CHARGE_PER_KM: number
}> {
  try {
    const pool = (await import('@/lib/db')).default
    const client = await pool.connect()
    
    try {
      const result = await client.query(
        'SELECT key, value FROM settings WHERE key IN ($1, $2, $3)',
        ['delivery_radius_km', 'charge_per_km', 'base_delivery_fee']
      )
      
      const settings: Record<string, number> = {}
      result.rows.forEach(row => {
        settings[row.key] = parseFloat(row.value) || DELIVERY_CONFIG[row.key as keyof typeof DELIVERY_CONFIG]
      })
      
      return {
        FREE_DELIVERY_RADIUS_KM: settings.delivery_radius_km || DELIVERY_CONFIG.FREE_DELIVERY_RADIUS_KM,
        BASE_DELIVERY_FEE: settings.base_delivery_fee || DELIVERY_CONFIG.BASE_DELIVERY_FEE,
        CHARGE_PER_KM: settings.charge_per_km || DELIVERY_CONFIG.CHARGE_PER_KM
      }
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching delivery settings:', error)
    // Return defaults on error
    return DELIVERY_CONFIG
  }
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

// Calculate delivery charge based on distance (with configurable settings)
export async function calculateDeliveryCharge(distanceKm: number, customSettings?: {
  FREE_DELIVERY_RADIUS_KM: number
  BASE_DELIVERY_FEE: number
  CHARGE_PER_KM: number
}): Promise<number> {
  const settings = customSettings || await getDeliverySettings()
  
  if (distanceKm <= settings.FREE_DELIVERY_RADIUS_KM) {
    return settings.BASE_DELIVERY_FEE
  }
  
  const extraKm = distanceKm - settings.FREE_DELIVERY_RADIUS_KM
  const charge = settings.BASE_DELIVERY_FEE + (extraKm * settings.CHARGE_PER_KM)
  return Math.round(charge)
}

// Geocode address to coordinates using Google Maps Geocoding API
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; formatted_address?: string } | null> {
  try {
    // Use server-side API key if available, otherwise client-side
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      // Fallback to Nominatim if Google Maps API key is not set
      return await geocodeAddressFallback(address)
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Pune, Maharashtra, India')}&key=${apiKey}&region=in`
    )
    
    const data = await response.json()
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address
      }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return await geocodeAddressFallback(address)
  }
}

// Fallback geocoding using Nominatim (OpenStreetMap)
async function geocodeAddressFallback(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Pune, Maharashtra, India')}&limit=1`,
      {
        headers: {
          'User-Agent': 'K2Chicken-OrderApp/1.0'
        }
      }
    )
    
    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      }
    }
    return null
  } catch (error) {
    console.error('Fallback geocoding error:', error)
    return null
  }
}

// Calculate road distance using Google Maps Distance Matrix API
export async function calculateRoadDistance(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<{ distance: number; duration?: string } | null> {
  try {
    // Use server-side API key if available, otherwise client-side
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      // Fallback to Haversine formula if Google Maps API key is not set
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      return { distance }
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${apiKey}&units=metric&mode=driving`
    )
    
    const data = await response.json()
    if (data.status === 'OK' && data.rows && data.rows.length > 0) {
      const element = data.rows[0].elements[0]
      if (element.status === 'OK') {
        // Distance is in meters, convert to kilometers
        const distanceKm = element.distance.value / 1000
        return {
          distance: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
          duration: element.duration.text
        }
      }
    }
    // Fallback to Haversine if API fails
    const distance = calculateDistance(originLat, originLng, destLat, destLng)
    return { distance }
  } catch (error) {
    console.error('Distance Matrix API error:', error)
    // Fallback to Haversine formula
    const distance = calculateDistance(originLat, originLng, destLat, destLng)
    return { distance }
  }
}

