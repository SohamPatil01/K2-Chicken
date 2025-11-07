import Hero from '@/components/Hero'
import ProductCatalog from '@/components/ProductCatalog'
import RecipeSection from '@/components/RecipeSection'
import WhyChooseUs from '@/components/WhyChooseUs'
import ChatbotCTA from '@/components/ChatbotCTA'
import PromotionsFlyer from '@/components/PromotionsFlyer'

export default function Home() {
  return (
    <div>
      <PromotionsFlyer />
      <Hero />
      <div id="products">
        <ProductCatalog />
      </div>
      <RecipeSection />
      <WhyChooseUs />
    </div>
  )
}
