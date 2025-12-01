const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'chicken_vicken',
  password: process.env.POSTGRES_PASSWORD || 'password',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ...(process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  } : {})
});

// Parse time string like "20 mins" to integer
function parseTime(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : null;
}

const recipes = [
  {
    name: "Chicken Tikka Masala",
    category: "Indian",
    prepTime: "20 mins",
    cookTime: "35 mins",
    servings: 4,
    ingredients: [
      "500g boneless chicken",
      "1 cup yogurt",
      "1 tbsp ginger garlic paste",
      "1 tsp turmeric",
      "2 tsp red chilli powder",
      "1 tsp garam masala",
      "2 tbsp oil",
      "1 cup tomato puree",
      "1/2 cup cream",
      "Salt to taste"
    ],
    instructions: [
      "Marinate chicken with yogurt and spices for 1 hour.",
      "Grill or pan-fry the chicken until half cooked.",
      "Heat oil, add tomato puree and cook for 5 minutes.",
      "Add cream and simmer for 2 minutes.",
      "Add grilled chicken pieces and cook for 10–12 minutes.",
      "Serve hot with naan or rice."
    ],
    description: "A classic Indian favorite made with premium Baramati Agro Chicken. This creamy, aromatic dish features tender chicken pieces in a rich tomato-based sauce with a perfect blend of spices. The high-quality chicken from Baramati Agro ensures a juicy, flavorful result that's restaurant-quality."
  },
  {
    name: "Butter Chicken",
    category: "Indian",
    prepTime: "25 mins",
    cookTime: "40 mins",
    servings: 4,
    ingredients: [
      "500g chicken",
      "2 tbsp butter",
      "1 cup tomato puree",
      "1 tbsp ginger garlic paste",
      "1 tsp kasuri methi",
      "1/2 cup cream",
      "1 tsp red chilli powder",
      "Salt to taste"
    ],
    instructions: [
      "Cook chicken pieces and set aside.",
      "Heat butter, add tomato puree and cook until thick.",
      "Add spices, salt and cream.",
      "Add cooked chicken and simmer for 10 minutes.",
      "Garnish with kasuri methi."
    ],
    description: "Indulge in this rich and creamy butter chicken made with fresh Baramati Agro Chicken. The premium quality chicken absorbs the buttery, spiced tomato gravy perfectly, creating a melt-in-your-mouth experience. Perfect for special occasions or when you want to treat yourself to something truly special."
  },
  {
    name: "Chicken Curry (Desi Style)",
    category: "Indian",
    prepTime: "15 mins",
    cookTime: "35 mins",
    servings: 4,
    ingredients: [
      "700g chicken",
      "2 onions (chopped)",
      "2 tomatoes (chopped)",
      "1 tbsp ginger garlic paste",
      "2 tsp coriander powder",
      "1 tsp turmeric",
      "1 tsp garam masala",
      "2 tsp chilli powder",
      "Salt to taste",
      "2 tbsp oil"
    ],
    instructions: [
      "Heat oil, fry onions till golden.",
      "Add ginger garlic paste and sauté.",
      "Add tomatoes and cook till soft.",
      "Add all spices and mix well.",
      "Add chicken and cook on high flame for 5 minutes.",
      "Add water and simmer for 20 minutes.",
      "Serve with rice or roti."
    ],
    description: "Authentic desi-style chicken curry made with farm-fresh Baramati Agro Chicken. This traditional recipe brings out the natural flavors of the chicken with a perfect balance of spices. The quality of Baramati Agro Chicken ensures tender, succulent pieces that fall off the bone."
  },
  {
    name: "Chicken Biryani",
    category: "Indian",
    prepTime: "30 mins",
    cookTime: "45 mins",
    servings: 5,
    ingredients: [
      "1 kg chicken",
      "3 cups basmati rice",
      "3 onions (fried)",
      "1 cup yogurt",
      "2 tbsp biryani masala",
      "Mint leaves",
      "Coriander leaves",
      "Saffron milk",
      "2 tbsp ghee"
    ],
    instructions: [
      "Marinate chicken with yogurt and biryani masala for 1 hour.",
      "Half-cook rice separately.",
      "Layer chicken and rice in a pot with fried onions and herbs.",
      "Add saffron milk and ghee.",
      "Dum cook for 25 minutes.",
      "Serve hot."
    ],
    description: "A royal feast featuring aromatic basmati rice layered with perfectly spiced Baramati Agro Chicken. This biryani is a celebration dish that showcases the premium quality of Baramati Agro Chicken, which stays tender and flavorful even after the slow dum cooking process. Each grain of rice is infused with the rich flavors of the chicken and spices."
  },
  {
    name: "Chicken 65",
    category: "Indian",
    prepTime: "20 mins",
    cookTime: "20 mins",
    servings: 3,
    ingredients: [
      "500g chicken cubes",
      "1 egg",
      "1/2 cup cornflour",
      "1 tbsp ginger garlic paste",
      "2 tsp red chilli powder",
      "Curry leaves",
      "Oil for frying"
    ],
    instructions: [
      "Mix chicken with egg, flour, spices.",
      "Deep fry till crispy.",
      "Temper with curry leaves and chilli.",
      "Serve as starter."
    ],
    description: "Spicy and crispy chicken starter made with premium Baramati Agro Chicken. The high-quality chicken ensures a perfect crispy exterior while remaining juicy inside. This popular restaurant-style appetizer is made even better with the fresh, tender chicken from Baramati Agro."
  },
  {
    name: "Chicken Chettinad",
    category: "South Indian",
    prepTime: "15 mins",
    cookTime: "40 mins",
    servings: 4,
    ingredients: [
      "700g chicken",
      "2 onions",
      "2 tomatoes",
      "Chettinad spice mix",
      "Curry leaves",
      "Oil"
    ],
    instructions: [
      "Prepare masala with roasted spices.",
      "Cook onions and tomatoes until soft.",
      "Add chicken and masala paste.",
      "Cook until thick and aromatic.",
      "Serve with dosa or rice."
    ],
    description: "A fiery South Indian delicacy made with fresh Baramati Agro Chicken. This Chettinad-style preparation features a complex blend of roasted spices that pair beautifully with the premium quality chicken. The robust flavors of the masala are perfectly balanced by the tender, juicy chicken from Baramati Agro."
  },
  {
    name: "Chicken Korma",
    category: "Mughlai",
    prepTime: "20 mins",
    cookTime: "35 mins",
    servings: 4,
    ingredients: [
      "600g chicken",
      "1/2 cup yogurt",
      "Cashew paste",
      "Ginger garlic paste",
      "Fried onions",
      "Cardamom, cloves"
    ],
    instructions: [
      "Heat ghee and add whole spices.",
      "Add chicken and fry lightly.",
      "Add yogurt, cashew paste, and fried onions.",
      "Cook until creamy and soft."
    ],
    description: "A rich and creamy Mughlai classic made with premium Baramati Agro Chicken. This luxurious dish features a velvety cashew-based gravy that complements the tender chicken perfectly. The high-quality Baramati Agro Chicken absorbs the rich flavors beautifully, creating a dish fit for royalty."
  },
  {
    name: "Tandoori Chicken",
    category: "Indian",
    prepTime: "10 mins + marination",
    cookTime: "30 mins",
    servings: 4,
    ingredients: [
      "4 chicken legs",
      "Yogurt",
      "Tandoori masala",
      "Lemon juice",
      "Ginger garlic paste"
    ],
    instructions: [
      "Marinate chicken for 4–6 hours.",
      "Bake or grill for 25–30 minutes.",
      "Serve with mint chutney."
    ],
    description: "Classic tandoori chicken made with fresh Baramati Agro Chicken legs. The premium quality chicken marinates beautifully, absorbing all the yogurt and spice flavors. When grilled, the Baramati Agro Chicken develops a perfect char while staying incredibly juicy inside. Serve with fresh mint chutney for an authentic experience."
  },
  {
    name: "Chicken Kolhapuri",
    category: "Maharashtrian",
    prepTime: "15 mins",
    cookTime: "40 mins",
    servings: 4,
    ingredients: [
      "700g chicken",
      "Kolhapuri masala",
      "Onion",
      "Tomato",
      "Coconut paste",
      "Oil"
    ],
    instructions: [
      "Roast Kolhapuri spices and make paste.",
      "Sauté onions and tomatoes.",
      "Add chicken and spice paste.",
      "Cook until thick and spicy."
    ],
    description: "A spicy Maharashtrian specialty made with premium Baramati Agro Chicken. This Kolhapuri-style preparation is known for its bold, fiery flavors that are perfectly balanced by the tender, high-quality chicken. The fresh Baramati Agro Chicken ensures that every bite is flavorful and succulent, making this dish a true celebration of Maharashtrian cuisine."
  },
  {
    name: "Pepper Chicken",
    category: "South Indian",
    prepTime: "10 mins",
    cookTime: "25 mins",
    servings: 3,
    ingredients: [
      "500g chicken",
      "Black pepper",
      "Curry leaves",
      "Onion",
      "Ginger garlic paste"
    ],
    instructions: [
      "Heat oil and add curry leaves.",
      "Cook onions and spices.",
      "Add chicken and crushed pepper.",
      "Cook dry or semi-gravy consistency."
    ],
    description: "A simple yet flavorful South Indian dish made with fresh Baramati Agro Chicken. The bold flavors of black pepper and curry leaves complement the premium quality chicken beautifully. This quick and easy recipe showcases the natural taste of Baramati Agro Chicken while adding a delightful peppery kick."
  }
];

