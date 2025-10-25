import Hero from '@/components/Hero'
import ProductCatalog from '@/components/ProductCatalog'
import RecipeSection from '@/components/RecipeSection'
import WhyChooseUs from '@/components/WhyChooseUs'
import ChatbotCTA from '@/components/ChatbotCTA'
import WhatsAppChatbot from '@/components/WhatsAppChatbot'

export default function Home() {
  return (
    <div>
      <Hero />
      <div id="products">
        <ProductCatalog />
      </div>
      <RecipeSection />
      <WhyChooseUs />
      <ChatbotCTA />
      <WhatsAppChatbot />
    </div>
  )
}
