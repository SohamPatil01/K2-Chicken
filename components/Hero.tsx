'use client'

import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative w-full h-[400px] bg-orange-500 text-white overflow-hidden">
      {/* Background Chicken Images */}
      <div className="absolute inset-0">
        {/* Top Left: Chicken Breast */}
        <img
          src="/images/banner_chicken_breast.png"
          alt="Chicken Breast"
          className="absolute top-0 left-0 w-[250px] h-auto transform -rotate-12 translate-x-[-50px] translate-y-[-20px]"
        />
        {/* Bottom Left: Chicken Drumsticks */}
        <img
          src="/images/banner_chicken_drumsticks.png"
          alt="Chicken Drumsticks"
          className="absolute bottom-0 left-0 w-[250px] h-auto transform rotate-12 translate-x-[-50px] translate-y-[20px]"
        />
        {/* Middle Left: Chicken Lollipops */}
        <img
          src="/images/banner_chicken_lollipops.png"
          alt="Chicken Lollipops"
          className="absolute top-1/2 left-0 w-[200px] h-auto transform -translate-y-1/2 translate-x-[-70px] rotate-6"
        />
        {/* Top Right: Whole Chicken */}
        <img
          src="/images/banner_whole_chicken.png"
          alt="Whole Chicken"
          className="absolute top-0 right-0 w-[250px] h-auto transform rotate-12 translate-x-[50px] translate-y-[-20px]"
        />
        {/* Bottom Right: Chicken Leg Quarters */}
        <img
          src="/images/banner_chicken_leg_quarters.png"
          alt="Chicken Leg Quarters"
          className="absolute bottom-0 right-0 w-[250px] h-auto transform -rotate-12 translate-x-[50px] translate-y-[20px]"
        />
      </div>

      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-orange-500 opacity-50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4">
          <span className="block">"YOU CAN NOW SHOP FOR</span>
          <span className="block text-white mt-2">FRESH CHICKEN</span>
          <span className="block">IN A</span>
          <span className="block text-white mt-2">HYGIENIC AND CLEAN</span>
          <span className="block">ENVIRONMENT"</span>
        </h1>
      </div>

      {/* Non-Veg Indicator */}
      <div className="absolute top-4 right-4 z-20 bg-white p-1 rounded">
        <div className="w-4 h-4 bg-red-600 rounded-full"></div>
      </div>

      {/* Cityscape at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-20 z-10">
        <div className="relative w-full h-full overflow-hidden">
          {/* This is a placeholder for the cityscape pattern */}
          <div className="absolute bottom-0 left-0 w-full h-full bg-white opacity-20"></div>
          {/* You might want to use an SVG or a repeating background image for a more detailed cityscape */}
        </div>
      </div>
    </section>
  )
}
