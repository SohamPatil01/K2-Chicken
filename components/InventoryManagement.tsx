"use client";

import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Edit2,
  Save,
  X,
  History,
  Plus,
  Trash2,
  Truck,
  Calendar,
} from "lucide-react";

interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  product_category: string;
  product_image_url: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  minimum_stock_level: number;
  stock_status: "low" | "medium" | "good";
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available: boolean;
}

interface InventoryHistory {
  id: number;
  product_id: number;
  product_name: string;
  change_type: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  notes: string;
  created_at: string;
}

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInventoryItem, setEditingInventoryItem] = useState<
    number | null
  >(null);
  const [editInventoryValues, setEditInventoryValues] = useState<{
    quantity: number;
    minimum_stock_level: number;
  } | null>(null);
  const [editingProduct, setEditingProduct] = useState<InventoryItem | null>(
    null
  );
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_available: true,
    quantity: 0,
    minimum_stock_level: 10,
  });
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showStockDelivery, setShowStockDelivery] = useState(false);
  const [stockDeliveryForm, setStockDeliveryForm] = useState({
    product_id: 0,
    quantity: 0,
    delivery_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const [deliveryHistory, setDeliveryHistory] = useState<InventoryHistory[]>(
    []
  );
  const [showDeliveryHistory, setShowDeliveryHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (productId: number) => {
    try {
      const response = await fetch(
        `/api/inventory/history?product_id=${productId}&limit=20`
      );
      const data = await response.json();
      setHistory(data);
      setSelectedProductId(productId);
      setShowHistory(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Inventory quantity editing
  const handleEditInventory = (item: InventoryItem) => {
    setEditingInventoryItem(item.id);
    setEditInventoryValues({
      quantity: item.quantity,
      minimum_stock_level: item.minimum_stock_level,
    });
  };

  const handleSaveInventory = async (item: InventoryItem) => {
    if (!editInventoryValues) return;

    try {
      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: item.product_id,
          quantity: editInventoryValues.quantity,
          minimum_stock_level: editInventoryValues.minimum_stock_level,
          notes: `Manual adjustment by admin`,
        }),
      });

      if (response.ok) {
        await fetchInventory();
        setEditingInventoryItem(null);
        setEditInventoryValues(null);
      } else {
        const error = await response.json();
        alert(
          "Failed to update inventory: " + (error.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      alert("Failed to update inventory");
    }
  };

  const handleStockDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stockDeliveryForm.product_id || stockDeliveryForm.quantity <= 0) {
      alert("Please select a product and enter a valid quantity");
      return;
    }

    try {
      const item = inventory.find(
        (i) => i.product_id === stockDeliveryForm.product_id
      );
      if (!item) return;

      const newQuantity = item.quantity + stockDeliveryForm.quantity;
      // Make sure the notes clearly indicate this is a stock delivery
      const notes = `Stock delivery to store - ${
        stockDeliveryForm.delivery_date
      }${stockDeliveryForm.notes ? ": " + stockDeliveryForm.notes : ""}`;

      const response = await fetch("/api/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: stockDeliveryForm.product_id,
          quantity: newQuantity,
          minimum_stock_level: item.minimum_stock_level,
          notes: notes,
        }),
      });

      if (response.ok) {
        await fetchInventory();
        setShowStockDelivery(false);
        setStockDeliveryForm({
          product_id: 0,
          quantity: 0,
          delivery_date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        // Refresh delivery history if it's open
        if (showDeliveryHistory) {
          fetchDeliveryHistory(selectedDate);
        }
        alert(
          `Successfully recorded ${stockDeliveryForm.quantity} units delivered for ${item.product_name}`
        );
      } else {
        const error = await response.json();
        alert(
          "Failed to record stock delivery: " + (error.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error recording stock delivery:", error);
      alert("Failed to record stock delivery");
    }
  };

  const fetchDeliveryHistory = async (date?: string) => {
    try {
      const dateToFetch = date || selectedDate;
      const response = await fetch(
        `/api/inventory/history?change_type=stock_delivery&date=${dateToFetch}&limit=100`
      );
      const data = await response.json();
      setDeliveryHistory(data);
    } catch (error) {
      console.error("Error fetching delivery history:", error);
    }
  };

  const handleCancelInventory = () => {
    setEditingInventoryItem(null);
    setEditInventoryValues(null);
  };

  // Product CRUD operations
  const handleAddProduct = () => {
    setIsAddingProduct(true);
    setProductFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      is_available: true,
      quantity: 0,
      minimum_stock_level: 10,
    });
  };

  const handleEditProduct = async (item: InventoryItem) => {
    setEditingProduct(item);
    try {
      // Fetch full product details
      const response = await fetch(`/api/products/${item.product_id}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch product: ${response.statusText}`);
      }

      const product = await response.json();

      if (product.error) {
        throw new Error(product.error);
      }

      setProductFormData({
        name: product.name || item.product_name,
        description: product.description || "",
        price:
          product.price !== null && product.price !== undefined
            ? product.price.toString()
            : "",
        image_url: product.image_url || item.product_image_url || "",
        category: product.category || item.product_category,
        is_available: product.is_available ?? true,
        quantity: item.quantity,
        minimum_stock_level: item.minimum_stock_level,
      });
    } catch (error: any) {
      console.error("Error fetching product details:", error);
      // Fallback to inventory item data
      setProductFormData({
        name: item.product_name,
        description: "",
        price: "",
        image_url: item.product_image_url || "",
        category: item.product_category,
        is_available: true,
        quantity: item.quantity,
        minimum_stock_level: item.minimum_stock_level,
      });
      alert(
        "Warning: Could not fetch full product details. Using available information."
      );
    }
  };

  const handleDeleteProduct = async (
    productId: number,
    productName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete "${productName}"? This will also delete its inventory record.\n\nNote: Order history will be preserved but product references will be removed.`
      )
    ) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        const result = await response.json();

        if (response.ok) {
          await fetchInventory();
        } else {
          alert(
            "Failed to delete product: " + (result.error || "Unknown error")
          );
        }
      } catch (error: any) {
        console.error("Error deleting product:", error);
        alert(
          "Failed to delete product: " + (error.message || "Network error")
        );
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setProductFormData((prev) => ({ ...prev, image_url: result.imageUrl }));
        setShowImagePreview(true);
      } else {
        alert("Failed to upload image: " + (result.error || "Unknown error"));
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload image: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Update existing product
        const productResponse = await fetch(
          `/api/products/${editingProduct.product_id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: productFormData.name,
              description: productFormData.description,
              price: productFormData.price
                ? parseFloat(productFormData.price)
                : 0,
              image_url: productFormData.image_url,
              category: productFormData.category,
              is_available: productFormData.is_available,
            }),
          }
        );

        if (!productResponse.ok) {
          const error = await productResponse.json();
          throw new Error(error.error || "Failed to update product");
        }

        // Update inventory
        const inventoryResponse = await fetch("/api/inventory", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: editingProduct.product_id,
            quantity: productFormData.quantity,
            minimum_stock_level: productFormData.minimum_stock_level,
            notes: "Updated via product edit",
          }),
        });

        if (!inventoryResponse.ok) {
          const error = await inventoryResponse.json();
          throw new Error(error.error || "Failed to update inventory");
        }

        await fetchInventory();
        setEditingProduct(null);
        resetProductForm();
      } else {
        // Create new product
        const productResponse = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: productFormData.name,
            description: productFormData.description,
            price: productFormData.price
              ? parseFloat(productFormData.price)
              : 0,
            image_url: productFormData.image_url,
            category: productFormData.category,
            is_available: productFormData.is_available,
          }),
        });

        if (!productResponse.ok) {
          const error = await productResponse.json();
          throw new Error(error.error || "Failed to create product");
        }

        const newProduct = await productResponse.json();

        // Create inventory record for the new product
        const inventoryResponse = await fetch("/api/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: newProduct.id,
            quantity: productFormData.quantity,
            minimum_stock_level: productFormData.minimum_stock_level,
          }),
        });

        if (!inventoryResponse.ok) {
          const error = await inventoryResponse.json();
          throw new Error(error.error || "Failed to create inventory");
        }

        await fetchInventory();
        setIsAddingProduct(false);
        resetProductForm();
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert("Failed to save product: " + error.message);
    }
  };

  const resetProductForm = () => {
    setProductFormData({
      name: "",
      description: "",
      price: "",
      image_url: "",
      category: "",
      is_available: true,
      quantity: 0,
      minimum_stock_level: 10,
    });
    setEditingProduct(null);
    setIsAddingProduct(false);
    setShowImagePreview(false);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "good":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case "low":
        return <AlertTriangle size={16} className="text-red-600" />;
      case "medium":
        return <TrendingDown size={16} className="text-yellow-600" />;
      case "good":
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <Package size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const lowStockItems = inventory.filter((item) => item.stock_status === "low");
  const mediumStockItems = inventory.filter(
    (item) => item.stock_status === "medium"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Inventory</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Stock levels and deliveries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setShowDeliveryHistory(true);
              fetchDeliveryHistory();
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-medium"
          >
            <History size={14} />
            <span>Deliveries</span>
          </button>
          <button
            onClick={() => setShowStockDelivery(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs font-medium"
          >
            <Truck size={14} />
            <span>Record</span>
          </button>
          <button
            onClick={handleAddProduct}
            className="flex items-center space-x-1 px-2.5 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-medium"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Stock Delivery Form */}
      {showStockDelivery && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Record Delivery
            </h3>
            <button
              onClick={() => {
                setShowStockDelivery(false);
                setStockDeliveryForm({
                  product_id: 0,
                  quantity: 0,
                  delivery_date: new Date().toISOString().split("T")[0],
                  notes: "",
                });
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
          <form
            onSubmit={handleStockDelivery}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product *
              </label>
              <select
                value={stockDeliveryForm.product_id}
                onChange={(e) =>
                  setStockDeliveryForm({
                    ...stockDeliveryForm,
                    product_id: parseInt(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              >
                <option value="0">Select Product</option>
                {inventory.map((item) => (
                  <option key={item.product_id} value={item.product_id}>
                    {item.product_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={stockDeliveryForm.quantity}
                onChange={(e) =>
                  setStockDeliveryForm({
                    ...stockDeliveryForm,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  value={stockDeliveryForm.delivery_date}
                  onChange={(e) =>
                    setStockDeliveryForm({
                      ...stockDeliveryForm,
                      delivery_date: e.target.value,
                    })
                  }
                  className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <input
                type="text"
                value={stockDeliveryForm.notes}
                onChange={(e) =>
                  setStockDeliveryForm({
                    ...stockDeliveryForm,
                    notes: e.target.value,
                  })
                }
                placeholder="Supplier, batch, etc."
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowStockDelivery(false);
                  setStockDeliveryForm({
                    product_id: 0,
                    quantity: 0,
                    delivery_date: new Date().toISOString().split("T")[0],
                    notes: "",
                  });
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-1.5"
              >
                <Save size={14} />
                <span>Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delivery History View */}
      {showDeliveryHistory && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Daily Deliveries
            </h3>
            <button
              onClick={() => setShowDeliveryHistory(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>

          {/* Date Filter */}
          <div className="mb-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Calendar className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    fetchDeliveryHistory(e.target.value);
                  }}
                  className="w-full pl-9 pr-2 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={() => {
                  const today = new Date().toISOString().split("T")[0];
                  setSelectedDate(today);
                  fetchDeliveryHistory(today);
                }}
                className="px-2.5 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-xs font-medium"
              >
                Today
              </button>
            </div>
          </div>

          {/* Delivery List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {deliveryHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Truck className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-xs">No deliveries for this date</p>
              </div>
            ) : (
              deliveryHistory.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white border border-gray-200 rounded-md p-2.5 hover:border-purple-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="font-medium text-gray-900 text-sm truncate">
                          {delivery.product_name}
                        </span>
                      </div>
                      {delivery.notes && (
                        <p className="text-xs text-gray-600 truncate">
                          {delivery.notes}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(delivery.created_at).toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="text-sm font-semibold text-green-600">
                        +{delivery.quantity_change}
                      </div>
                      <div className="text-xs text-gray-500">
                        {delivery.previous_quantity}→{delivery.new_quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary */}
          {deliveryHistory.length > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-purple-700">
                  {deliveryHistory.length} deliveries
                </span>
                <span className="font-semibold text-green-700">
                  +
                  {deliveryHistory.reduce(
                    (sum, d) => sum + d.quantity_change,
                    0
                  )}{" "}
                  units
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Form */}
      {(isAddingProduct || editingProduct) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>

          <form
            onSubmit={handleProductSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={productFormData.name}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    name: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={productFormData.category}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    category: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                <option value="main">Main Course</option>
                <option value="appetizer">Appetizer</option>
                <option value="side">Side Dish</option>
                <option value="beverage">Beverage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={productFormData.price}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    price: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                value={productFormData.quantity}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                value={productFormData.minimum_stock_level}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    minimum_stock_level: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                    disabled={uploadingImage}
                  />
                  <label
                    htmlFor="image-upload"
                    className={`flex-1 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      uploadingImage
                        ? "opacity-50 cursor-not-allowed border-gray-300"
                        : productFormData.image_url
                        ? "border-green-300 bg-green-50 hover:border-green-400"
                        : "border-gray-300 hover:border-chicken-red"
                    }`}
                  >
                    <div className="text-center">
                      {uploadingImage ? (
                        <span className="text-gray-500">Uploading...</span>
                      ) : productFormData.image_url ? (
                        <span className="text-green-600">✓ Image Uploaded</span>
                      ) : (
                        <span className="text-chicken-red">
                          Choose Image File
                        </span>
                      )}
                    </div>
                  </label>
                </div>
                <input
                  type="text"
                  value={productFormData.image_url}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      image_url: e.target.value,
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent ${
                    productFormData.image_url
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Image URL or uploaded file path"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={productFormData.description}
                onChange={(e) =>
                  setProductFormData({
                    ...productFormData,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={productFormData.is_available}
                  onChange={(e) =>
                    setProductFormData({
                      ...productFormData,
                      is_available: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-chicken-red border-gray-300 rounded focus:ring-chicken-red"
                />
                <span className="text-sm font-medium text-gray-700">
                  Product is available
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetProductForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{editingProduct ? "Update" : "Create"} Product</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Alerts */}
      {(lowStockItems.length > 0 || mediumStockItems.length > 0) && (
        <div className="mb-4 space-y-1.5">
          {lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-2.5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-600" size={16} />
                <span className="text-sm font-medium text-red-800">
                  {lowStockItems.length} low stock
                </span>
              </div>
            </div>
          )}
          {mediumStockItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2.5">
              <div className="flex items-center space-x-2">
                <TrendingDown className="text-yellow-600" size={16} />
                <span className="text-sm font-medium text-yellow-800">
                  {mediumStockItems.length} running low
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inventory List */}
      <div className="space-y-2">
        {inventory.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                {item.product_image_url ? (
                  <img
                    src={item.product_image_url}
                    alt={item.product_name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const nextSibling = e.currentTarget
                        .nextElementSibling as HTMLElement | null;
                      if (nextSibling) {
                        nextSibling.style.display = "flex";
                      }
                    }}
                  />
                ) : null}
                <div
                  className={`w-full h-full ${
                    item.product_image_url ? "hidden" : "flex"
                  } bg-orange-50 items-center justify-center`}
                >
                  <span className="text-lg">🍗</span>
                </div>
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {item.product_name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {getStockStatusIcon(item.stock_status)}
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStockStatusColor(
                        item.stock_status
                      )}`}
                    >
                      {item.stock_status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 capitalize mt-0.5">
                  {item.product_category}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-3">
              {/* Inventory Details */}
              <div className="text-right text-xs">
                {editingInventoryItem === item.id ? (
                  <div className="flex items-center space-x-2">
                    <div>
                      <input
                        type="number"
                        value={editInventoryValues?.quantity || 0}
                        onChange={(e) =>
                          setEditInventoryValues({
                            ...editInventoryValues!,
                            quantity: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-16 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={editInventoryValues?.minimum_stock_level || 0}
                        onChange={(e) =>
                          setEditInventoryValues({
                            ...editInventoryValues!,
                            minimum_stock_level: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-14 px-1.5 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent"
                        min="0"
                        placeholder="Min"
                      />
                    </div>
                    <button
                      onClick={() => handleSaveInventory(item)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={handleCancelInventory}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <div>
                      <span className="text-gray-500">Total: </span>
                      <span className="font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Avail: </span>
                      <span
                        className={`font-semibold ${
                          item.available_quantity <= item.minimum_stock_level
                            ? "text-red-600"
                            : "text-gray-900"
                        }`}
                      >
                        {item.available_quantity}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {editingInventoryItem !== item.id && (
                <div className="flex items-center space-x-0.5">
                  <button
                    onClick={() => handleEditInventory(item)}
                    className="p-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                    title="Edit Stock"
                  >
                    <TrendingDown size={16} />
                  </button>
                  <button
                    onClick={() => handleEditProduct(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => fetchHistory(item.product_id)}
                    className="p-1.5 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                    title="History"
                  >
                    <History size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteProduct(item.product_id, item.product_name)
                    }
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Inventory History
                {selectedProductId && (
                  <span className="text-sm text-gray-600 ml-2">
                    (Product ID: {selectedProductId})
                  </span>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setHistory([]);
                  setSelectedProductId(null);
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                <X size={24} />
              </button>
            </div>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-600 text-center py-4">
                  No history available
                </p>
              ) : (
                history.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold">
                          {entry.product_name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {entry.change_type === "stock_delivery"
                            ? "🚚 Stock Delivery"
                            : entry.change_type === "delivery_deduction"
                            ? "📦 Order Delivery"
                            : entry.change_type === "adjustment"
                            ? "✏️ Adjustment"
                            : entry.change_type}
                        </div>
                        {entry.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-semibold ${
                            entry.quantity_change < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {entry.quantity_change > 0 ? "+" : ""}
                          {entry.quantity_change}
                        </div>
                        <div className="text-xs text-gray-600">
                          {entry.previous_quantity} → {entry.new_quantity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
