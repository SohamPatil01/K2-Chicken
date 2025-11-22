import { NextRequest, NextResponse } from 'next/server'
import { SHOP_LOCATION, calculateDistance, calculateDeliveryCharge, geocodeAddress, calculateRoadDistance, getDeliverySettings } from '@/lib/delivery'

export async function POST(request: NextRequest) {
  try {
    console.log('📍 Delivery calculation request received')
    const { deliveryAddress, coordinates: providedCoordinates } = await request.json()
    console.log('   Address:', deliveryAddress || 'Not provided')
    console.log('   Coordinates:', providedCoordinates || 'Not provided')
    
    if (!deliveryAddress && !providedCoordinates) {
      console.error('❌ No address or coordinates provided')
      return NextResponse.json(
        { 
          success: false,
          error: 'Delivery address or coordinates are required' 
        },
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
          success: false,
          error: 'Could not find location. Please provide a more detailed address or use the map picker.',
          distance: null,
          deliveryCharge: 0
        },
        { status: 200 } // Return 200 but with error message
      )
    }

    // Calculate road distance using Google Maps Distance Matrix API (more accurate)
    // Always prioritize Google Maps for accurate road distance calculation
    const roadDistanceData = await calculateRoadDistance(
      SHOP_LOCATION.lat,
      SHOP_LOCATION.lng,
      coordinates.lat,
      coordinates.lng
    )

    if (!roadDistanceData) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Could not calculate distance. Please check the delivery address.',
          distance: null,
          deliveryCharge: 0
        },
        { status: 200 }
      )
    }

    const distance = roadDistanceData.distance
    
    // Log if using Google Maps or fallback
    if (roadDistanceData.usingGoogleMaps === false) {
      console.error('❌ CRITICAL: Using Haversine formula (straight-line distance) instead of Google Maps!')
      console.error('   This will significantly UNDERESTIMATE delivery charges!')
      console.error('   Distance calculated:', distance, 'km (straight-line, NOT road distance)')
      console.error('   Road distance is typically 1.5-2x longer in cities!')
      console.error('   Please check:')
      console.error('   1. Is GOOGLE_MAPS_API_KEY set in environment variables?')
      console.error('   2. Is Distance Matrix API enabled in Google Cloud Console?')
      console.error('   3. Is the API key valid and not restricted incorrectly?')
    } else {
      console.log('✅ Using Google Maps Distance Matrix API for accurate road distance calculation')
      console.log('✅ Road distance:', distance, 'km')
    }

    // Get delivery settings from database
    const deliverySettings = await getDeliverySettings()
    console.log('📋 Delivery settings:', {
      freeRadius: deliverySettings.FREE_DELIVERY_RADIUS_KM,
      baseFee: deliverySettings.BASE_DELIVERY_FEE,
      chargePerKm: deliverySettings.CHARGE_PER_KM
    })
    
    // Calculate delivery charge using database settings
    // Pass whether Google Maps was used to help detect inaccurate distances
    const deliveryCharge = await calculateDeliveryCharge(
      distance, 
      deliverySettings,
      roadDistanceData?.usingGoogleMaps
    )
    console.log('💰 Final delivery charge:', deliveryCharge)
    
    // Warn if charge seems too low for the distance
    if (distance > 10 && deliveryCharge < 30 && roadDistanceData?.usingGoogleMaps === false) {
      console.error('🚨 WARNING: Delivery charge seems too low!')
      console.error('   This is likely because Google Maps API is not being used.')
      console.error('   Please set GOOGLE_MAPS_API_KEY for accurate road distance calculation.')
    }

    return NextResponse.json({
      success: true,
      distance: Math.round(distance * 10) / 10, // Round to 1 decimal for display
      deliveryCharge,
      duration: roadDistanceData?.duration,
      coordinates,
      shopLocation: SHOP_LOCATION,
      formattedAddress: formattedAddress || deliveryAddress,
      freeDeliveryRadius: deliverySettings.FREE_DELIVERY_RADIUS_KM,
      usingGoogleMaps: roadDistanceData?.usingGoogleMaps ?? false,
      calculationDetails: {
        distanceKm: distance,
        freeRadiusKm: deliverySettings.FREE_DELIVERY_RADIUS_KM,
        extraKm: distance > deliverySettings.FREE_DELIVERY_RADIUS_KM 
          ? Math.round((distance - deliverySettings.FREE_DELIVERY_RADIUS_KM) * 100) / 100 
          : 0,
        chargePerKm: deliverySettings.CHARGE_PER_KM,
        baseFee: deliverySettings.BASE_DELIVERY_FEE
      }
    })
  } catch (error) {
    console.error('❌ Error calculating delivery:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to calculate delivery charge',
        details: error instanceof Error ? error.message : 'Unknown error',
        distance: null,
        deliveryCharge: 0
      },
      { status: 200 } // Return 200 so frontend can handle the error
    )
  }
}

