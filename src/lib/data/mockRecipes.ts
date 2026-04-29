export const mockRecipes = [
  {
    _id: "1",
    title: "Creamy Tomato Soup",
    category: "Soup",
    prepTime: 10,
    cookTime: 20,
    description: "A rich, minimalist approach to the classic tomato soup.",
    imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=2071&auto=format&fit=crop",
    ingredients: [
      { amount: "8", unit: "large", name: "tomatoes" },
      { amount: "1", unit: "cup", name: "heavy cream" },
      { amount: "2", unit: "cloves", name: "garlic" }
    ],
    steps: [
      "Roast tomatoes and garlic.",
      "Blend until smooth.",
      "Stir in heavy cream and simmer."
    ]
  },
  {
    _id: "2",
    title: "Mushroom Risotto",
    category: "Main Course",
    prepTime: 15,
    cookTime: 30,
    description: "Earthy, creamy, and deeply satisfying Italian classic.",
    imageUrl: "https://images.unsplash.com/photo-1476124369491-e59f5f0ceb07?q=80&w=2070&auto=format&fit=crop",
    ingredients: [
      { amount: "1", unit: "cup", name: "arborio rice" },
      { amount: "2", unit: "cups", name: "mushrooms" },
      { amount: "4", unit: "cups", name: "vegetable broth" }
    ],
    steps: [
      "Sauté mushrooms and set aside.",
      "Toast rice, then gradually add broth while stirring continuously.",
      "Fold in mushrooms and parmesan cheese."
    ]
  },
  {
    _id: "3",
    title: "Avocado Toast",
    category: "Breakfast",
    prepTime: 5,
    cookTime: 5,
    description: "Simple, healthy, and perfectly balanced morning starter.",
    imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?q=80&w=2072&auto=format&fit=crop",
    ingredients: [
      { amount: "2", unit: "slices", name: "sourdough bread" },
      { amount: "1", unit: "ripe", name: "avocado" },
      { amount: "Pinch", unit: "", name: "chili flakes" }
    ],
    steps: [
      "Toast the sourdough slices until golden.",
      "Mash avocado with lime juice, salt, and pepper.",
      "Spread on toast and top with chili flakes."
    ]
  }
];
