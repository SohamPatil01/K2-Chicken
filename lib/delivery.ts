// Shop location coordinates (K2 Chicken)
export const SHOP_LOCATION = {
  lat: 18.585268, // Approximate coordinates for Pimple Nilakh, Pune
  lng: 73.781721,
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
}, usingGoogleMaps?: boolean): Promise<number> {
  const settings = customSettings || await getDeliverySettings()
  
  // Validate inputs
  if (!distanceKm || distanceKm < 0) {
    console.warn('Invalid distance provided to calculateDeliveryCharge:', distanceKm)
    return settings.BASE_DELIVERY_FEE
  }
  
  // If not using Google Maps, warn that distance might be inaccurate
  if (usingGoogleMaps === false) {
    console.warn('⚠️ WARNING: Using Haversine formula (straight-line distance). This may significantly underestimate road distance!')
    console.warn('⚠️ For accurate delivery charges, please set up Google Maps API key.')
  }
  
  // Round distance to 2 decimal places for calculation accuracy
  const roundedDistance = Math.round(distanceKm * 100) / 100
  
  // If within free delivery radius, return base fee (usually 0)
  if (roundedDistance <= settings.FREE_DELIVERY_RADIUS_KM) {
    console.log(`Delivery charge calculation: Distance ${roundedDistance}km <= Free radius ${settings.FREE_DELIVERY_RADIUS_KM}km. Charge: ₹${settings.BASE_DELIVERY_FEE}`)
    return Math.round(settings.BASE_DELIVERY_FEE)
  }
  
  // Calculate charge for distance beyond free radius
  const extraKm = roundedDistance - settings.FREE_DELIVERY_RADIUS_KM
  
  // If NOT using Google Maps, apply safety multiplier to account for road distance being longer
  let effectiveDistance = roundedDistance
  if (usingGoogleMaps === false) {
    // Road distance is typically 1.3-2x longer than straight-line distance in cities
    // Use a conservative 1.6x multiplier for Pune city
    const safetyMultiplier = 1.6
    effectiveDistance = roundedDistance * safetyMultiplier
    const estimatedExtraKm = Math.max(0, effectiveDistance - settings.FREE_DELIVERY_RADIUS_KM)
    const charge = settings.BASE_DELIVERY_FEE + (estimatedExtraKm * settings.CHARGE_PER_KM)
    const roundedCharge = Math.round(charge)
    
    console.warn(`⚠️ Not using Google Maps - applied ${safetyMultiplier}x safety multiplier`)
    console.warn(`   Straight-line: ${roundedDistance.toFixed(2)}km → Estimated road: ${effectiveDistance.toFixed(2)}km`)
    console.log(`Delivery charge calculation: Effective distance ${effectiveDistance.toFixed(2)}km, Free radius ${settings.FREE_DELIVERY_RADIUS_KM}km, Extra ${estimatedExtraKm.toFixed(2)}km, Charge per km ₹${settings.CHARGE_PER_KM}, Base fee ₹${settings.BASE_DELIVERY_FEE}, Final: ₹${roundedCharge}`)
    
    return roundedCharge
  }
  
  // Using Google Maps - calculate normally with accurate road distance
  const charge = settings.BASE_DELIVERY_FEE + (extraKm * settings.CHARGE_PER_KM)
  const roundedCharge = Math.round(charge)
  
  console.log(`Delivery charge calculation: Distance ${roundedDistance}km, Free radius ${settings.FREE_DELIVERY_RADIUS_KM}km, Extra ${extraKm.toFixed(2)}km, Charge per km ₹${settings.CHARGE_PER_KM}, Base fee ₹${settings.BASE_DELIVERY_FEE}, Final: ₹${roundedCharge}`)
  
  return roundedCharge
}

