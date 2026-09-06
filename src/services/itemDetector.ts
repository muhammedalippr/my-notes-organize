import { SmartSuggestion } from '../types';

export const COMMON_SHOPPING_ITEMS: SmartSuggestion[] = [
  // Vegetables
  { name: 'Tomato', defaultUnit: 'kg', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Onion', defaultUnit: 'kg', defaultQuantity: 2, category: 'Vegetables' },
  { name: 'Potato', defaultUnit: 'kg', defaultQuantity: 2, category: 'Vegetables' },
  { name: 'Garlic', defaultUnit: 'g', defaultQuantity: 250, category: 'Vegetables' },
  { name: 'Ginger', defaultUnit: 'g', defaultQuantity: 250, category: 'Vegetables' },
  { name: 'Green Chili', defaultUnit: 'g', defaultQuantity: 200, category: 'Vegetables' },
  { name: 'Carrot', defaultUnit: 'kg', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Cabbage', defaultUnit: 'kg', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Cauliflower', defaultUnit: 'nos', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Spinach', defaultUnit: 'bunch', defaultQuantity: 2, category: 'Vegetables' },
  { name: 'Coriander', defaultUnit: 'bunch', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Mint Leaves', defaultUnit: 'bunch', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Cucumber', defaultUnit: 'kg', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Capsicum', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Vegetables' },
  { name: 'Beans', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Vegetables' },
  { name: 'Mushroom', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Beetroot', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Vegetables' },
  { name: 'Brinjal / Eggplant', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Vegetables' },
  { name: 'Peas', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Vegetables' },
  { name: 'Lemon', defaultUnit: 'nos', defaultQuantity: 4, category: 'Vegetables' },
  { name: 'Broccoli', defaultUnit: 'nos', defaultQuantity: 1, category: 'Vegetables' },
  { name: 'Pumpkin', defaultUnit: 'kg', defaultQuantity: 1, category: 'Vegetables' },
  
  // Fruits
  { name: 'Apple', defaultUnit: 'kg', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Banana', defaultUnit: 'nos', defaultQuantity: 6, category: 'Fruits' },
  { name: 'Orange', defaultUnit: 'kg', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Mango', defaultUnit: 'kg', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Grapes', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Fruits' },
  { name: 'Papaya', defaultUnit: 'nos', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Watermelon', defaultUnit: 'nos', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Pineapple', defaultUnit: 'nos', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Pomegranate', defaultUnit: 'kg', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Avocado', defaultUnit: 'nos', defaultQuantity: 2, category: 'Fruits' },
  { name: 'Coconut', defaultUnit: 'nos', defaultQuantity: 2, category: 'Fruits' },
  { name: 'Strawberries', defaultUnit: 'box', defaultQuantity: 1, category: 'Fruits' },
  { name: 'Guava', defaultUnit: 'kg', defaultQuantity: 1, category: 'Fruits' },

  // Dairy & Bakery
  { name: 'Milk', defaultUnit: 'L', defaultQuantity: 1, category: 'Dairy' },
  { name: 'Curd / Yogurt', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Dairy' },
  { name: 'Butter', defaultUnit: 'g', defaultQuantity: 200, category: 'Dairy' },
  { name: 'Cheese / Paneer', defaultUnit: 'g', defaultQuantity: 200, category: 'Dairy' },
  { name: 'Bread', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Bakery' },
  { name: 'Eggs', defaultUnit: 'nos', defaultQuantity: 12, category: 'Dairy' },
  { name: 'Ghee', defaultUnit: 'ml', defaultQuantity: 500, category: 'Dairy' },

  // Grocery & Staples
  { name: 'Rice', defaultUnit: 'kg', defaultQuantity: 5, category: 'Staples' },
  { name: 'Atta / Wheat Flour', defaultUnit: 'kg', defaultQuantity: 5, category: 'Staples' },
  { name: 'Sugar', defaultUnit: 'kg', defaultQuantity: 2, category: 'Staples' },
  { name: 'Salt', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Staples' },
  { name: 'Cooking Oil', defaultUnit: 'L', defaultQuantity: 1, category: 'Staples' },
  { name: 'Coconut Oil', defaultUnit: 'L', defaultQuantity: 1, category: 'Staples' },
  { name: 'Olive Oil', defaultUnit: 'ml', defaultQuantity: 500, category: 'Staples' },
  { name: 'Dal / Lentils', defaultUnit: 'kg', defaultQuantity: 1, category: 'Staples' },
  { name: 'Chickpeas / Chana', defaultUnit: 'kg', defaultQuantity: 1, category: 'Staples' },
  { name: 'Tea Powder', defaultUnit: 'g', defaultQuantity: 250, category: 'Staples' },
  { name: 'Coffee Powder', defaultUnit: 'g', defaultQuantity: 100, category: 'Staples' },
  { name: 'Pasta', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Staples' },
  { name: 'Noodles / Maggi', defaultUnit: 'pkt', defaultQuantity: 2, category: 'Staples' },
  { name: 'Oats', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Staples' },
  { name: 'Biscuits / Cookies', defaultUnit: 'pkt', defaultQuantity: 2, category: 'Snacks' },
  
  // Spices & Condiments
  { name: 'Turmeric Powder', defaultUnit: 'g', defaultQuantity: 100, category: 'Spices' },
  { name: 'Chili Powder', defaultUnit: 'g', defaultQuantity: 200, category: 'Spices' },
  { name: 'Black Pepper', defaultUnit: 'g', defaultQuantity: 100, category: 'Spices' },
  { name: 'Cumin Seeds / Jeera', defaultUnit: 'g', defaultQuantity: 100, category: 'Spices' },
  { name: 'Cardamom / Elaichi', defaultUnit: 'g', defaultQuantity: 50, category: 'Spices' },
  { name: 'Garam Masala', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Spices' },
  { name: 'Tomato Ketchup', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Condiments' },

  // Meat & Seafood
  { name: 'Chicken', defaultUnit: 'kg', defaultQuantity: 1, category: 'Meat' },
  { name: 'Mutton', defaultUnit: 'kg', defaultQuantity: 1, category: 'Meat' },
  { name: 'Fish', defaultUnit: 'kg', defaultQuantity: 1, category: 'Meat' },
  { name: 'Prawns', defaultUnit: 'kg', defaultQuantity: 0.5, category: 'Meat' },
  { name: 'Beef', defaultUnit: 'kg', defaultQuantity: 1, category: 'Meat' },

  // Cleaning & Laundry
  { name: 'Washing Powder', defaultUnit: 'kg', defaultQuantity: 2, category: 'Cleaning' },
  { name: 'Detergent Liquid', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Dish Soap / Liquid', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Fabric Softener', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Floor Cleaner / Phenyl', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Toilet Cleaner / Harpic', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Scrub Sponges', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Cleaning' },
  { name: 'Bathing Soap', defaultUnit: 'nos', defaultQuantity: 3, category: 'Household' },
  { name: 'Shampoo', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Household' },
  { name: 'Toothpaste', defaultUnit: 'nos', defaultQuantity: 1, category: 'Household' },
  { name: 'Toothbrush', defaultUnit: 'nos', defaultQuantity: 2, category: 'Household' },
  { name: 'Trash Bags', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Household' },
  { name: 'Tissue Paper / Napkins', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Household' },

  // Home Appliances & Electronics
  { name: 'Fridge / Refrigerator', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Washing Machine', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Microwave Oven', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Air Conditioner / AC', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Ceiling Fan', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Water Purifier / RO', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Electric Kettle', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Mixer Grinder', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Iron Box', defaultUnit: 'nos', defaultQuantity: 1, category: 'Appliances' },
  { name: 'Smart TV', defaultUnit: 'nos', defaultQuantity: 1, category: 'Electronics' },
  { name: 'Phone Charger', defaultUnit: 'nos', defaultQuantity: 1, category: 'Electronics' },
  { name: 'Power Extension Strip', defaultUnit: 'nos', defaultQuantity: 1, category: 'Electronics' },
  { name: 'LED Bulb', defaultUnit: 'nos', defaultQuantity: 2, category: 'Electrical' },
  { name: 'Batteries', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Electrical' },

  // Plumbing, Hardware & Tools
  { name: 'Water Motor / Pump', defaultUnit: 'nos', defaultQuantity: 1, category: 'Hardware' },
  { name: 'Water Pipe Hose', defaultUnit: 'nos', defaultQuantity: 1, category: 'Hardware' },
  { name: 'Tap / Faucet', defaultUnit: 'nos', defaultQuantity: 1, category: 'Plumbing' },
  { name: 'Teflon Tape', defaultUnit: 'nos', defaultQuantity: 2, category: 'Plumbing' },
  { name: 'PVC Solvent Glue', defaultUnit: 'bottle', defaultQuantity: 1, category: 'Plumbing' },
  { name: 'Shower Head', defaultUnit: 'nos', defaultQuantity: 1, category: 'Plumbing' },
  { name: 'Drill Machine', defaultUnit: 'nos', defaultQuantity: 1, category: 'Hardware' },
  { name: 'Screwdriver Set', defaultUnit: 'nos', defaultQuantity: 1, category: 'Hardware' },
  { name: 'Wall Nails & Screws', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Hardware' },
  { name: 'Door Lock', defaultUnit: 'nos', defaultQuantity: 1, category: 'Hardware' },

  // Stationery & Office
  { name: 'Pen', defaultUnit: 'nos', defaultQuantity: 2, category: 'Stationery' },
  { name: 'Notebook', defaultUnit: 'nos', defaultQuantity: 1, category: 'Stationery' },
  { name: 'A4 Paper', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Stationery' },
  { name: 'Sticky Notes', defaultUnit: 'pkt', defaultQuantity: 1, category: 'Stationery' },
  { name: 'Scissors', defaultUnit: 'nos', defaultQuantity: 1, category: 'Stationery' },
];

export const AVAILABLE_UNITS = ['kg', 'g', 'nos', 'L', 'ml', 'pkt', 'box', 'bunch', 'bottle'];

export function searchSmartSuggestions(query: string): SmartSuggestion[] {
  if (!query || query.trim().length === 0) return [];
  const clean = query.trim().toLowerCase();
  
  // Split search into individual words so typing "wash", "powder", "plump", "motor", "fridge" matches easily
  const words = clean.split(/\s+/).filter(Boolean);

  return COMMON_SHOPPING_ITEMS.filter(item => {
    const itemName = item.name.toLowerCase();
    const catName = (item.category || '').toLowerCase();
    return words.every(w => itemName.includes(w) || catName.includes(w)) ||
      itemName.includes(clean) ||
      clean.includes(itemName);
  }).slice(0, 8);
}

export function autoDetectUnitAndQuantity(inputName: string): { unit: string; quantity: number } {
  if (!inputName) return { unit: 'nos', quantity: 1 };
  
  const clean = inputName.trim().toLowerCase();

  // 1. Direct match with common item catalog
  const found = COMMON_SHOPPING_ITEMS.find(item => 
    item.name.toLowerCase().includes(clean) || clean.includes(item.name.toLowerCase())
  );
  if (found) {
    return { unit: found.defaultUnit, quantity: found.defaultQuantity };
  }

  // 2. Keyword heuristic checks
  if (/fridge|refrigerator|motor|pump|machine|tv|television|ac|fan|charger|laptop|kettle|blender|tap|faucet|shower|lock|scissors|screwdriver|drill|purifier|bulb/i.test(clean)) {
    return { unit: 'nos', quantity: 1 };
  }
  if (/oil|milk|water|juice|drink|sauce|syrup|vinegar|liquid|shampoo|cleaner|phenyl|harpic/i.test(clean)) {
    return { unit: 'L', quantity: 1 };
  }
  if (/powder|detergent|masala|spice|seeds|chili|cumin|cardamom|clove|cinnamon/i.test(clean)) {
    return { unit: clean.includes('wash') || clean.includes('detergent') ? 'kg' : 'g', quantity: clean.includes('wash') ? 2 : 100 };
  }
  if (/rice|flour|atta|sugar|dal|lentil|wheat|potato|onion|tomato|vegetable|fruit|meat|chicken|beef|mutton|fish/i.test(clean)) {
    return { unit: 'kg', quantity: 1 };
  }
  if (/biscuit|cookie|bread|packet|pkt|soap|batteries|napkin|tissue|screws|nails|paper/i.test(clean)) {
    return { unit: 'pkt', quantity: 1 };
  }
  if (/egg|pen|pencil|book|brush|paste|coconut|box|bottle|nos|piece/i.test(clean)) {
    return { unit: 'nos', quantity: 1 };
  }

  return { unit: 'nos', quantity: 1 };
}
