"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChefHat } from "lucide-react";
import SectionHeader from "./SectionHeader";
import RecipeCard from "./RecipeCard";

interface Recipe {
  id: number;
  title: string;
  description: string;
  ingredients?: string[];
  instructions?: string[];
  image_url?: string;
  prep_time: number;
  cook_time: number;
  servings: number;
}

interface RecipeSectionProps {
  initialRecipes?: Recipe[];
}

export default function RecipeSection({
  initialRecipes,
}: RecipeSectionProps = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes || []);
  const [loading, setLoading] = useState(!initialRecipes);

  useEffect(() => {
    if (initialRecipes && initialRecipes.length > 0) {
      setRecipes(initialRecipes);
      setLoading(false);
    } else if (!initialRecipes) {
      fetchRecipes();
    }
  }, [initialRecipes]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes", {
        next: { revalidate: 60 },
      });
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const [featured, ...rest] = recipes;

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Recipes"
            title="Chicken recipe cookbook"
            subtitle="Learn to cook delicious chicken dishes at home."
            icon={ChefHat}
          />
          <div className="aspect-[3/1] bg-gray-200 rounded-card animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-card shadow-soft border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-gray-200 w-full" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Recipes"
          title="Chicken recipe cookbook"
          subtitle="Learn to cook delicious chicken dishes at home with our expert recipes and cooking tips."
          icon={ChefHat}
        />

        {featured && (
          <div className="mb-8 sm:mb-10">
            <RecipeCard recipe={featured} featured />
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {recipes.length === 0 && (
          <p className="text-center text-gray-500 py-8">No recipes yet. Check back soon.</p>
        )}

        <div className="text-center mt-10 sm:mt-12">
          <Link
            href="/recipes"
            className="inline-flex items-center gap-2 bg-white border border-red-200 hover:border-red-200 text-brand-red font-semibold px-6 sm:px-8 py-3 rounded-button shadow-soft hover:shadow-card transition-all duration-smooth"
          >
            View all recipes
          </Link>
        </div>
      </div>
    </section>
  );
}
