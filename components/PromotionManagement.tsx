"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from "lucide-react";

interface Promotion {
  id?: number;
  title: string;
  description?: string;
  discount_type?: "percentage" | "fixed" | "buy_x_get_y" | "free_delivery";
  discount_value?: number;
  promo_code?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  display_order: number;
}

export default function PromotionManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Promotion>({
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    promo_code: "",
    image_url: "",
    start_date: "",
    end_date: "",
    is_active: true,
    display_order: 0,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/promotions");
      if (!response.ok) {
        throw new Error(`Failed to fetch promotions: ${response.statusText}`);
      }
      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      setPromotions([]);
      alert("Failed to load promotions. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title || !formData.title.trim()) {
      alert("Please enter a promotion title");
      return;
    }

    if (
      formData.discount_type === "percentage" ||
      formData.discount_type === "fixed"
    ) {
      if (!formData.discount_value || formData.discount_value <= 0) {
        alert("Please enter a valid discount value (greater than 0)");
        return;
      }
    }

    if (
      formData.discount_type === "percentage" &&
      formData.discount_value &&
      formData.discount_value > 100
    ) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    // Validate dates
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        alert("End date must be after start date");
        return;
      }
    }

    try {
      const url = editingId
        ? `/api/promotions/${editingId}`
        : "/api/promotions";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for admin authentication
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPromotions();
        resetForm();
        alert("Promotion saved successfully!");
      } else {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to save promotion" }));
        alert(`Error: ${error.error || "Failed to save promotion"}`);
      }
    } catch (error) {
      console.error("Error saving promotion:", error);
      alert("Failed to save promotion");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      const response = await fetch(`/api/promotions/${id}`, {
        method: "DELETE",
        credentials: "include", // Include cookies for admin authentication
      });

      if (response.ok) {
        await fetchPromotions();
        alert("Promotion deleted successfully!");
      } else {
        const error = await response
          .json()
          .catch(() => ({ error: "Failed to delete promotion" }));
        alert(error.error || "Failed to delete promotion");
      }
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert("Failed to delete promotion");
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setFormData({
      ...promotion,
      start_date: promotion.start_date
        ? new Date(promotion.start_date).toISOString().split("T")[0]
        : "",
      end_date: promotion.end_date
        ? new Date(promotion.end_date).toISOString().split("T")[0]
        : "",
    });
    setEditingId(promotion.id || null);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      promo_code: "",
      image_url: "",
      start_date: "",
      end_date: "",
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === "percentage" && promo.discount_value) {
      return `${promo.discount_value}% OFF`;
    } else if (promo.discount_type === "fixed" && promo.discount_value) {
      return `₹${promo.discount_value} OFF`;
    } else if (promo.discount_type === "free_delivery") {
      return "FREE DELIVERY";
    } else if (promo.discount_type === "buy_x_get_y") {
      return "BUY X GET Y";
    }
    return "SPECIAL OFFER";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading promotions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Promotion Flyers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
        >
          <Plus className="h-5 w-5" />
          <span>{showForm ? "Cancel" : "Add Promotion"}</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg border border-gray-200 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Discount Type
              </label>
              <select
                value={formData.discount_type || "percentage"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_type: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="percentage">Percentage Off</option>
                <option value="fixed">Fixed Amount Off</option>
                <option value="free_delivery">Free Delivery</option>
                <option value="buy_x_get_y">Buy X Get Y</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Discount Value
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.discount_value || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setFormData({
                    ...formData,
                    discount_value: isNaN(value) ? 0 : value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Promo Code
              </label>
              <input
                type="text"
                value={formData.promo_code || ""}
                onChange={(e) =>
                  setFormData({ ...formData, promo_code: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image_url || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image_url: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setFormData({
                    ...formData,
                    display_order: isNaN(value) ? 0 : value,
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Active
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
            >
              {editingId ? "Update" : "Create"} Promotion
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className={`bg-white rounded-lg border-2 overflow-hidden shadow-lg ${
              promo.is_active
                ? "border-orange-500"
                : "border-gray-300 opacity-60"
            }`}
          >
            {promo.image_url && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={promo.image_url}
                  alt={promo.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {promo.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    promo.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {promo.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              {promo.description && (
                <p className="text-sm text-gray-600 mb-2">
                  {promo.description}
                </p>
              )}
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold rounded">
                  {formatDiscount(promo)}
                </span>
                {promo.promo_code && (
                  <span className="text-xs text-gray-500">
                    Code: {promo.promo_code}
                  </span>
                )}
              </div>
              {(promo.start_date || promo.end_date) && (
                <p className="text-xs text-gray-500 mb-3">
                  {promo.start_date &&
                    new Date(promo.start_date).toLocaleDateString()}
                  {promo.start_date && promo.end_date && " - "}
                  {promo.end_date &&
                    new Date(promo.end_date).toLocaleDateString()}
                </p>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(promo)}
                  className="flex-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
                >
                  <Edit className="h-4 w-4 inline mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => promo.id && handleDelete(promo.id)}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
                >
                  <Trash2 className="h-4 w-4 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {promotions.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">No promotions yet</p>
          <p className="text-sm text-gray-500 mt-2">
            Click "Add Promotion" to create your first offer flyer
          </p>
        </div>
      )}
    </div>
  );
}
