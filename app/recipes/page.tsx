import Link from "next/link";
import { Clock, Users, ChefHat, ArrowLeft } from "lucide-react";
import pool from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/siteUrl";
import { sanitizeRecipeList, sanitizeRecipeText } from "@/lib/recipeBranding";

const siteUrl = getSiteUrl();

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  image_url: string;
  prep_time: number;
  cook_time: number;
  servings: number;
}

const getRecipes = unstable_cache(
  async (): Promise<Recipe[]> => {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(`
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings
        FROM recipes 
        ORDER BY created_at DESC
      `);
        return result.rows.map((recipe: Recipe) => ({
          ...recipe,
          description: sanitizeRecipeText(recipe.description),
          ingredients: sanitizeRecipeList(recipe.ingredients),
          instructions: sanitizeRecipeList(recipe.instructions),
        }));
      } finally {
        client.release();
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      return [];
    }
  },
  ["recipes-list"],
  { revalidate: 300 }
);

export const metadata: Metadata = {
  title: "Chicken Recipes | K2 Chicken Recipe Cookbook",
  description:
    "Master the art of cooking delicious chicken dishes at home with K2 Chicken's recipe cookbook. Step-by-step instructions, ingredients, prep time, and serving sizes for premium chicken recipes.",
  keywords: [
    "chicken recipes",
    "chicken cooking recipes",
    "chicken dishes pune",
    "how to cook chicken",
    "chicken recipe ideas",
    "K2 chicken recipes",
    "premium chicken recipes",
  ],
  openGraph: {
    title: "Chicken Recipes | K2 Chicken Recipe Cookbook",
    description:
      "Master the art of cooking delicious chicken dishes at home with step-by-step recipes from K2 Chicken.",
    url: `${siteUrl}/recipes`,
    siteName: "K2 Chicken",
    images: [
      {
        url: "/hero-fresh-simple.png",
        width: 1200,
        height: 630,
        alt: "K2 Chicken Recipe Cookbook",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/recipes`,
  },
};

export default async function RecipesPage() {
  const recipes = await getRecipes();

  if (recipes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              K2 Chicken Recipe Cookbook
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
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
      </div>
    );
  }

  // Generate structured data for recipes page
  const recipesStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "K2 Chicken Recipe Cookbook",
    description: "Master the art of cooking delicious chicken dishes at home",
    url: `${siteUrl}/recipes`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: recipes.map((recipe: Recipe, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Recipe",
          name: recipe.title,
          description: sanitizeRecipeText(recipe.description),
          image: recipe.image_url,
          prepTime: `PT${recipe.prep_time}M`,
          cookTime: `PT${recipe.cook_time}M`,
          recipeYield: recipe.servings.toString(),
          recipeIngredient: sanitizeRecipeList(recipe.ingredients),
          recipeInstructions: sanitizeRecipeList(recipe.instructions).map((instruction: string, idx: number) => ({
            "@type": "HowToStep",
            position: idx + 1,
            text: instruction,
          })),
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipesStructuredData) }}
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 animate-slide-down">
          <Link
            href="/"
            className="inline-flex items-center text-brand-red hover:text-brand-red mb-4 transform transition-all duration-300 hover:translate-x-[-4px]"
          >
            <ArrowLeft
              size={20}
              className="mr-2 transform transition-transform duration-300 group-hover:translate-x-[-4px]"
            />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up stagger-1">
            K2 Chicken Recipe Cookbook
          </h1>
          <p className="text-lg text-gray-600 mt-2 mb-4 animate-slide-up stagger-2">
            Master the art of cooking delicious fresh chicken dishes at home
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 border-2 border-green-200 rounded-full px-6 py-3 transform transition-all duration-300 hover:scale-105 hover:shadow-md animate-scale-in stagger-3">
            <span className="text-green-700 font-semibold">
              Made with K2 Chicken Products
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => (
            <div
              key={recipe.id}
              className="card hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:border-red-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="aspect-w-16 aspect-h-9 mb-4 overflow-hidden rounded-lg group/image">
                <div className="w-full h-48 bg-gradient-to-br from-brand-red to-red-500 rounded-lg flex items-center justify-center transform transition-transform duration-500 group-hover/image:scale-110">
                  <ChefHat
                    size={48}
                    className="text-white transform transition-transform duration-300 group-hover/image:rotate-12"
                  />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-red transition-colors duration-300">
                {recipe.title}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {sanitizeRecipeText(recipe.description)}
              </p>

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
                <h4 className="font-semibold text-gray-900 mb-2">
                  Key Ingredients:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => {
                    // Reinforce the K2 Chicken brand in recipe snippets.
                    const processedIngredient = ingredient.replace(
                      /\bchicken\b/gi,
                      "fresh K2 Chicken"
                    );
                    return <li key={index}>• {processedIngredient}</li>;
                  })}
                  {recipe.ingredients.length > 3 && (
                    <li className="text-chicken-red">
                      + {recipe.ingredients.length - 3} more ingredients
                    </li>
                  )}
                </ul>
              </div>

              <Link
                href={`/recipes/${recipe.id}`}
                className="w-full btn-secondary flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <ChefHat
                  size={20}
                  className="transform transition-transform duration-300 group-hover:rotate-12"
                />
                <span>View Recipe</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
