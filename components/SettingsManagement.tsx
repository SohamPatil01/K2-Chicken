"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  AlertCircle,
  CheckCircle,
  Truck,
  X,
} from "lucide-react";

interface SettingsData {
  delivery_radius_km: { value: string; description: string };
  charge_per_km: { value: string; description: string };
  base_delivery_fee: { value: string; description: string };
  delivery_enabled: { value: string; description: string };
}

export default function SettingsManagement() {
  const [settings, setSettings] = useState<SettingsData>({
    delivery_radius_km: {
      value: "5",
      description: "Free delivery radius in kilometers",
    },
    charge_per_km: {
      value: "5",
      description: "Delivery charge per kilometer beyond the free radius",
    },
    base_delivery_fee: {
      value: "0",
      description: "Base delivery fee (usually 0)",
    },
    delivery_enabled: {
      value: "true",
      description: "Enable or disable delivery service",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          // Ensure delivery_enabled exists, default to 'true' if not present
          const fetchedSettings = data.settings;
          if (!fetchedSettings.delivery_enabled) {
            fetchedSettings.delivery_enabled = {
              value: "true",
              description: "Enable or disable delivery service",
            };
          }
          setSettings(fetchedSettings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key: keyof SettingsData, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
    setMessage(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      // Validate inputs
      const radius = parseFloat(settings.delivery_radius_km.value);
      const charge = parseFloat(settings.charge_per_km.value);
      const base = parseFloat(settings.base_delivery_fee.value);

      if (isNaN(radius) || radius < 0) {
        setMessage({
          type: "error",
          text: "Delivery radius must be a positive number",
        });
        setIsSaving(false);
        return;
      }

      if (isNaN(charge) || charge < 0) {
        setMessage({
          type: "error",
          text: "Charge per km must be a positive number",
        });
        setIsSaving(false);
        return;
      }

      if (isNaN(base) || base < 0) {
        setMessage({
          type: "error",
          text: "Base delivery fee must be a positive number",
        });
        setIsSaving(false);
        return;
      }

      const settingsToSave: Record<string, string> = {};
      Object.keys(settings).forEach((key) => {
        settingsToSave[key] = settings[key as keyof SettingsData].value;
      });

      // Ensure delivery_enabled is saved
      if (!settingsToSave.delivery_enabled) {
        settingsToSave.delivery_enabled = "true";
      }

      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ settings: settingsToSave }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: "success", text: "Settings saved successfully!" });
        // Refresh settings from server to ensure we have the latest values
        await fetchSettings();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save settings",
        });
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage({
        type: "error",
        text: "An error occurred while saving settings",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chicken-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Delivery Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure delivery radius and charges
          </p>
        </div>
        <Settings className="h-8 w-8 text-chicken-red" />
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center space-x-3 ${
            message.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span
            className={
              message.type === "success" ? "text-green-800" : "text-red-800"
            }
          >
            {message.text}
          </span>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Delivery Enable/Disable Toggle */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-lg ${
                  settings.delivery_enabled?.value === "true"
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {settings.delivery_enabled?.value === "true" ? (
                  <Truck className="h-6 w-6 text-green-600" />
                ) : (
                  <X className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delivery Service
                </h3>
                <p className="text-sm text-gray-600">
                  {settings.delivery_enabled?.value === "true"
                    ? "Delivery is currently enabled"
                    : "Delivery is currently disabled"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const newValue =
                  settings.delivery_enabled?.value === "true"
                    ? "false"
                    : "true";
                handleChange("delivery_enabled", newValue);
              }}
              className={`relative inline-flex h-12 w-24 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-100 focus:ring-offset-2 ${
                settings.delivery_enabled?.value === "true"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-11 w-11 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.delivery_enabled?.value === "true"
                    ? "translate-x-12"
                    : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="mt-4 p-3 bg-white/60 rounded-lg">
            <p className="text-sm text-gray-700">
              {settings.delivery_enabled?.value === "true"
                ? "✅ Customers can place delivery orders. Toggle off to temporarily disable delivery service."
                : "⚠️ Delivery is disabled. Customers will only be able to place pickup orders. Toggle on to enable delivery service."}
            </p>
          </div>
        </div>

        {/* Delivery Radius */}
        <div>
          <label
            htmlFor="delivery_radius_km"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Free Delivery Radius (km)
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="delivery_radius_km"
            value={settings.delivery_radius_km.value}
            onChange={(e) => {
              const value = e.target.value;
              // Allow numbers, decimal point, and empty string
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleChange("delivery_radius_km", value);
              }
            }}
            onBlur={(e) => {
              // Validate and format on blur
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value < 0) {
                handleChange("delivery_radius_km", "5");
              } else {
                handleChange("delivery_radius_km", value.toString());
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter radius in kilometers (e.g., 5 or 5.5)"
          />
          <p className="text-sm text-gray-500 mt-1">
            {settings.delivery_radius_km.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Example: 5 means free delivery within 5km from the shop
          </p>
        </div>

        {/* Charge Per KM */}
        <div>
          <label
            htmlFor="charge_per_km"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Charge Per Kilometer (₹)
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="charge_per_km"
            value={settings.charge_per_km.value}
            onChange={(e) => {
              const value = e.target.value;
              // Allow numbers, decimal point, and empty string
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleChange("charge_per_km", value);
              }
            }}
            onBlur={(e) => {
              // Validate and format on blur
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value < 0) {
                handleChange("charge_per_km", "5");
              } else {
                handleChange("charge_per_km", value.toString());
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter charge per kilometer (e.g., 5 or 5.5)"
          />
          <p className="text-sm text-gray-500 mt-1">
            {settings.charge_per_km.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Example: 5 means ₹5 per km beyond the free delivery radius
          </p>
        </div>

        {/* Base Delivery Fee */}
        <div>
          <label
            htmlFor="base_delivery_fee"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Base Delivery Fee (₹)
          </label>
          <input
            type="text"
            inputMode="decimal"
            id="base_delivery_fee"
            value={settings.base_delivery_fee.value}
            onChange={(e) => {
              const value = e.target.value;
              // Allow numbers, decimal point, and empty string
              if (value === "" || /^\d*\.?\d*$/.test(value)) {
                handleChange("base_delivery_fee", value);
              }
            }}
            onBlur={(e) => {
              // Validate and format on blur
              const value = parseFloat(e.target.value);
              if (isNaN(value) || value < 0) {
                handleChange("base_delivery_fee", "0");
              } else {
                handleChange("base_delivery_fee", value.toString());
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
            placeholder="Enter base delivery fee (e.g., 0 or 10)"
          />
          <p className="text-sm text-gray-500 mt-1">
            {settings.base_delivery_fee.description}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Usually set to 0. This is added to the calculated delivery charge.
          </p>
        </div>

        {/* Delivery Calculation Example */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            How Delivery Charges Work:
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              • Free delivery within {settings.delivery_radius_km.value || "5"}{" "}
              km
            </p>
            <p>
              • Beyond {settings.delivery_radius_km.value || "5"} km: ₹
              {settings.charge_per_km.value || "5"} per additional km
            </p>
            <p className="mt-2 font-medium">Example:</p>
            <p className="pl-4">
              If customer is 8 km away and radius is{" "}
              {settings.delivery_radius_km.value || "5"} km:
              <br />
              Extra distance:{" "}
              {Math.max(
                0,
                8 - (parseFloat(settings.delivery_radius_km.value) || 5)
              ).toFixed(1)}{" "}
              km
              <br />
              Charge: ₹
              {(
                Math.max(
                  0,
                  8 - (parseFloat(settings.delivery_radius_km.value) || 5)
                ) *
                  (parseFloat(settings.charge_per_km.value) || 5) +
                (parseFloat(settings.base_delivery_fee.value) || 0)
              ).toFixed(0)}
            </p>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center space-x-2 bg-gray-50 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
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
  );
}