async function addRecipes() {
  const client = await pool.connect();
  
  try {
    console.log('🍗 Adding recipes to database...\n');
    
    let added = 0;
    let updated = 0;
    let errors = 0;

    for (const recipe of recipes) {
      try {
        // Check if recipe already exists
        const existing = await client.query(
          'SELECT id FROM recipes WHERE title = $1',
          [recipe.name]
        );

        const prepTime = parseTime(recipe.prepTime);
        const cookTime = parseTime(recipe.cookTime);

        if (existing.rows.length > 0) {
          // Update existing recipe
          await client.query(
            `UPDATE recipes 
             SET description = $1, ingredients = $2, instructions = $3, 
                 prep_time = $4, cook_time = $5, servings = $6
             WHERE title = $7`,
            [
              recipe.description,
              recipe.ingredients,
              recipe.instructions,
              prepTime,
              cookTime,
              recipe.servings,
              recipe.name
            ]
          );
          updated++;
          console.log(`✅ Updated: ${recipe.name}`);
        } else {
          // Insert new recipe
          await client.query(
            `INSERT INTO recipes (title, description, ingredients, instructions, prep_time, cook_time, servings)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              recipe.name,
              recipe.description,
              recipe.ingredients,
              recipe.instructions,
              prepTime,
              cookTime,
              recipe.servings
            ]
          );
          added++;
          console.log(`✅ Added: ${recipe.name}`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error with ${recipe.name}:`, error.message);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Added: ${added}`);
    console.log(`   🔄 Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    
    return {
      success: true,
      added,
      updated,
      errors
    };
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
addRecipes()
  .then(() => {
    console.log('\n✨ Recipes update completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed to add recipes:', error);
    process.exit(1);
  });

