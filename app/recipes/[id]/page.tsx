import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ChefHat, ArrowLeft, CheckCircle } from "lucide-react";
import pool from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getRecipeImageUrl } from "@/lib/recipeImages";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";
import { sanitizeRecipeList, sanitizeRecipeText } from "@/lib/recipeBranding";

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
  created_at?: string;
}

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `
        SELECT id, title, description, ingredients, instructions, image_url, prep_time, cook_time, servings, created_at
        FROM recipes 
        WHERE id = $1
      `,
        [id]
      );
      const recipe = result.rows[0];
      if (!recipe) return null;

      return {
        ...recipe,
        description: sanitizeRecipeText(recipe.description),
        ingredients: sanitizeRecipeList(recipe.ingredients),
        instructions: sanitizeRecipeList(recipe.instructions),
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: "Recipe Not Found | K2 Chicken",
    };
  }

  const siteUrl = getSiteUrl();
  const imageUrl =
    getRecipeImageUrl(recipe.title, recipe.image_url) ||
    `${siteUrl}/hero-fresh-simple.png`;

  return {
    title: `${recipe.title} | K2 Chicken Recipe`,
    description: `${recipe.description} - Prep time: ${recipe.prep_time} min, Cook time: ${recipe.cook_time} min, Serves: ${recipe.servings} people. Step-by-step instructions included.`,
    keywords: [
      recipe.title.toLowerCase(),
      "chicken recipe",
      "how to cook chicken",
      "chicken dish",
      "K2 chicken recipe",
      ...recipe.ingredients.slice(0, 5).map((ing: string) => ing.toLowerCase()),
    ],
    openGraph: {
      title: `${recipe.title} | K2 Chicken Recipe`,
      description: recipe.description,
      url: `${siteUrl}/recipes/${id}`,
      siteName: "K2 Chicken",
      images: [
        {
          url: absoluteUrl(imageUrl),
          width: 1200,
          height: 630,
          alt: recipe.title,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${recipe.title} | K2 Chicken Recipe`,
      description: recipe.description,
      images: [absoluteUrl(imageUrl)],
    },
    alternates: {
      canonical: `${siteUrl}/recipes/${id}`,
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const imageUrl =
    getRecipeImageUrl(recipe.title, recipe.image_url) ||
    `${siteUrl}/hero-fresh-simple.png`;

  // Generate structured data for recipe
  const recipeStructuredData = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: absoluteUrl(imageUrl),
    prepTime: `PT${recipe.prep_time}M`,
    cookTime: `PT${recipe.cook_time}M`,
    totalTime: `PT${recipe.prep_time + recipe.cook_time}M`,
    recipeYield: recipe.servings.toString(),
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.instructions.map(
      (instruction: string, index: number) => ({
        "@type": "HowToStep",
        position: index + 1,
        text: instruction,
      })
    ),
    author: {
      "@type": "Organization",
      name: "K2 Chicken",
    },
    publisher: {
      "@type": "Organization",
      name: "K2 Chicken",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    datePublished: recipe.created_at
      ? new Date(recipe.created_at).toISOString()
      : "2024-01-01T00:00:00.000Z",
    dateModified: recipe.created_at
      ? new Date(recipe.created_at).toISOString()
      : "2024-01-01T00:00:00.000Z",
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Recipes",
        item: `${siteUrl}/recipes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: recipe.title,
        item: `${siteUrl}/recipes/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(recipeStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      <div className="min-h-screen bg-gray-50 py-16">
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
            <div className="relative h-80 bg-gray-900">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  priority
                  quality={85}
                />
              ) : null}
              {!imageUrl && (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat size={80} className="text-white opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                  {recipe.title}
                </h1>
                <p className="text-xl text-white/90">{recipe.description}</p>
              </div>
            </div>

            {/* Recipe Info Cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl">
                <div className="p-3 bg-brand-red rounded-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {recipe.prep_time} min
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-xl">
                <div className="p-3 bg-red-500 rounded-lg">
                  <Clock className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cook Time</p>
                  <p className="text-xl font-bold text-gray-900">
                    {recipe.cook_time} min
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl">
                <div className="p-3 bg-yellow-500 rounded-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servings</p>
                  <p className="text-xl font-bold text-gray-900">
                    {recipe.servings} people
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* K2 Chicken quality notice */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-900 mb-2">
                  Premium Quality Ingredients
                </h3>
                <p className="text-green-800 leading-relaxed">
                  These recipes are designed for fresh{" "}
                  <strong className="font-semibold">K2 Chicken</strong>{" "}
                  products. Use clean, premium cuts from K2 Chicken for better
                  texture, freshness, and taste in every dish.
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
                {recipe.ingredients.map((ingredient, index) => {
                  // Reinforce the K2 Chicken brand in ingredient lists.
                  const processedIngredient = ingredient.replace(
                    /\bchicken\b/gi,
                    "fresh K2 Chicken"
                  );
                  return (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle
                        className="text-green-500 mt-1 flex-shrink-0"
                        size={20}
                      />
                      <span className="text-gray-700 text-lg">
                        {processedIngredient}
                      </span>
                    </li>
                  );
                })}
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
                    <div className="flex-shrink-0 w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <p className="text-gray-700 text-lg leading-relaxed pt-1">
                      {instruction}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-brand-red hover:bg-brand-red-hover text-white rounded-xl font-semibold transition-colors duration-300 shadow-soft hover:shadow-card"
            >
              <ChefHat size={20} className="mr-2" />
              Order Fresh Ingredients
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
