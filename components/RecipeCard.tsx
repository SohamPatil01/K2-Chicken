"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, Users, ChefHat, ArrowRight } from "lucide-react";
import { getRecipeImageUrl, RECIPE_IMAGES } from "@/lib/recipeImages";

export interface Recipe {
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

export interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
  featured?: boolean;
}

const PLACEHOLDER_IMAGE = "/hero-fresh-simple.png";

export default function RecipeCard({
  recipe,
  className = "",
  featured = false,
}: RecipeCardProps) {
  const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
  const imageUrl = getRecipeImageUrl(recipe.title, recipe.image_url) || PLACEHOLDER_IMAGE;
  const hasRealImage = !!(recipe.image_url || RECIPE_IMAGES[recipe.title]);

  if (featured) {
    return (
      <Link
        href={`/recipes/${recipe.id}`}
        className={`group block bg-white rounded-card shadow-soft hover:shadow-card-hover transition-all duration-smooth overflow-hidden border border-gray-100 hover:border-red-200 ${className}`}
      >
        <div className="aspect-[16/6] sm:aspect-[3/1] relative bg-gray-100 overflow-hidden">
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, 80vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              if (hasRealImage) {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h3 className="text-xl sm:text-2xl font-bold drop-shadow-sm line-clamp-2">
              {recipe.title}
            </h3>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/90 text-sm">
              {totalTime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {totalTime} min
                </span>
              )}
              {recipe.servings > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {recipe.servings} servings
                </span>
              )}
            </div>
            <span className="inline-flex items-center gap-2 mt-3 text-brand-red font-semibold text-sm group-hover:gap-3 transition-all duration-smooth">
              View recipe
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className={`group flex flex-col bg-white rounded-card shadow-soft hover:shadow-card-hover transition-all duration-smooth overflow-hidden border border-gray-100 hover:border-red-200 h-full ${className}`}
    >
      <div className="aspect-[4/3] relative w-full overflow-hidden bg-gray-100 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-smooth"
            onError={(e) => {
              if (hasRealImage) {
                e.currentTarget.src = PLACEHOLDER_IMAGE;
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-red to-amber-50">
            <ChefHat className="w-16 h-16 text-brand-red" />
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-red transition-colors duration-smooth text-balance line-clamp-2 mb-2">
          {recipe.title}
        </h3>
        {recipe.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
            {recipe.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
          {totalTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {totalTime} min
            </span>
          )}
          {recipe.servings > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {recipe.servings} servings
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-2 mt-3 text-brand-red font-medium text-sm group-hover:gap-3 transition-all duration-smooth">
          View recipe
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
