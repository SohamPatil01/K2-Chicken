'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock, Users, ChefHat, ArrowLeft, CheckCircle } from 'lucide-react'

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

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params?.id) {
      fetchRecipe(params.id as string)
    }
  }, [params?.id])

  const fetchRecipe = async (id: string) => {
    try {
      const response = await fetch(`/api/recipes/${id}`)
      if (!response.ok) {
        throw new Error('Recipe not found')
      }
      const data = await response.json()
      setRecipe(data)
    } catch (error: any) {
      console.error('Error fetching recipe:', error)
      setError(error.message || 'Failed to load recipe')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-6 w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
            <p className="text-gray-600 mb-8">{error || 'The recipe you are looking for does not exist.'}</p>
            <Link href="/recipes" className="btn-primary inline-flex items-center">
              <ArrowLeft size={20} className="mr-2" />
              Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/recipes" 
          className="inline-flex items-center text-chicken-red hover:text-red-700 mb-6 font-semibold transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Recipes
        </Link>

        {/* Recipe Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden mb-8">
          {/* Recipe Image */}
          <div className="relative h-80 bg-gradient-to-br from-orange-400 to-red-500">
            {recipe.image_url ? (
              <img 
                src={recipe.image_url} 
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            {!recipe.image_url && (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat size={80} className="text-white opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">{recipe.title}</h1>
              <p className="text-xl text-white/90">{recipe.description}</p>
            </div>
          </div>

          {/* Recipe Info Cards */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-orange-50 rounded-xl">
              <div className="p-3 bg-orange-500 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Prep Time</p>
                <p className="text-xl font-bold text-gray-900">{recipe.prep_time} min</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl">
              <div className="p-3 bg-red-500 rounded-lg">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="text-xl font-bold text-gray-900">{recipe.cook_time} min</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl">
              <div className="p-3 bg-yellow-500 rounded-lg">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Servings</p>
                <p className="text-xl font-bold text-gray-900">{recipe.servings} people</p>
              </div>
            </div>
          </div>
        </div>

        {/* Baramati Agro Notice */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="text-white" size={24} />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">🌾 Premium Quality Ingredients</h3>
              <p className="text-green-800 leading-relaxed">
                We proudly use <strong className="font-semibold">Baramati Agro</strong> products in our recipes. 
                All our chicken products are sourced from Baramati Agro, ensuring premium quality, freshness, 
                and the best taste for your family. Experience the difference that quality ingredients make!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ingredients */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChefHat className="mr-3 text-chicken-red" size={28} />
              Ingredients
            </h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700 text-lg">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChefHat className="mr-3 text-chicken-orange" size={28} />
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 text-lg leading-relaxed pt-1">{instruction}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChefHat size={20} className="mr-2" />
            Order Fresh Ingredients
          </Link>
        </div>
      </div>
    </div>
  )
}

