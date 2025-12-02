"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react";

export interface WeightOption {
  id: number | null;
  weight: number;
  weight_unit: string;
  price: number;
  is_default: boolean;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_available?: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
  in_stock?: boolean;
  weightOptions?: WeightOption[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: WeightOption;
}

interface CartState {
  items: CartItem[];
  total: number;
}

const isSameWeightOption = (a?: WeightOption, b?: WeightOption) => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.weight === b.weight && a.weight_unit === b.weight_unit && a.id === b.id
  );
};

type CartAction =
  | {
      type: "ADD_ITEM";
      payload: {
        product: Product;
        quantity: number;
        selectedWeight?: WeightOption;
      };
    }
  | {
      type: "REMOVE_ITEM";
      payload: { productId: number; selectedWeight?: WeightOption };
    }
  | {
      type: "UPDATE_QUANTITY";
      payload: {
        productId: number;
        quantity: number;
        selectedWeight?: WeightOption;
      };
    }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartState };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
} | null>(null);

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const productPrice =
        action.payload.selectedWeight?.price || action.payload.product.price;
      const productToAdd = action.payload.selectedWeight
        ? { ...action.payload.product, price: productPrice }
        : action.payload.product;

      const existingItem = state.items.find(
        (item) =>
          item.product.id === action.payload.product.id &&
          isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
      );

      if (existingItem) {
        const updatedItems = state.items.map((item) =>
          item.product.id === action.payload.product.id &&
          isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => {
            const itemPrice = item.selectedWeight?.price || item.product.price;
            return sum + Number(itemPrice) * item.quantity;
          }, 0),
        };
      } else {
        const newItems = [
          ...state.items,
          {
            product: productToAdd,
            quantity: action.payload.quantity,
            selectedWeight: action.payload.selectedWeight,
          },
        ];
        return {
          items: newItems,
          total: newItems.reduce((sum, item) => {
            const itemPrice = item.selectedWeight?.price || item.product.price;
            return sum + Number(itemPrice) * item.quantity;
          }, 0),
        };
      }
    }

    case "REMOVE_ITEM": {
      const updatedItems = state.items.filter((item) => {
        if (item.product.id !== action.payload.productId) return true;
        if (!action.payload.selectedWeight) return false;
        return !isSameWeightOption(
          item.selectedWeight,
          action.payload.selectedWeight
        );
      });
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const itemPrice = item.selectedWeight?.price || item.product.price;
          return sum + Number(itemPrice) * item.quantity;
        }, 0),
      };
    }

    case "UPDATE_QUANTITY": {
      if (action.payload.quantity <= 0) {
        return cartReducer(state, {
          type: "REMOVE_ITEM",
          payload: {
            productId: action.payload.productId,
            selectedWeight: action.payload.selectedWeight,
          },
        });
      }

      const updatedItems = state.items.map((item) =>
        item.product.id === action.payload.productId &&
        isSameWeightOption(item.selectedWeight, action.payload.selectedWeight)
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const itemPrice = item.selectedWeight?.price || item.product.price;
          return sum + Number(itemPrice) * item.quantity;
        }, 0),
      };
    }

    case "CLEAR_CART":
      return { items: [], total: 0 };

    case "LOAD_CART":
      return action.payload;

    default:
      return state;
  }
}

// Helper functions for localStorage persistence
const CART_STORAGE_KEY = "chicken_vicken_cart";

function saveCartToStorage(state: CartState) {
  if (typeof window !== "undefined") {
    try {
      const cartData = {
        items: state.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedWeight: item.selectedWeight
            ? {
                id: item.selectedWeight.id,
                weight: item.selectedWeight.weight,
                weight_unit: item.selectedWeight.weight_unit,
                price: item.selectedWeight.price,
                is_default: item.selectedWeight.is_default,
              }
            : undefined,
        })),
        timestamp: Date.now(),
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }
}

async function loadCartFromStorage(
  dispatch: React.Dispatch<CartAction>
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (!savedCart) return;

    const cartData = JSON.parse(savedCart);

    // Check if cart is older than 7 days, if so, clear it
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    if (cartData.timestamp && cartData.timestamp < sevenDaysAgo) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }

    // Fetch products to reconstruct cart
    const productIds = cartData.items.map((item: any) => item.productId);
    if (productIds.length === 0) return;

    const response = await fetch(`/api/products?ids=${productIds.join(",")}`);
    if (!response.ok) return;

    const products = await response.json();
    const productMap = new Map(products.map((p: Product) => [p.id, p]));

    // Reconstruct cart items
    const reconstructedItems: CartItem[] = [];
    for (const item of cartData.items) {
      const product = productMap.get(item.productId) as Product | undefined;
      if (!product || product.is_available === false) continue;

      // Get weight options if needed
      let selectedWeight: WeightOption | undefined = undefined;
      if (item.selectedWeight) {
        // Try to find matching weight option
        if (product.weightOptions) {
          selectedWeight = product.weightOptions.find(
            (wo) =>
              wo.weight === item.selectedWeight.weight &&
              wo.weight_unit === item.selectedWeight.weight_unit
          );
        }

        // If not found, create a custom weight option
        if (!selectedWeight && item.selectedWeight) {
          selectedWeight = {
            id: item.selectedWeight.id,
            weight: item.selectedWeight.weight,
            weight_unit: item.selectedWeight.weight_unit,
            price: item.selectedWeight.price,
            is_default: false,
          };
        }
      }

      reconstructedItems.push({
        product,
        quantity: item.quantity,
        selectedWeight,
      });
    }

    if (reconstructedItems.length > 0) {
      const total = reconstructedItems.reduce((sum, item) => {
        const itemPrice = item.selectedWeight?.price || item.product.price;
        return sum + Number(itemPrice) * item.quantity;
      }, 0);

      dispatch({
        type: "LOAD_CART",
        payload: { items: reconstructedItems, total },
      });
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error);
    // Clear corrupted cart data
    localStorage.removeItem(CART_STORAGE_KEY);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!isInitialized) {
      loadCartFromStorage(dispatch)
        .then(() => {
          setIsInitialized(true);
        })
        .catch((error) => {
          console.error("Error loading cart:", error);
          setIsInitialized(true); // Set to true even on error to prevent infinite loop
        });
    }
  }, [isInitialized]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(state);
    }
  }, [state, isInitialized]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
