import { Award, Clock, Heart, Shield } from 'lucide-react'

export default function WhyChooseUs() {
  const features = [
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'We use only the freshest, highest quality chicken and ingredients in all our dishes.'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your delicious chicken delivered hot and fresh in 30-45 minutes or less.'
    },
    {
      icon: Heart,
      title: 'Made with Love',
      description: 'Every dish is prepared with care and passion by our experienced chefs.'
    },
    {
      icon: Shield,
      title: '100% Safe',
      description: 'We follow strict food safety standards and hygiene practices in our kitchen.'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Chicken Vicken?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're not just another chicken shop - we're your neighborhood's favorite for a reason!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="text-center">
                <div className="w-16 h-16 chicken-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-chicken-yellow bg-opacity-20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              "Finger Lickin' Good!"
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Join thousands of satisfied customers who choose Chicken Vicken for the best chicken experience in town.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-chicken-red">10,000+</div>
                <div className="text-sm text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-chicken-red">4.9★</div>
                <div className="text-sm text-gray-600">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-chicken-red">30min</div>
                <div className="text-sm text-gray-600">Average Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
