'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, X } from 'lucide-react'

// Global flag to prevent duplicate script loading
declare global {
  interface Window {
    googleMapsScriptLoading?: boolean
    googleMapsScriptLoaded?: boolean
  }
}

interface AddressMapPickerProps {
  onAddressSelect: (address: string, coordinates: { lat: number; lng: number }) => void
  onClose: () => void
  initialAddress?: string
}

export default function AddressMapPicker({ onAddressSelect, onClose, initialAddress }: AddressMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [selectedAddress, setSelectedAddress] = useState(initialAddress || '')
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [geocoder, setGeocoder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not found. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.')
      return
    }

    let mapInstance: any = null
    let markerInstance: any = null
    let geocoderInstance: any = null

    function initializeMap() {
      if (!mapRef.current || !window.google) return

      const shopLocation = { lat: 18.5996, lng: 73.7689 } // K2 Chicken location
      
      mapInstance = new window.google.maps.Map(mapRef.current, {
        center: shopLocation,
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      geocoderInstance = new window.google.maps.Geocoder()
      setGeocoder(geocoderInstance)

      // Check if AdvancedMarkerElement is available, otherwise fallback to Marker
      const useAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement

      if (useAdvancedMarker) {
        // Use AdvancedMarkerElement (new API)
        // Create marker for shop location
        const shopMarkerContent = document.createElement('div')
        shopMarkerContent.innerHTML = '🏪'
        shopMarkerContent.style.fontSize = '24px'
        shopMarkerContent.style.textAlign = 'center'
        shopMarkerContent.style.cursor = 'pointer'
        
        new window.google.maps.marker.AdvancedMarkerElement({
          position: shopLocation,
          map: mapInstance,
          title: 'K2 Chicken',
          content: shopMarkerContent,
        })

        // Create draggable marker for delivery location
        const deliveryMarkerContent = document.createElement('div')
        deliveryMarkerContent.style.width = '20px'
        deliveryMarkerContent.style.height = '20px'
        deliveryMarkerContent.style.borderRadius = '50%'
        deliveryMarkerContent.style.backgroundColor = '#10B981'
        deliveryMarkerContent.style.border = '3px solid white'
        deliveryMarkerContent.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
        deliveryMarkerContent.style.cursor = 'grab'
        deliveryMarkerContent.title = 'Delivery Location'
        
        markerInstance = new window.google.maps.marker.AdvancedMarkerElement({
          position: mapInstance.getCenter()!,
          map: mapInstance,
          content: deliveryMarkerContent,
          gmpDraggable: true,
          title: 'Delivery Location',
        })
      } else {
        // Fallback to legacy Marker API
        console.warn('AdvancedMarkerElement not available, using legacy Marker API')
        
        // Create marker for shop location
        new window.google.maps.Marker({
          position: shopLocation,
          map: mapInstance,
          title: 'K2 Chicken',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#FF6B35',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          label: {
            text: '🏪',
            fontSize: '20px',
          },
        })

        // Create draggable marker for delivery location
        markerInstance = new window.google.maps.Marker({
          position: mapInstance.getCenter()!,
          map: mapInstance,
          draggable: true,
          title: 'Delivery Location',
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        })
      }

      setMarker(markerInstance)
      setMap(mapInstance)

      // Update address when marker is dragged
      if (useAdvancedMarker) {
        // AdvancedMarkerElement uses addEventListener
        markerInstance.addEventListener('dragend', (e: any) => {
          const position = markerInstance.position
          if (position && geocoderInstance) {
            // Handle both LatLng object and LatLngLiteral
            let lat: number, lng: number
            if (typeof position === 'object') {
              if ('lat' in position && typeof position.lat === 'function') {
                // It's a LatLng object
                lat = position.lat()
                lng = position.lng()
              } else if ('lat' in position && typeof position.lat === 'number') {
                // It's a LatLngLiteral
                lat = position.lat
                lng = position.lng
              } else {
                return
              }
            } else {
              return
            }
            reverseGeocode(lat, lng, geocoderInstance)
          }
        })
      } else {
        // Legacy Marker uses addListener
        markerInstance.addListener('dragend', () => {
          const position = markerInstance.getPosition()
          if (position && geocoderInstance) {
            reverseGeocode(position.lat(), position.lng(), geocoderInstance)
          }
        })
      }

      // Update marker position when map is clicked
      mapInstance.addListener('click', (e: any) => {
        if (e.latLng && geocoderInstance) {
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          if (useAdvancedMarker) {
            markerInstance.position = { lat, lng }
          } else {
            markerInstance.setPosition({ lat, lng })
          }
          reverseGeocode(lat, lng, geocoderInstance)
        }
      })

      // Initialize with current center if no initial address
      if (!initialAddress) {
        reverseGeocode(mapInstance.getCenter()!.lat(), mapInstance.getCenter()!.lng(), geocoderInstance)
      } else {
        // Geocode initial address
        geocoderInstance.geocode(
          { address: initialAddress + ', Pune, Maharashtra, India' },
          (results: any, status: string) => {
            if (status === 'OK' && results && results[0]) {
              const location = results[0].geometry.location
              const lat = location.lat()
              const lng = location.lng()
              mapInstance.setCenter({ lat, lng })
              mapInstance.setZoom(15)
              const useAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement
              if (useAdvancedMarker) {
                markerInstance.position = { lat, lng }
              } else {
                markerInstance.setPosition({ lat, lng })
              }
              setSelectedAddress(results[0].formatted_address)
              setCoordinates({ lat, lng })
            }
          }
        )
      }
    }

    function reverseGeocode(lat: number, lng: number, geocoder: any) {
      setIsLoading(true)
      geocoder.geocode(
        { location: { lat, lng } },
        (results: any, status: string) => {
          setIsLoading(false)
          if (status === 'OK' && results && results[0]) {
            setSelectedAddress(results[0].formatted_address)
            setCoordinates({ lat, lng })
          }
        }
      )
    }

    // Load Google Maps script if not already loaded
    // Check if script is already in the DOM or being loaded to prevent duplicate loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]') as HTMLScriptElement
    
    if (!window.google && !existingScript && !window.googleMapsScriptLoading) {
      // Set global flag to prevent other instances from loading
      window.googleMapsScriptLoading = true
      
      const script = document.createElement('script')
      // Add marker library for AdvancedMarkerElement
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&loading=async`
      script.async = true
      script.defer = true
      script.id = 'google-maps-script' // Add ID to identify the script
      
      let scriptLoaded = false
      script.onload = () => {
        if (scriptLoaded) return // Prevent multiple calls
        scriptLoaded = true
        window.googleMapsScriptLoading = false
        window.googleMapsScriptLoaded = true
        // Wait a bit for the marker library to be fully available
        setTimeout(() => {
          if (window.google && window.google.maps) {
            setMapLoaded(true)
            initializeMap()
          }
        }, 300)
      }
      script.onerror = () => {
        console.error('Failed to load Google Maps script')
        window.googleMapsScriptLoading = false
        setIsLoading(false)
      }
      document.head.appendChild(script)
    } else if (window.google && window.google.maps) {
      // Google Maps is already loaded, just initialize
      window.googleMapsScriptLoaded = true
      setTimeout(() => {
        setMapLoaded(true)
        initializeMap()
      }, 100)
    } else if (existingScript || window.googleMapsScriptLoading) {
      // Script is loading, wait for it
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogle)
          window.googleMapsScriptLoaded = true
          setTimeout(() => {
            setMapLoaded(true)
            initializeMap()
          }, 100)
        }
      }, 100)
      
      // Cleanup interval after 10 seconds
      setTimeout(() => {
        clearInterval(checkGoogle)
        if (!window.google) {
          console.error('Google Maps failed to load after 10 seconds')
          setIsLoading(false)
        }
      }, 10000)
    }

    return () => {
      // Cleanup - don't remove the script as it might be used by other components
      // Just clear the map instance references
      mapInstance = null
      markerInstance = null
      geocoderInstance = null
    }
  }, [])

  const handleAddressSearch = () => {
    if (!window.google || !selectedAddress.trim()) return

    const geocoderInstance = geocoder || new window.google.maps.Geocoder()
    if (!geocoder) {
      setGeocoder(geocoderInstance)
    }

    setIsLoading(true)
    geocoderInstance.geocode(
      { address: selectedAddress + ', Pune, Maharashtra, India' },
      (results: any, status: string) => {
        setIsLoading(false)
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location
          const lat = location.lat()
          const lng = location.lng()
          
          setCoordinates({ lat, lng })
          setSelectedAddress(results[0].formatted_address)
          
          if (map && marker) {
            map.setCenter({ lat, lng })
            map.setZoom(15)
            const useAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement
            if (useAdvancedMarker) {
              marker.position = { lat, lng }
            } else {
              marker.setPosition({ lat, lng })
            }
          }
        } else {
          alert('Address not found. Please try a more specific address.')
        }
      }
    )
  }

  // Re-geocode when initial address changes
  useEffect(() => {
    if (initialAddress && map && marker && geocoder && window.google) {
      geocoder.geocode(
        { address: initialAddress + ', Pune, Maharashtra, India' },
        (results: any, status: string) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location
            const lat = location.lat()
            const lng = location.lng()
            map.setCenter({ lat, lng })
            map.setZoom(15)
            const useAdvancedMarker = window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement
            if (useAdvancedMarker) {
              marker.position = { lat, lng }
            } else {
              marker.setPosition({ lat, lng })
            }
            setSelectedAddress(results[0].formatted_address)
            setCoordinates({ lat, lng })
          }
        }
      )
    }
  }, [initialAddress, map, marker, geocoder])

  const handleConfirm = () => {
    if (coordinates && selectedAddress) {
      onAddressSelect(selectedAddress, coordinates)
      onClose()
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold mb-2">Google Maps API Key Required</h3>
          <p className="text-gray-600 mb-4">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables to use the map picker.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-chicken-red text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <MapPin className="text-chicken-red" size={24} />
            <h2 className="text-xl font-semibold">Select Delivery Address on Map</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Address Search */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
              placeholder="Search or enter address..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            />
            <button
              onClick={handleAddressSearch}
              disabled={isLoading}
              className="px-6 py-2 bg-chicken-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          {isLoading && (
            <p className="text-sm text-gray-500 mt-2">Locating address...</p>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Selected Address:</p>
            <p className="font-medium text-gray-900">{selectedAddress || 'Click on map to select location'}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!coordinates || !selectedAddress}
              className="flex-1 px-4 py-2 bg-chicken-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirm Address
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

