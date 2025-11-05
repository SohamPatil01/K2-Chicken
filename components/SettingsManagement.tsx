'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface SettingsData {
  delivery_radius_km: { value: string; description: string }
  charge_per_km: { value: string; description: string }
  base_delivery_fee: { value: string; description: string }
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SettingsData>({
    delivery_radius_km: { value: '5', description: 'Free delivery radius in kilometers' },
    charge_per_km: { value: '5', description: 'Delivery charge per kilometer beyond the free radius' },
    base_delivery_fee: { value: '0', description: 'Base delivery fee (usually 0)' }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setSettings(data.settings)
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
    setMessage(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    try {
      // Validate inputs
      const radius = parseFloat(settings.delivery_radius_km.value)
      const charge = parseFloat(settings.charge_per_km.value)
      const base = parseFloat(settings.base_delivery_fee.value)

      if (isNaN(radius) || radius < 0) {
        setMessage({ type: 'error', text: 'Delivery radius must be a positive number' })
        setIsSaving(false)
        return
      }

      if (isNaN(charge) || charge < 0) {
        setMessage({ type: 'error', text: 'Charge per km must be a positive number' })
        setIsSaving(false)
        return
      }

      if (isNaN(base) || base < 0) {
        setMessage({ type: 'error', text: 'Base delivery fee must be a positive number' })
        setIsSaving(false)
        return
      }

      const settingsToSave: Record<string, string> = {}
      Object.keys(settings).forEach(key => {
        settingsToSave[key] = settings[key as keyof SettingsData].value
      })

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ settings: settingsToSave })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save settings' })
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'An error occurred while saving settings' })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chicken-red"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Delivery Settings</h2>
          <p className="text-gray-600 mt-1">Configure delivery radius and charges</p>
        </div>
        <Settings className="h-8 w-8 text-chicken-red" />
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-3 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Delivery Radius */}
        <div>
          <label htmlFor="delivery_radius_km" className="block text-sm font-medium text-gray-700 mb-2">
            Free Delivery Radius (km)
          </label>
          <input
            type="number"
            id="delivery_radius_km"
            min="0"
            step="0.1"
            value={settings.delivery_radius_km.value}
            onChange={(e) => handleChange('delivery_radius_km', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter radius in kilometers"
          />
          <p className="text-sm text-gray-500 mt-1">{settings.delivery_radius_km.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            Example: 5 means free delivery within 5km from the shop
          </p>
        </div>

        {/* Charge Per KM */}
        <div>
          <label htmlFor="charge_per_km" className="block text-sm font-medium text-gray-700 mb-2">
            Charge Per Kilometer (₹)
          </label>
          <input
            type="number"
            id="charge_per_km"
            min="0"
            step="0.1"
            value={settings.charge_per_km.value}
            onChange={(e) => handleChange('charge_per_km', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter charge per kilometer"
          />
          <p className="text-sm text-gray-500 mt-1">{settings.charge_per_km.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            Example: 5 means ₹5 per km beyond the free delivery radius
          </p>
        </div>

        {/* Base Delivery Fee */}
        <div>
          <label htmlFor="base_delivery_fee" className="block text-sm font-medium text-gray-700 mb-2">
            Base Delivery Fee (₹)
          </label>
          <input
            type="number"
            id="base_delivery_fee"
            min="0"
            step="0.1"
            value={settings.base_delivery_fee.value}
            onChange={(e) => handleChange('base_delivery_fee', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter base delivery fee"
          />
          <p className="text-sm text-gray-500 mt-1">{settings.base_delivery_fee.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            Usually set to 0. This is added to the calculated delivery charge.
          </p>
        </div>

        {/* Delivery Calculation Example */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How Delivery Charges Work:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• Free delivery within {settings.delivery_radius_km.value} km</p>
            <p>• Beyond {settings.delivery_radius_km.value} km: ₹{settings.charge_per_km.value} per additional km</p>
            <p className="mt-2 font-medium">Example:</p>
            <p className="pl-4">
              If customer is 8 km away and radius is {settings.delivery_radius_km.value} km:<br />
              Extra distance: {8 - parseFloat(settings.delivery_radius_km.value)} km<br />
              Charge: ₹{(8 - parseFloat(settings.delivery_radius_km.value)) * parseFloat(settings.charge_per_km.value) + parseFloat(settings.base_delivery_fee.value)}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center space-x-2 bg-chicken-red text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save size={20} />
              <span>Save Settings</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

