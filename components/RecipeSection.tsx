'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock, Users, ChefHat } from 'lucide-react'

interface Recipe {
  id: number
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  image_url: string
  prep_time: number
  cook_time: number
  servings: number
}

interface RecipeSectionProps {
  initialRecipes?: Recipe[]
}

export default function RecipeSection({ initialRecipes }: RecipeSectionProps = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes || [])
  const [loading, setLoading] = useState(!initialRecipes)

  useEffect(() => {
    if (!initialRecipes) {
      fetchRecipes()
    } else {
      setLoading(false)
    }
  }, [initialRecipes])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      const data = await response.json()
      setRecipes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setRecipes([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Chicken Recipe Cookbook</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/10 to-white relative overflow-hidden">
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
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
            <span>Recipes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-900 mb-3 sm:mb-4 animate-slide-up stagger-1">
            Chicken Recipe Cookbook
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-5 sm:mb-6 px-4 animate-slide-up stagger-2 leading-relaxed">
            Learn to cook delicious chicken dishes at home with our expert recipes and cooking tips
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transform transition-all duration-300 hover:scale-105 hover:shadow-sm animate-scale-in stagger-3">
            <span className="text-green-700 font-medium text-xs sm:text-sm">🌾 Made with Baramati Agro Products</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.id} 
              className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-lg transition-all duration-500 transform hover:-translate-y-1 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-gradient-to-br from-orange-50 to-red-50">
                <div className="w-full h-full flex items-center justify-center transform transition-all duration-700 ease-out group-hover:scale-110">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-2xl group-hover:opacity-50 transition-opacity duration-500"></div>
                    <ChefHat size={56} className="text-orange-400 relative z-10 transform transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  </div>
                </div>
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              
              {/* Content */}
              <div className="p-5 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300 line-clamp-1">
                  {recipe.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                  {recipe.description}
                </p>
                
                {/* Recipe Info */}
                <div className="flex items-center gap-4 mb-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center group-hover:bg-orange-100 transition-colors duration-300">
                      <Clock size={14} className="text-orange-600" />
                    </div>
                    <span className="font-medium">{recipe.prep_time + recipe.cook_time} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors duration-300">
                      <Users size={14} className="text-green-600" />
                    </div>
                    <span className="font-medium">{recipe.servings} servings</span>
                  </div>
                </div>

                {/* Key Ingredients */}
                <div className="mb-5 pb-4 border-b border-gray-100">
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2.5">Key Ingredients</h4>
                  <ul className="text-xs sm:text-sm text-gray-600 space-y-1.5">
                    {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-orange-400 rounded-full"></span>
                        <span className="flex-1">{ingredient}</span>
                      </li>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <li className="text-orange-600 font-medium text-xs mt-2">
                        + {recipe.ingredients.length - 3} more ingredients
                      </li>
                    )}
                  </ul>
                </div>

                {/* View Recipe Button */}
                <Link
                  href={`/recipes/${recipe.id}`}
                  className="w-full bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border border-orange-200 text-orange-700 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 hover:shadow-md transform hover:scale-[1.02] active:scale-100 group/btn"
                >
                  <ChefHat size={16} className="transform transition-transform duration-300 group-hover/btn:rotate-12" />
                  <span>View Recipe</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Recipes Button */}
        <div className="text-center mt-10 sm:mt-12 animate-slide-up stagger-4">
          <Link 
            href="/recipes" 
            className="inline-flex items-center gap-2 bg-white border-2 border-orange-200 hover:border-orange-300 text-orange-700 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-105 active:scale-95 group"
          >
            <span>View All Recipes</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1 text-lg">👨‍🍳</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
