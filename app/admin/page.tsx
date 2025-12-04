"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Package,
  ChefHat,
  ShoppingCart,
  MessageCircle,
  LogOut,
  User,
  Warehouse,
  Settings,
  Tag,
  X,
  BarChart3,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import ProductManagement from "@/components/ProductManagement";
import RecipeManagement from "@/components/RecipeManagement";
import OrderManagement from "@/components/OrderManagement";
import AdminDashboard from "@/components/AdminDashboard";
import InventoryManagement from "@/components/InventoryManagement";
import SettingsManagement from "@/components/SettingsManagement";
import PromotionManagement from "@/components/PromotionManagement";
import WhatsAppOrderManagement from "@/components/WhatsAppOrderManagement";

type TabType =
  | "dashboard"
  | "products"
  | "recipes"
  | "orders"
  | "whatsapp"
  | "inventory"
  | "settings"
  | "promotions";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [previousOrdersCount, setPreviousOrdersCount] = useState(0);
  const [showOrderNotification, setShowOrderNotification] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [soundInterval, setSoundInterval] = useState<NodeJS.Timeout | null>(
    null
  );
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // Try to get user info from the server
        const response = await fetch("/api/admin/me", {
          credentials: "include",
        });

        const userData = await response.json();
        console.log("Admin auth check response:", {
          status: response.status,
          data: userData,
        });

        if (response.ok && userData.success && userData.user) {
          setUser(userData.user);
          setIsLoading(false);
        } else {
          // Invalid response, redirect to login
          console.log("Auth check failed, redirecting to login");
          window.location.href = "/admin/login";
          return;
        }
      } catch (error) {
        console.error("Auth check error:", error);
        window.location.href = "/admin/login";
        return;
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      setMounted(true);
    }
  }, [isLoading, user]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes] = await Promise.all([fetch("/api/orders")]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          const orders = Array.isArray(ordersData) ? ordersData : [];

          const pending = orders.filter(
            (o: any) => o.status !== "delivered" && o.status !== "cancelled"
          ).length;
          const completed = orders.filter(
            (o: any) => o.status === "delivered"
          ).length;
          const revenue = orders
            .filter((o: any) => o.status === "delivered")
            .reduce(
              (sum: number, o: any) => sum + (parseFloat(o.total_amount) || 0),
              0
            );

          setStats({
            totalOrders: orders.length,
            pendingOrders: pending,
            completedOrders: completed,
            totalRevenue: revenue,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    if (user) {
      fetchStats();
      const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Function to stop the alarm sound
  const stopOrderAlarm = () => {
    if (soundInterval) {
      clearInterval(soundInterval);
      setSoundInterval(null);
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      setAudioContext(null);
    }
  };

  // Function to trigger alarm/buzzer when new orders arrive
  const triggerOrderAlarm = (orderCount: number) => {
    // Stop any existing alarm first
    stopOrderAlarm();

    // Create new audio context
    const ctx = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    setAudioContext(ctx);

    // Create a loud, attention-grabbing alarm sound
    const playAlarmSound = () => {
      try {
        // Create a more aggressive beep pattern (louder, more urgent)
        const frequencies = [800, 600, 800, 600, 800]; // Higher frequencies for more urgency
        let beepIndex = 0;

        const playBeep = () => {
          if (!ctx) return;

          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.value =
            frequencies[beepIndex % frequencies.length];
          oscillator.type = "square"; // Square wave is more harsh/attention-grabbing

          // Much louder volume (0.8 instead of 0.3)
          gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            ctx.currentTime + 0.15
          );

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.15);

          beepIndex++;
        };

        // Play 5 beeps immediately
        for (let i = 0; i < 5; i++) {
          setTimeout(() => playBeep(), i * 200);
        }

        // Then repeat every 2 seconds until dismissed
        const interval = setInterval(() => {
          for (let i = 0; i < 5; i++) {
            setTimeout(() => playBeep(), i * 200);
          }
        }, 2000);

        setSoundInterval(interval);
      } catch (error) {
        console.error("Error playing alarm sound:", error);
      }
    };

    // Request permission and play sound
    if (ctx.state === "suspended") {
      ctx.resume().then(() => {
        playAlarmSound();
      });
    } else {
      playAlarmSound();
    }

    // Show visual notification (stays until dismissed)
    setShowOrderNotification(true);
    setNewOrderCount(orderCount);

    // Request browser notification permission and show persistent notification
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`🔔 New Order Alert! 🍗`, {
          body: `${orderCount} new order${
            orderCount > 1 ? "s" : ""
          } has arrived! Click to view.`,
          icon: "/logo.svg",
          badge: "/logo.svg",
          tag: "new-order",
          requireInteraction: true, // Requires user interaction to dismiss
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(`🔔 New Order Alert! 🍗`, {
              body: `${orderCount} new order${
                orderCount > 1 ? "s" : ""
              } has arrived! Click to view.`,
              icon: "/logo.svg",
              badge: "/logo.svg",
              requireInteraction: true,
            });
          }
        });
      }
    }
  };

  // Handle notification dismissal
  const handleDismissNotification = () => {
    stopOrderAlarm();
    setShowOrderNotification(false);
    setNewOrderCount(0);
  };

  // Fetch new orders count periodically
  useEffect(() => {
    if (!user) return;

    const fetchNewOrdersCount = async () => {
      try {
        const response = await fetch("/api/orders/new/count");
        const data = await response.json();
        const count = data.count || 0;

        // Check if new orders arrived
        if (count > previousOrdersCount && previousOrdersCount > 0) {
          const newOrders = count - previousOrdersCount;
          setNewOrderCount(newOrders);
          triggerOrderAlarm(newOrders);
        }

        setNewOrdersCount(count);
        setPreviousOrdersCount(count);
      } catch (error) {
        console.error("Error fetching new orders count:", error);
      }
    };

    // Fetch immediately
    fetchNewOrdersCount();

    // Poll every 5 seconds for new orders (faster detection)
    const interval = setInterval(fetchNewOrdersCount, 5000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previousOrdersCount, user]);

  // Reset count when Orders tab is clicked
  const handleOrdersTabClick = () => {
    setActiveTab("orders");
    setNewOrdersCount(0);
    setPreviousOrdersCount(0);
    // Stop alarm when viewing orders
    handleDismissNotification();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopOrderAlarm();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    router.push("/admin/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="flex flex-col items-center mb-4 sm:mb-6">
            <div className="relative inline-block">
              <img
                src="/logo.svg"
                alt="K2 Chicken"
                className="h-16 sm:h-20 w-auto mb-2"
              />
              <div
                className="text-sm sm:text-base font-semibold text-[#FF6B35]"
                style={{ marginLeft: "50px" }}
              >
                K2 Chicken
              </div>
            </div>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">
            Loading Admin Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "recipes", label: "Recipes", icon: ChefHat },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { id: "inventory", label: "Inventory", icon: Warehouse },
    { id: "promotions", label: "Promotions", icon: Tag },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/20 to-gray-50">
      {/* Order Notification Alert - Persistent until dismissed */}
      {showOrderNotification && (
        <div className="fixed top-4 right-4 z-[9999] animate-bounce-in">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 min-w-[350px] animate-pulse border-4 border-white">
            <div className="text-4xl animate-bounce">🔔</div>
            <div className="flex-1">
              <div className="font-bold text-xl text-white">
                🚨 NEW ORDER ALERT! 🚨
              </div>
              <div className="text-base font-semibold text-white/90">
                {newOrderCount} new order{newOrderCount > 1 ? "s" : ""} has
                arrived!
              </div>
              <div className="text-xs text-white/80 mt-1">
                Sound will continue until you accept
              </div>
            </div>
            <button
              onClick={handleDismissNotification}
              className="ml-auto bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-110 active:scale-95 border-2 border-white/50"
            >
              Accept
            </button>
          </div>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div
              className={`flex items-center space-x-4 ${
                mounted ? "animate-slide-in-from-left" : "opacity-0"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                <h1 className="text-xl font-bold text-gray-900">
                  Admin Console
                </h1>
              </div>
              <div className="hidden md:block text-sm text-gray-600">
                K2 Chicken Management System
              </div>
            </div>
            <div
              className={`flex items-center space-x-4 ${
                mounted ? "animate-slide-in-from-right" : "opacity-0"
              }`}
            >
              <div className="flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200">
                <User className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    User
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 font-semibold text-sm border border-gray-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Orders",
                value: stats.totalOrders,
                icon: BarChart3,
                color: "blue",
                delay: "0.1s",
              },
              {
                label: "Pending",
                value: stats.pendingOrders,
                icon: Clock,
                color: "orange",
                delay: "0.2s",
              },
              {
                label: "Completed",
                value: stats.completedOrders,
                icon: TrendingUp,
                color: "green",
                delay: "0.3s",
              },
              {
                label: "Revenue",
                value: `₹${stats.totalRevenue.toFixed(0)}`,
                icon: DollarSign,
                color: "yellow",
                delay: "0.4s",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: "bg-blue-50 text-blue-600 border-blue-200",
                orange: "bg-orange-50 text-orange-600 border-orange-200",
                green: "bg-green-50 text-green-600 border-green-200",
                yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
              };
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl p-5 border-2 ${
                    colorClasses[stat.color as keyof typeof colorClasses]
                  } shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] ${
                    mounted ? "animate-slide-up" : "opacity-0"
                  }`}
                  style={{ animationDelay: stat.delay }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide mb-1 font-medium">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl ${
                        colorClasses[stat.color as keyof typeof colorClasses]
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 mb-6 overflow-hidden shadow-sm ${
            mounted ? "animate-slide-down" : "opacity-0"
          }`}
        >
          <div className="p-3">
            <nav className="flex flex-wrap gap-2">
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                const isOrdersTab = tab.id === "orders";
                const showBadge =
                  isOrdersTab && newOrdersCount > 0 && activeTab !== "orders";

                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      isOrdersTab
                        ? handleOrdersTabClick()
                        : setActiveTab(tab.id as TabType)
                    }
                    className={`relative flex items-center space-x-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      mounted ? "animate-slide-up" : "opacity-0"
                    } ${
                      activeTab === tab.id
                        ? "bg-orange-500 text-white shadow-md"
                        : "bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-200"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                        {newOrdersCount > 99 ? "99+" : newOrdersCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className={`bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm ${
            mounted ? "animate-fade-in" : "opacity-0"
          }`}
          style={{ animationDelay: "0.2s" }}
        >
          <div className="p-6 sm:p-8">
            {activeTab === "dashboard" && <AdminDashboard />}
            {activeTab === "products" && <ProductManagement />}
            {activeTab === "recipes" && <RecipeManagement />}
            {activeTab === "orders" && <OrderManagement />}
            {activeTab === "whatsapp" && <WhatsAppOrderManagement />}
            {activeTab === "inventory" && <InventoryManagement />}
            {activeTab === "promotions" && <PromotionManagement />}
            {activeTab === "settings" && <SettingsManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}
