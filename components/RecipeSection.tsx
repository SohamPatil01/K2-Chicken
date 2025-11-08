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

export default function RecipeSection() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecipes()
  }, [])

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
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Chicken Recipe Cookbook</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            Learn to cook delicious chicken dishes at home with our expert recipes and cooking tips
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border-2 border-green-200 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6">
            <span className="text-green-700 font-semibold text-xs sm:text-sm">🌾 Made with Baramati Agro Products</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="card hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-w-16 aspect-h-9 mb-4">
                <div className="w-full h-48 bg-chicken-orange rounded-lg flex items-center justify-center">
                  <ChefHat size={48} className="text-white" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
              <p className="text-gray-600 mb-4">{recipe.description}</p>
              
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
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <ChefHat size={20} />
                <span>View Recipe</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/recipes" className="btn-primary">
            View All Recipes 👨‍🍳
          </Link>
        </div>
      </div>
    </section>
  )
}
