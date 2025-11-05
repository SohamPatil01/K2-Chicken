const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

const newRecipes = [
  {
    title: 'Butter Chicken (Murgh Makhani)',
    description: 'Creamy, rich, and aromatic Indian curry with tender chicken pieces in a tomato-based sauce',
    ingredients: [
      '500g chicken breast, cut into pieces',
      '1 cup yogurt',
      '2 tbsp butter',
      '1 large onion, chopped',
      '3 cloves garlic, minced',
      '1 inch ginger, grated',
      '2 tomatoes, pureed',
      '1/2 cup heavy cream',
      '1 tsp garam masala',
      '1 tsp turmeric',
      '1 tsp red chili powder',
      '1 tsp cumin powder',
      'Salt to taste',
      'Fresh cilantro for garnish'
    ],
    instructions: [
      'Marinate chicken in yogurt, turmeric, red chili powder, and salt for 30 minutes',
      'Heat butter in a pan and cook chicken until golden brown, set aside',
      'In the same pan, sauté onions until golden, add garlic and ginger',
      'Add tomato puree and cook until oil separates',
      'Add garam masala, cumin powder, and cook for 2 minutes',
      'Add cream and simmer for 5 minutes',
      'Add cooked chicken and simmer for 10 minutes',
      'Garnish with cilantro and serve hot with naan or rice'
    ],
    prep_time: 30,
    cook_time: 40,
    servings: 4
  },
  {
    title: 'Chicken Tikka Masala',
    description: 'Tender chicken pieces in a rich, creamy, and mildly spiced tomato-based curry',
    ingredients: [
      '500g boneless chicken, cubed',
      '1 cup yogurt',
      '2 tbsp lemon juice',
      '2 tsp garam masala',
      '1 tsp turmeric',
      '1 tsp cumin',
      '1 tsp coriander powder',
      '2 tbsp butter',
      '1 large onion, chopped',
      '3 cloves garlic, minced',
      '1 inch ginger, grated',
      '1 can (14oz) tomato sauce',
      '1 cup heavy cream',
      '1 tsp paprika',
      'Salt to taste',
      'Fresh cilantro for garnish'
    ],
    instructions: [
      'Mix yogurt, lemon juice, garam masala, turmeric, cumin, and coriander powder',
      'Marinate chicken in this mixture for at least 2 hours',
      'Preheat oven to 400°F and bake chicken for 20 minutes',
      'Heat butter in a pan, sauté onions until soft',
      'Add garlic and ginger, cook for 1 minute',
      'Add tomato sauce, paprika, and simmer for 10 minutes',
      'Add cream and cooked chicken, simmer for 15 minutes',
      'Garnish with cilantro and serve'
    ],
    prep_time: 20,
    cook_time: 50,
    servings: 4
  },
  {
    title: 'Crispy Fried Chicken Wings',
    description: 'Perfectly crispy and juicy chicken wings with a golden-brown crust',
    ingredients: [
      '2 lbs chicken wings',
      '1 cup all-purpose flour',
      '1/2 cup cornstarch',
      '1 tsp salt',
      '1 tsp black pepper',
      '1 tsp paprika',
      '1 tsp garlic powder',
      '1 tsp onion powder',
      '1/2 tsp cayenne pepper',
      '1 cup buttermilk',
      'Oil for frying',
      'Your favorite dipping sauce'
    ],
    instructions: [
      'Pat dry chicken wings with paper towels',
      'Mix flour, cornstarch, salt, pepper, paprika, garlic powder, onion powder, and cayenne',
      'Dip wings in buttermilk, then coat with flour mixture',
      'Let wings rest for 15 minutes to allow coating to set',
      'Heat oil to 375°F in a deep fryer or large pot',
      'Fry wings in batches for 10-12 minutes until golden and crispy',
      'Drain on paper towels and serve hot with dipping sauce'
    ],
    prep_time: 20,
    cook_time: 15,
    servings: 4
  },
  {
    title: 'Chicken Biryani',
    description: 'Fragrant basmati rice layered with spiced chicken, caramelized onions, and aromatic spices',
    ingredients: [
      '500g chicken, cut into pieces',
      '2 cups basmati rice',
      '2 large onions, sliced',
      '3 tomatoes, chopped',
      '1/2 cup yogurt',
      '2 tbsp ginger-garlic paste',
      '2 green chilies, slit',
      '1 tsp turmeric',
      '1 tsp red chili powder',
      '1 tsp garam masala',
      '1 tsp biryani masala',
      'Whole spices (2 bay leaves, 4 cloves, 2 cardamom pods, 1 cinnamon stick)',
      'Saffron strands soaked in 2 tbsp warm milk',
      'Fresh mint and cilantro',
      'Salt to taste',
      'Ghee for frying'
    ],
    instructions: [
      'Wash and soak rice for 30 minutes, then cook until 70% done',
      'Marinate chicken with yogurt, ginger-garlic paste, turmeric, red chili powder, and salt for 1 hour',
      'Heat ghee and fry onions until golden brown, set aside half',
      'Add whole spices, then add marinated chicken and cook for 10 minutes',
      'Add tomatoes, biryani masala, and cook until chicken is tender',
      'Layer half the rice in a heavy-bottomed pot',
      'Add chicken curry, remaining fried onions, mint, and cilantro',
      'Top with remaining rice, drizzle saffron milk',
      'Cover and cook on low heat for 20 minutes (dum method)',
      'Serve hot with raita'
    ],
    prep_time: 30,
    cook_time: 60,
    servings: 6
  },
  {
    title: 'Honey Sriracha Chicken',
    description: 'Sweet and spicy glazed chicken with a perfect balance of flavors',
    ingredients: [
      '500g chicken thighs or drumsticks',
      '1/3 cup honey',
      '1/4 cup sriracha sauce',
      '2 tbsp soy sauce',
      '2 tbsp rice vinegar',
      '3 cloves garlic, minced',
      '1 tbsp fresh ginger, grated',
      '1 tsp sesame seeds',
      'Green onions for garnish',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Season chicken with salt and pepper',
      'Mix honey, sriracha, soy sauce, rice vinegar, garlic, and ginger in a bowl',
      'Marinate chicken in half the sauce for 30 minutes',
      'Preheat oven to 400°F',
      'Bake chicken for 25-30 minutes, basting with remaining sauce halfway through',
      'Broil for 2-3 minutes for a caramelized finish',
      'Garnish with sesame seeds and green onions',
      'Serve with steamed rice or vegetables'
    ],
    prep_time: 15,
    cook_time: 30,
    servings: 4
  },
  {
    title: 'Chicken Curry (Traditional Indian)',
    description: 'Classic Indian chicken curry with aromatic spices and rich gravy',
    ingredients: [
      '500g chicken, cut into pieces',
      '2 large onions, finely chopped',
      '3 tomatoes, pureed',
      '2 tbsp ginger-garlic paste',
      '1 tsp turmeric powder',
      '1 tsp red chili powder',
      '1 tsp coriander powder',
      '1/2 tsp cumin powder',
      '1/2 tsp garam masala',
      '2 bay leaves',
      '4 cloves',
      '2 cardamom pods',
      '1 cinnamon stick',
      '2 tbsp oil',
      'Fresh cilantro for garnish',
      'Salt to taste'
    ],
    instructions: [
      'Heat oil in a pan and add whole spices (bay leaves, cloves, cardamom, cinnamon)',
      'Add onions and sauté until golden brown',
      'Add ginger-garlic paste and cook for 2 minutes',
      'Add turmeric, red chili powder, coriander, and cumin powder',
      'Add tomato puree and cook until oil separates',
      'Add chicken pieces and cook for 10 minutes',
      'Add water, cover and simmer for 20-25 minutes until chicken is tender',
      'Add garam masala and cook for 2 more minutes',
      'Garnish with cilantro and serve hot with rice or roti'
    ],
    prep_time: 15,
    cook_time: 40,
    servings: 4
  },
  {
    title: 'Lemon Herb Roasted Chicken',
    description: 'Juicy roasted chicken with fresh herbs and zesty lemon flavor',
    ingredients: [
      '1 whole chicken (3-4 lbs)',
      '2 lemons, one juiced, one sliced',
      '4 cloves garlic, minced',
      '2 tbsp fresh rosemary, chopped',
      '2 tbsp fresh thyme, chopped',
      '3 tbsp olive oil',
      '1 tsp salt',
      '1/2 tsp black pepper',
      '1 onion, quartered',
      '2 carrots, chopped',
      '2 potatoes, chopped'
    ],
    instructions: [
      'Preheat oven to 425°F',
      'Mix lemon juice, garlic, herbs, olive oil, salt, and pepper',
      'Loosen skin on chicken and rub herb mixture under the skin',
      'Rub remaining mixture on the outside of the chicken',
      'Place lemon slices and onion inside the cavity',
      'Place chicken on a bed of carrots and potatoes in a roasting pan',
      'Roast for 1 hour 15 minutes or until internal temperature reaches 165°F',
      'Let rest for 15 minutes before carving',
      'Serve with roasted vegetables'
    ],
    prep_time: 20,
    cook_time: 75,
    servings: 6
  }
];

async function addRecipes() {
  const client = await pool.connect();
  
  try {
    console.log('Adding curated recipes...');
    
    // Check existing recipes to avoid duplicates
    const existingRecipes = await client.query('SELECT title FROM recipes');
    const existingTitles = new Set(existingRecipes.rows.map(r => r.title.toLowerCase()));
    
    for (const recipe of newRecipes) {
      if (existingTitles.has(recipe.title.toLowerCase())) {
        console.log(`⚠ Recipe already exists: ${recipe.title}`);
        continue;
      }
      
      await client.query(
        `INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [recipe.title, recipe.description, recipe.ingredients, recipe.instructions, 
         recipe.prep_time, recipe.cook_time, recipe.servings]
      );
      
      console.log(`✓ Added recipe: ${recipe.title}`);
    }
    
    console.log('Recipes added successfully!');
  } catch (error) {
    console.error('Error adding recipes:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if this script is executed directly
if (require.main === module) {
  addRecipes()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { addRecipes };

