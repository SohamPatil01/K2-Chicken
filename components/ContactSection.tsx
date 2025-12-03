"use client";

import { useState, useEffect, useRef } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  PhoneCall,
  MapPin as MapPinIcon,
  Sparkles,
  CheckCircle,
  Zap,
} from "lucide-react";
const SHOP_LOCATION = {
  lat: 18.578073140740553,
  lng: 73.78656665952684,
  address:
    "Shop No. 4, 24K Avenue, New DP Rd, Kolte Patil, Vishal Nagar, Pimple Nilakh, Pimpri-Chinchwad, Pune, Maharashtra 411027",
};

declare global {
  interface Window {
    google: any;
  }
}

export default function ContactSection() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    message: "",
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load Google Maps
    if (typeof window !== "undefined" && mapRef.current) {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (
        apiKey &&
        !document.querySelector('script[src*="maps.googleapis.com"]')
      ) {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = initializeMap;
        document.head.appendChild(script);
      } else if (window.google) {
        initializeMap();
      }
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: SHOP_LOCATION.lat, lng: SHOP_LOCATION.lng },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Add marker
    const marker = new window.google.maps.Marker({
      position: { lat: SHOP_LOCATION.lat, lng: SHOP_LOCATION.lng },
      map,
      title: "K2 Chicken",
      animation: window.google.maps.Animation.DROP,
    });

    // Add info window
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px;">
          <h3 style="font-weight: bold; margin-bottom: 5px;">K2 Chicken</h3>
          <p style="margin: 0;">${SHOP_LOCATION.address}</p>
          <a href="tel:+918484978622" style="color: #ea580c; margin-top: 5px; display: block;">📞 +91 84849 78622</a>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);

    // Generate Google Maps link if address is provided
    let mapsLink = "";
    const addressValue = (formData.address || "").trim();
    if (addressValue.length > 0) {
      // Encode address for URL
      const encodedAddress = encodeURIComponent(addressValue);
      // Create Google Maps search URL
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      // Format the maps link section - URL on separate line so WhatsApp recognizes it
      mapsLink = `\n📍 *Delivery Location:*\n${addressValue}\n\n🗺️ *View on Maps:*\n${mapsUrl}\n`;
    }

    // Format the message for WhatsApp with better structure
    // Using ASCII characters for maximum compatibility
    let whatsappMessage =
      `🍗 *NEW ENQUIRY - K2 CHICKEN*\n\n` +
      `👤 *Customer Details*\n` +
      `----------------------\n` +
      `• *Name:* ${formData.name}\n` +
      `• *Email:* ${formData.email}\n` +
      `• *Phone:* ${formData.phone}\n`;

    // Add maps link if address is provided
    if (mapsLink) {
      whatsappMessage += mapsLink;
    }

    whatsappMessage +=
      `\n💬 *Message*\n` +
      `----------------------\n` +
      `${formData.message}\n\n` +
      `----------------------\n` +
      `📱 Sent via: K2 Chicken Website Contact Form\n` +
      `🕐 Time: ${new Date().toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);

    // Open WhatsApp with the formatted message
    const whatsappUrl = `https://wa.me/918484978622?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");

    // Show success message and reset form
    setSubmitSuccess(true);
    setFormData({ name: "", email: "", phone: "", address: "", message: "" });
    setIsSubmitting(false);
    setTimeout(() => setSubmitSuccess(false), 5000);
  };

  const handleWhatsAppClick = () => {
    // Generate Google Maps link if address is provided
    let mapsLink = "";
    const addressValue = formData.address?.trim() || "";
    if (addressValue.length > 0) {
      const encodedAddress = encodeURIComponent(addressValue);
      // Use Google Maps search URL format
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      mapsLink = `\n📍 *Delivery Location:*\n${addressValue}\n\n🗺️ *View on Maps:*\n${mapsUrl}\n`;
    }

    const message =
      `🍗 *Hello! I'd like to get in touch with K2 Chicken*\n\n` +
      `👤 *My Details*\n` +
      `----------------------\n` +
      `• *Name:* ${formData.name || "Customer"}\n` +
      `• *Phone:* ${formData.phone || "Not provided"}\n` +
      (formData.email ? `• *Email:* ${formData.email}\n` : "") +
      (mapsLink ? mapsLink : "") +
      `\n💬 *Message*\n` +
      `----------------------\n` +
      `${formData.message || "I have a question about your products."}\n\n` +
      `----------------------\n` +
      `📱 Sent via: K2 Chicken Website`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/918484978622?text=${encodedMessage}`, "_blank");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const operatingHours = [
    { day: "Monday - Sunday", hours: "8:00 AM - 8:00 PM" },
  ];

  return (
    <section
      id="contact"
      className="py-20 sm:py-24 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
    >
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div
            className={`inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4 ${
              mounted ? "animate-slide-down" : "opacity-0"
            }`}
          >
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>We're Here to Help</span>
          </div>
          <h2
            className={`text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 ${
              mounted ? "animate-slide-up" : "opacity-0"
            }`}
          >
            Get in{" "}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Touch
            </span>
          </h2>
          <p
            className={`text-lg sm:text-xl text-gray-700 max-w-3xl mx-auto ${
              mounted ? "animate-slide-up" : "opacity-0"
            }`}
            style={{ animationDelay: "0.2s" }}
          >
            Have questions about our products? Need help with your order? We're
            just a call or message away!
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Contact Form */}
          <div
            className={`bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 ${
              mounted ? "animate-slide-in-from-left" : "opacity-0"
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Send us a Message
              </h3>
              <p className="text-sm text-gray-600">
                Fill out the form below and we'll get back to you within 24
                hours
              </p>
            </div>

            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3 animate-scale-in">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">
                    Message sent successfully!
                  </p>
                  <p className="text-xs text-green-600">
                    We'll get back to you soon.
                  </p>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "name" || formData.name
                      ? "top-2 text-xs text-orange-600 font-semibold"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none"
                  required
                />
              </div>

              {/* Email Field */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "email" || formData.email
                      ? "top-2 text-xs text-orange-600 font-semibold"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none"
                  required
                />
              </div>

              {/* Phone Field */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "phone" || formData.phone
                      ? "top-2 text-xs text-orange-600 font-semibold"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("phone")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none"
                  required
                />
              </div>

              {/* Delivery Address Field */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "address" || formData.address
                      ? "top-2 text-xs text-orange-600 font-semibold"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Delivery Address (Optional)
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("address")}
                  onBlur={() => setFocusedField(null)}
                  rows={3}
                  className="w-full pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none resize-none"
                  placeholder="Enter your delivery address for faster service..."
                />
                <p className="text-xs text-gray-500 mt-1 ml-1">
                  Include your address to get a Google Maps link in the message
                </p>
              </div>

              {/* Message Field */}
              <div className="relative">
                <label
                  className={`absolute left-4 transition-all duration-300 ${
                    focusedField === "message" || formData.message
                      ? "top-2 text-xs text-orange-600 font-semibold"
                      : "top-4 text-sm text-gray-500"
                  }`}
                >
                  Your Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("message")}
                  onBlur={() => setFocusedField(null)}
                  rows={5}
                  className="w-full pt-6 pb-2 px-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 outline-none resize-none"
                  required
                />
              </div>

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold py-4 px-6 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold py-4 px-6 rounded-xl border border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat on WhatsApp
                </button>
              </div>
            </form>
          </div>

          {/* Map and Contact Info */}
          <div
            className={`space-y-6 ${
              mounted ? "animate-slide-in-from-right" : "opacity-0"
            }`}
          >
            {/* Map */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-gray-100 relative group h-64 sm:h-80">
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-semibold text-gray-900">
                    Our Location
                  </span>
                </div>
              </div>
              <div ref={mapRef} className="w-full h-full absolute inset-0" />
              <div className="absolute bottom-4 right-4 z-10">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${SHOP_LOCATION.lat},${SHOP_LOCATION.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/95 hover:bg-white backdrop-blur-sm text-orange-600 px-4 py-2 rounded-lg text-xs font-medium border border-orange-200 hover:border-orange-300 transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <MapPinIcon className="w-3 h-3" />
                  Open in Maps
                </a>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-1 gap-3 mb-6">
              <a
                href="tel:+918484978622"
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl p-5 border border-orange-200 hover:border-orange-300 transition-all duration-300 group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <PhoneCall className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">Call Now</h4>
                    <p className="text-sm text-orange-600">+91 84849 78622</p>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-orange-500 opacity-60 group-hover:opacity-100" />
              </a>

              <button
                onClick={handleWhatsAppClick}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl p-5 border border-orange-200 hover:border-orange-300 transition-all duration-300 group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base mb-0.5">
                      WhatsApp Us
                    </h4>
                    <p className="text-sm text-orange-600">Instant response</p>
                  </div>
                </div>
                <Zap className="w-5 h-5 text-orange-500 opacity-60 group-hover:opacity-100" />
              </button>
            </div>

            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <a
                href="mailto:k2foodindia@gmail.com"
                className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Email Us</h4>
                <p className="text-gray-600 text-sm">k2foodindia@gmail.com</p>
              </a>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                  <MapPinIcon className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Visit Us</h4>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Shop No. 4, 24K Avenue, Pimple Nilakh, Pune
                </p>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Operating Hours
                  </h4>
                  <p className="text-xs text-gray-600">
                    We're open 7 days a week
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {operatingHours.map((schedule, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center py-2.5 px-3 bg-white/60 rounded-lg border border-orange-100"
                  >
                    <span className="text-gray-800 font-semibold text-sm">
                      {schedule.day}
                    </span>
                    <span className="text-gray-700 font-medium text-sm">
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-orange-200">
                <p className="text-xs text-gray-600 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-orange-500" />
                  <span>
                    Same-day delivery available for orders placed before 6 PM
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
