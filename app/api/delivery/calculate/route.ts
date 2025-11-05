import { NextRequest, NextResponse } from 'next/server'
import { SHOP_LOCATION, calculateDistance, calculateDeliveryCharge, geocodeAddress, calculateRoadDistance, getDeliverySettings } from '@/lib/delivery'

export async function POST(request: NextRequest) {
  try {
    const { deliveryAddress, coordinates: providedCoordinates } = await request.json()
    
    if (!deliveryAddress && !providedCoordinates) {
      return NextResponse.json(
        { error: 'Delivery address or coordinates are required' },
        { status: 400 }
      )
    }

    let coordinates = providedCoordinates
    let formattedAddress = deliveryAddress
    
    // Geocode the delivery address if coordinates not provided
    if (!coordinates && deliveryAddress) {
      const geocodeResult = await geocodeAddress(deliveryAddress)
      if (geocodeResult) {
        coordinates = { lat: geocodeResult.lat, lng: geocodeResult.lng }
        if (geocodeResult.formatted_address) {
          formattedAddress = geocodeResult.formatted_address
        }
      }
    }
    
    if (!coordinates) {
      return NextResponse.json(
        { 
          error: 'Could not find location. Please provide a more detailed address or use the map picker.',
          distance: null,
          deliveryCharge: 0
        },
        { status: 200 } // Return 200 but with error message
      )
    }

    // Calculate road distance using Google Maps Distance Matrix API (more accurate)
    const roadDistanceData = await calculateRoadDistance(
      SHOP_LOCATION.lat,
      SHOP_LOCATION.lng,
      coordinates.lat,
      coordinates.lng
    )

    const distance = roadDistanceData?.distance || calculateDistance(
      SHOP_LOCATION.lat,
      SHOP_LOCATION.lng,
      coordinates.lat,
      coordinates.lng
    )

    // Get delivery settings from database
    const deliverySettings = await getDeliverySettings()
    
    // Calculate delivery charge using database settings
    const deliveryCharge = await calculateDeliveryCharge(distance, deliverySettings)

    return NextResponse.json({
      success: true,
      distance,
      deliveryCharge,
      duration: roadDistanceData?.duration,
      coordinates,
      shopLocation: SHOP_LOCATION,
      formattedAddress: formattedAddress || deliveryAddress,
      freeDeliveryRadius: deliverySettings.FREE_DELIVERY_RADIUS_KM
    })
  } catch (error) {
    console.error('Error calculating delivery:', error)
    return NextResponse.json(
      { error: 'Failed to calculate delivery charge' },
      { status: 500 }
    )
  }
}

