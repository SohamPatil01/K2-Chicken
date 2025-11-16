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
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/20 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 animate-slide-down">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 animate-slide-up stagger-1">Chicken Recipe Cookbook</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4 animate-slide-up stagger-2">
            Learn to cook delicious chicken dishes at home with our expert recipes and cooking tips
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border-2 border-green-200 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-scale-in stagger-3">
            <span className="text-green-700 font-semibold text-xs sm:text-sm">🌾 Made with Baramati Agro Products</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.id} 
              className="card hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:border-orange-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg group/image">
                <div className="w-full h-48 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center transform transition-transform duration-500 group-hover/image:scale-110">
                  <ChefHat size={48} className="text-white transform transition-transform duration-300 group-hover/image:rotate-12" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors duration-300">{recipe.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
              
              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span>{recipe.prep_time + recipe.cook_time} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users size={16} />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Key Ingredients:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <li key={index}>• {ingredient}</li>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-chicken-red">+ {recipe.ingredients.length - 3} more ingredients</li>
                  )}
                </ul>
              </div>

              <Link
                href={`/recipes/${recipe.id}`}
                className="w-full btn-secondary flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <ChefHat size={20} className="transform transition-transform duration-300 group-hover:rotate-12" />
                <span>View Recipe</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 animate-slide-up stagger-4">
          <Link href="/recipes" className="btn-primary transform transition-all duration-300 hover:scale-105 active:scale-95 inline-flex items-center gap-2">
            <span>View All Recipes</span>
            <span className="transform transition-transform duration-300 group-hover:translate-x-1">👨‍🍳</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
