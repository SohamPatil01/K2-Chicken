'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

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

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    image_url: '',
    prep_time: '',
    cook_time: '',
    servings: '',
  })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes')
      const data = await response.json()
      setRecipes(data)
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const recipeData = {
        ...formData,
        ingredients: formData.ingredients.split('\n').filter(ing => ing.trim()),
        instructions: formData.instructions.split('\n').filter(inst => inst.trim()),
        prep_time: parseInt(formData.prep_time),
        cook_time: parseInt(formData.cook_time),
        servings: parseInt(formData.servings),
      }

      if (editingRecipe) {
        // Update existing recipe
        const response = await fetch(`/api/recipes/${editingRecipe.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        })
        
        if (response.ok) {
          await fetchRecipes()
          setEditingRecipe(null)
          resetForm()
        }
      } else {
        // Create new recipe
        const response = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipeData),
        })
        
        if (response.ok) {
          await fetchRecipes()
          setIsAdding(false)
          resetForm()
        }
      }
    } catch (error) {
      console.error('Error saving recipe:', error)
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      title: recipe.title,
      description: recipe.description,
      ingredients: recipe.ingredients.join('\n'),
      instructions: recipe.instructions.join('\n'),
      image_url: recipe.image_url || '',
      prep_time: recipe.prep_time.toString(),
      cook_time: recipe.cook_time.toString(),
      servings: recipe.servings.toString(),
    })
  }

  const handleDelete = async (recipeId: number) => {
    if (confirm('Are you sure you want to delete this recipe?')) {
      try {
        const response = await fetch(`/api/recipes/${recipeId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          await fetchRecipes()
        }
      } catch (error) {
        console.error('Error deleting recipe:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      ingredients: '',
      instructions: '',
      image_url: '',
      prep_time: '',
      cook_time: '',
      servings: '',
    })
    setEditingRecipe(null)
    setIsAdding(false)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Recipe Management</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Recipe</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingRecipe) && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  value={formData.cook_time}
                  onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients (one per line) *
              </label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                placeholder="2 cups all-purpose flour&#10;1 tsp salt&#10;1 tsp black pepper"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions (one per line) *
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chicken-red focus:border-transparent"
                placeholder="Mix flour with salt and pepper&#10;Heat oil to 350°F&#10;Fry chicken for 12-15 minutes"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
              >
                <Save size={20} />
                <span>{editingRecipe ? 'Update' : 'Create'} Recipe</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Recipes List */}
      <div className="space-y-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{recipe.title}</h3>
                <p className="text-sm text-gray-600">{recipe.description}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">{recipe.prep_time + recipe.cook_time} min</span>
                  <span className="text-sm text-gray-500">{recipe.servings} servings</span>
                  <span className="text-sm text-gray-500">{recipe.ingredients.length} ingredients</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(recipe)}
                className="p-2 text-chicken-yellow hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(recipe.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