// Geocode address to coordinates using Google Maps Geocoding API
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number; formatted_address?: string } | null> {
  try {
    // Use server-side API key if available, otherwise client-side
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found. Using fallback geocoding (less accurate).')
      // Fallback to Nominatim if Google Maps API key is not set
      return await geocodeAddressFallback(address)
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address + ', Pune, Maharashtra, India')}&key=${apiKey}&region=in`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address
      }
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('Google Maps Geocoding API: Request denied. Check API key and ensure Geocoding API is enabled.')
      console.error('Error message:', data.error_message)
      return await geocodeAddressFallback(address)
    } else if (data.status === 'ZERO_RESULTS') {
      console.warn('Google Maps Geocoding: No results found for address:', address)
      return await geocodeAddressFallback(address)
    } else {
      console.warn(`Google Maps Geocoding API returned status: ${data.status}`)
      if (data.error_message) {
        console.warn('Error message:', data.error_message)
      }
      return await geocodeAddressFallback(address)
    }
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
): Promise<{ distance: number; duration?: string; usingGoogleMaps?: boolean } | null> {
  // Validate coordinates
  if (!originLat || !originLng || !destLat || !destLng) {
    console.error('Invalid coordinates provided to calculateRoadDistance')
    return null
  }

  // Use server-side API key if available, otherwise client-side
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.error('❌ Google Maps API key not found!')
    console.error('   GOOGLE_MAPS_API_KEY:', process.env.GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET')
    console.error('   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY:', process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'SET' : 'NOT SET')
    console.error('   Please set GOOGLE_MAPS_API_KEY (server-side) or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in environment variables.')
    console.error('   Using Haversine formula (straight-line distance) - this will be INACCURATE!')
    const distance = calculateDistance(originLat, originLng, destLat, destLng)
    return { distance, usingGoogleMaps: false }
  }
  
  console.log('✅ Google Maps API key found, using Distance Matrix API for accurate road distance')
  console.log('   API Key (first 10 chars):', apiKey.substring(0, 10) + '...')

  try {
    // Construct the API URL with proper encoding
    const origin = `${originLat},${originLng}`
    const destination = `${destLat},${destLng}`
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}&units=metric&mode=driving&region=in`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Handle different API response statuses
    if (data.status === 'OK' && data.rows && data.rows.length > 0) {
      const element = data.rows[0].elements[0]
      
      if (element.status === 'OK') {
        // Distance is in meters, convert to kilometers
        const distanceMeters = element.distance.value
        const distanceKm = distanceMeters / 1000
        // Keep more precision for calculation (round to 2 decimals), but display with 1 decimal
        const roundedDistance = Math.round(distanceKm * 100) / 100
        
        console.log(`✅ Google Maps Distance Matrix API Response:`)
        console.log(`   Distance: ${distanceMeters}m = ${distanceKm.toFixed(3)}km (rounded: ${roundedDistance}km)`)
        console.log(`   Display: ${element.distance.text}`)
        console.log(`   Duration: ${element.duration.text}`)
        
        return {
          distance: roundedDistance, // Use 2 decimal precision for accurate calculation
          duration: element.duration.text,
          usingGoogleMaps: true
        }
      } else if (element.status === 'ZERO_RESULTS') {
        console.warn('Google Maps: No route found between locations. Using Haversine formula.')
        const distance = calculateDistance(originLat, originLng, destLat, destLng)
        return { distance, usingGoogleMaps: false }
      } else if (element.status === 'NOT_FOUND') {
        console.warn(`Google Maps: Location not found (${element.status}). Using Haversine formula.`)
        const distance = calculateDistance(originLat, originLng, destLat, destLng)
        return { distance, usingGoogleMaps: false }
      } else {
        console.warn(`Google Maps API returned status: ${element.status}. Using Haversine formula.`)
        const distance = calculateDistance(originLat, originLng, destLat, destLng)
        return { distance, usingGoogleMaps: false }
      }
    } else if (data.status === 'REQUEST_DENIED') {
      console.error('Google Maps API: Request denied. Check API key and ensure Distance Matrix API is enabled.')
      console.error('Error message:', data.error_message)
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      return { distance, usingGoogleMaps: false }
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      console.error('Google Maps API: Over query limit. Check your API quota.')
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      return { distance, usingGoogleMaps: false }
    } else if (data.status === 'INVALID_REQUEST') {
      console.error('Google Maps API: Invalid request. Check coordinates and API parameters.')
      console.error('Error details:', data.error_message)
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      return { distance, usingGoogleMaps: false }
    } else {
      console.warn(`Google Maps API returned status: ${data.status}. Using Haversine formula.`)
      if (data.error_message) {
        console.warn('Error message:', data.error_message)
      }
      const distance = calculateDistance(originLat, originLng, destLat, destLng)
      return { distance, usingGoogleMaps: false }
    }
  } catch (error) {
    console.error('Distance Matrix API error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    // Fallback to Haversine formula
    const distance = calculateDistance(originLat, originLng, destLat, destLng)
    return { distance, usingGoogleMaps: false }
  }
}

