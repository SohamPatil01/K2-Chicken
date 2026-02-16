"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Product } from "@/context/CartContext";

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    image_url: "",
    category: "",
    is_available: true,
  });
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [quickPriceUpdate, setQuickPriceUpdate] = useState<{
    [key: number]: { price: string; original_price: string };
  }>({});
  const [updatingPrices, setUpdatingPrices] = useState<number[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products?all=true");
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    } finally {
      setLoading(false);
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
        setFormData((prev) => ({ ...prev, image_url: result.imageUrl }));
        setShowImagePreview(true);
        // Show success message
        console.log("Image uploaded successfully:", result.imageUrl);
      } else {
        alert("Failed to upload image: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Failed to upload image: " + errorMessage);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const price = parseFloat(formData.price);
      const originalPrice =
        formData.original_price && formData.original_price.trim() !== ""
          ? parseFloat(formData.original_price)
          : null;

      // Validation
      if (isNaN(price) || price <= 0) {
        alert("Please enter a valid current price (greater than 0)");
        return;
      }

      if (originalPrice !== null) {
        if (isNaN(originalPrice) || originalPrice <= 0) {
          alert(
            "Please enter a valid original price (greater than 0) or leave it empty"
          );
          return;
        }
        if (originalPrice < price) {
          alert("Original price cannot be less than current price");
          return;
        }
        // Allow original_price to be equal to price (no discount will be shown)
      }

      const productData = {
        ...formData,
        price: price,
        original_price: originalPrice,
      };

      if (editingProduct) {
        // Update existing product
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          await fetchProducts();
          setEditingProduct(null);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.error || "Failed to update product");
        }
      } else {
        // Create new product
        const response = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (response.ok) {
          await fetchProducts();
          setIsAdding(false);
          resetForm();
        } else {
          const error = await response.json();
          alert(error.error || "Failed to create product");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const originalPrice = (product as any).original_price || product.price;
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      original_price: originalPrice.toString(),
      image_url: product.image_url || "",
      category: product.category || "",
      is_available: product.is_available ?? true,
    });
  };

  const handleDelete = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchProducts();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      original_price: "",
      image_url: "",
      category: "",
      is_available: true,
    });
    setShowImagePreview(false);
    setEditingProduct(null);
    setIsAdding(false);
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

  const handleQuickPriceUpdate = async (
    productId: number,
    prices: { price: string; original_price: string }
  ) => {
    const price = parseFloat(prices.price);
    const originalPrice =
      prices.original_price && prices.original_price.trim() !== ""
        ? parseFloat(prices.original_price)
        : null;

    // Validation
    if (isNaN(price) || price <= 0) {
      alert("Please enter a valid current price (greater than 0)");
      return;
    }

    if (originalPrice !== null) {
      if (isNaN(originalPrice) || originalPrice <= 0) {
        alert(
          "Please enter a valid original price (greater than 0) or leave it empty"
        );
        return;
      }
      if (originalPrice <= price) {
        alert(
          "Original price must be greater than current price to show a discount"
        );
        return;
      }
    }

    setUpdatingPrices((prev) => [...prev, productId]);
    try {
      const product = products.find((p) => p.id === productId);
      if (!product) {
        console.error("❌ Product not found:", productId);
        return;
      }

      const updatePayload = {
        ...product,
        price: price,
        original_price: originalPrice,
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        category: product.category,
        is_available: product.is_available ?? true,
      };

      console.log("📤 Sending price update to API:", {
        productId,
        productName: product.name,
        oldPrice: product.price,
        newPrice: price,
        oldOriginalPrice: (product as any).original_price,
        newOriginalPrice: originalPrice,
      });

      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        console.log("✅ Price update successful:", {
          productId,
          productName: updatedProduct.name,
          newPrice: updatedProduct.price,
          newOriginalPrice: updatedProduct.original_price,
        });

        await fetchProducts();
        setQuickPriceUpdate((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });

        // Show success message
        alert(
          `✅ Price updated successfully!\n\nProduct: ${
            updatedProduct.name
          }\nNew Price: ₹${updatedProduct.price}\nOriginal Price: ${
            updatedProduct.original_price
              ? `₹${updatedProduct.original_price}`
              : "N/A"
          }`
        );
      } else {
        const error = await response.json();
        console.error("❌ Price update failed:", error);
        alert(error.error || "Failed to update prices");
      }
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update prices. Please try again.");
    } finally {
      setUpdatingPrices((prev) => prev.filter((id) => id !== productId));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Products</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage products and daily prices
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingProduct) && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {editingProduct ? "Edit Product" : "New Product"}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Current Price (Selling Price) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
                required
                placeholder="e.g., 249"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Original Price (Strikethrough Price)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.original_price}
                onChange={(e) => {
                  const value = e.target.value;
                  const currentPrice = parseFloat(formData.price) || 0;
                  const originalPrice = parseFloat(value) || 0;

                  // Warn if original price is less than or equal to current price
                  if (
                    value &&
                    originalPrice > 0 &&
                    originalPrice <= currentPrice
                  ) {
                    // Still allow typing, but will validate on submit
                  }

                  setFormData({ ...formData, original_price: value });
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
                placeholder="e.g., 299 (for discount)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if no discount. Original price must be greater than
                current price.
              </p>
              {formData.original_price &&
                formData.price &&
                parseFloat(formData.original_price) > 0 &&
                parseFloat(formData.price) > 0 &&
                parseFloat(formData.original_price) <=
                  parseFloat(formData.price) && (
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ Original price must be greater than current price
                  </p>
                )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Image
              </label>
              <div className="space-y-1.5">
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
                    className={`flex-1 px-2.5 py-1.5 border border-dashed rounded-md cursor-pointer transition-colors text-xs text-center ${
                      uploadingImage
                        ? "opacity-50 cursor-not-allowed border-gray-300"
                        : formData.image_url
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {uploadingImage
                      ? "Uploading..."
                      : formData.image_url
                      ? "✓ Uploaded"
                      : "Choose Image"}
                  </label>
                </div>

                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className={`w-full px-2.5 py-1.5 border rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm ${
                    formData.image_url
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  }`}
                  placeholder="Image URL"
                />

                {showImagePreview && formData.image_url && (
                  <div className="mt-1.5">
                    <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-200">
                      <img
                        src={formData.image_url}
                        alt="Preview"
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
                      <div className="hidden w-full h-full bg-gray-200 items-center justify-center text-gray-500 text-xs">
                        Error
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent text-sm"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) =>
                    setFormData({ ...formData, is_available: e.target.checked })
                  }
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-xs font-medium text-gray-700">
                  Available
                </span>
              </label>
            </div>

            <div className="md:col-span-2 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium flex items-center space-x-1.5"
              >
                <Save size={14} />
                <span>{editingProduct ? "Update" : "Create"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="space-y-2">
        {products && products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-md overflow-hidden border border-gray-200 flex-shrink-0 bg-white">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
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
                      product.image_url ? "hidden" : "flex"
                    } bg-orange-50 items-center justify-center`}
                  >
                    <span className="text-lg">🍗</span>
                  </div>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 text-sm truncate">
                      {product.name}
                    </h3>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        product.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.is_available ? "✓" : "✗"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {product.description}
                  </p>
                  <span className="text-xs text-gray-400 capitalize">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Quick Price Update */}
              <div className="flex items-center space-x-2 ml-3">
                <div className="flex flex-col space-y-1.5 bg-white rounded-md px-3 py-2 border border-gray-200 min-w-[180px]">
                  {quickPriceUpdate[product.id] !== undefined ? (
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1">
                        <label className="text-xs text-gray-500 w-14">
                          Current:
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={quickPriceUpdate[product.id].price}
                          onChange={(e) =>
                            setQuickPriceUpdate((prev) => ({
                              ...prev,
                              [product.id]: {
                                ...prev[product.id],
                                price: e.target.value,
                              },
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleQuickPriceUpdate(
                                product.id,
                                quickPriceUpdate[product.id]
                              );
                            } else if (e.key === "Escape") {
                              setQuickPriceUpdate((prev) => {
                                const updated = { ...prev };
                                delete updated[product.id];
                                return updated;
                              });
                            }
                          }}
                          className="w-20 px-1.5 py-0.5 text-xs border border-orange-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          placeholder="Price"
                          autoFocus
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <label className="text-xs text-gray-500 w-14">
                          Original:
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={quickPriceUpdate[product.id].original_price}
                          onChange={(e) =>
                            setQuickPriceUpdate((prev) => ({
                              ...prev,
                              [product.id]: {
                                ...prev[product.id],
                                original_price: e.target.value,
                              },
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleQuickPriceUpdate(
                                product.id,
                                quickPriceUpdate[product.id]
                              );
                            } else if (e.key === "Escape") {
                              setQuickPriceUpdate((prev) => {
                                const updated = { ...prev };
                                delete updated[product.id];
                                return updated;
                              });
                            }
                          }}
                          className="w-20 px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-white"
                          placeholder="Original"
                        />
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Press Enter to save, Esc to cancel
                      </div>
                      <div className="flex items-center space-x-1">
                        {updatingPrices.includes(product.id) ? (
                          <RefreshCw className="h-3 w-3 text-orange-600 animate-spin" />
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                handleQuickPriceUpdate(
                                  product.id,
                                  quickPriceUpdate[product.id]
                                )
                              }
                              className="p-0.5 text-green-600 hover:bg-green-50 rounded"
                              title="Save"
                            >
                              <Save size={11} />
                            </button>
                            <button
                              onClick={() =>
                                setQuickPriceUpdate((prev) => {
                                  const updated = { ...prev };
                                  delete updated[product.id];
                                  return updated;
                                })
                              }
                              className="p-0.5 text-gray-400 hover:bg-gray-50 rounded"
                              title="Cancel"
                            >
                              <X size={11} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{Number(product.price).toFixed(0)}
                          </span>
                          {(product as any).original_price &&
                            Number((product as any).original_price) >
                              Number(product.price) && (
                              <span className="text-xs text-gray-400 line-through">
                                ₹
                                {Number(
                                  (product as any).original_price
                                ).toFixed(0)}
                              </span>
                            )}
                        </div>
                        <button
                          onClick={() => {
                            const originalPrice =
                              (product as any).original_price || product.price;
                            setQuickPriceUpdate((prev) => ({
                              ...prev,
                              [product.id]: {
                                price: Number(product.price).toFixed(0),
                                original_price:
                                  Number(originalPrice).toFixed(0),
                              },
                            }));
                          }}
                          className="p-0.5 text-orange-600 hover:bg-orange-50 rounded transition-colors"
                          title="Edit Prices"
                        >
                          <Edit size={12} />
                        </button>
                      </div>
                      {(product as any).original_price &&
                        Number((product as any).original_price) >
                          Number(product.price) && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">
                              {Math.round(
                                ((Number((product as any).original_price) -
                                  Number(product.price)) /
                                  Number((product as any).original_price)) *
                                  100
                              )}
                              % OFF
                            </span>
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-0.5">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No products found. Click "Add" to create your first product.
          </div>
        )}
      </div>
    </div>
  );
}
