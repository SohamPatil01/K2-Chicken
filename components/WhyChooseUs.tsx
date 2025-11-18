'use client'

import { Award, Clock, Heart, Shield, Sparkles } from 'lucide-react'

export default function WhyChooseUs() {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We use only the freshest, highest quality chicken and ingredients in all our dishes.',
      color: 'from-yellow-100 to-orange-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your delicious chicken delivered hot and fresh in 30-45 minutes or less.',
      color: 'from-green-100 to-emerald-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every dish is prepared with care and passion by our experienced chefs.',
      color: 'from-pink-100 to-red-100',
      iconColor: 'text-pink-600',
      borderColor: 'border-pink-200'
    },
    {
      icon: Shield,
      title: '100% Safe',
      description: 'We follow strict food safety standards and hygiene practices in our kitchen.',
      color: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    }
  ]

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/5 to-white relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #ea580c 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 sm:mb-14 animate-slide-down">
          <div className="inline-flex items-center gap-2 bg-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-orange-700 mb-4 sm:mb-5 shadow-sm transform transition-all duration-300 hover:scale-105 hover:shadow-md">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4 animate-slide-up stagger-1">
            Why Choose K2 Chicken?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-slide-up stagger-2">
            We're not just another chicken shop - we're your neighborhood's favorite for a reason!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-7 mb-12 sm:mb-14">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div 
                key={index} 
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 sm:p-7 hover:border-gray-200 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 animate-slide-up text-center"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon Container */}
                <div className="relative mb-5 sm:mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
                  <div className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center border-2 ${feature.borderColor} mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-sm`}>
                    <Icon size={28} className={`${feature.iconColor} sm:w-8 sm:h-8`} />
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2.5 group-hover:text-orange-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-10 sm:mt-12 animate-slide-up stagger-5">
          <div className="bg-gradient-to-br from-orange-50/80 via-red-50/50 to-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-orange-200 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-orange-700 mb-4 shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span>Customer Trust</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                "Finger Lickin' Good!"
              </h3>
              <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
                Join thousands of satisfied customers who choose K2 Chicken for the best chicken experience in town.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-orange-200/30 rounded-xl blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-orange-200 rounded-xl p-5 sm:p-6 group-hover:shadow-md transition-all duration-300">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                      10,000+
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Happy Customers</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-yellow-200/30 rounded-xl blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-yellow-200 rounded-xl p-5 sm:p-6 group-hover:shadow-md transition-all duration-300">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                      4.9★
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Average Rating</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center group">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-green-200/30 rounded-xl blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative bg-white/80 backdrop-blur-sm border border-green-200 rounded-xl p-5 sm:p-6 group-hover:shadow-md transition-all duration-300">
                    <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                      30min
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium">Average Delivery</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
