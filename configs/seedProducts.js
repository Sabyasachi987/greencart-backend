import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedProducts = [
  {
    name: 'Potato 500g',
    category: 'Vegetables',
    price: 25,
    offerPrice: 20,
    image: [
      '/assets/potato_image_1.png'
    //   '/assets/potato_image_2.png',
    //   '/assets/potato_image_3.png',
    //   '/assets/potato_image_4.png',
    ],
    description: ['Fresh and organic', 'Rich in carbohydrates', 'Ideal for curries and fries'],
    inStock: true,
  },
  {
    name: 'Tomato 1 kg',
    category: 'Vegetables',
    price: 40,
    offerPrice: 35,
    image: ['/assets/tomato_image.png'],
    description: ['Juicy and ripe', 'Rich in Vitamin C', 'Perfect for salads and sauces'],
    inStock: true,
  },
  {
    name: 'Carrot 500g',
    category: 'Vegetables',
    price: 30,
    offerPrice: 28,
    image: ['/assets/carrot_image.png'],
    description: ['Sweet and crunchy', 'Good for eyesight', 'Ideal for juices and salads'],
    inStock: true,
  },
  {
    name: 'Apple 1 kg',
    category: 'Fruits',
    price: 120,
    offerPrice: 110,
    image: ['/assets/apple_image.png'],
    description: ['Crisp and juicy', 'Rich in fiber', 'Great for healthy snacking'],
    inStock: true,
  },
  {
    name: 'Orange 1 kg',
    category: 'Fruits',
    price: 80,
    offerPrice: 75,
    image: ['/assets/orange_image.png'],
    description: ['Juicy and sweet', 'Rich in Vitamin C', 'Perfect for juices'],
    inStock: true,
  },
  {
    name: 'Paneer 200g',
    category: 'Dairy',
    price: 90,
    offerPrice: 85,
    image: ['/assets/paneer_image.png'],
    description: ['Soft and fresh', 'High in protein', 'Ideal for curries'],
    inStock: true,
  },
  {
    name: 'Basmati Rice 1 kg',
    category: 'Grains',
    price: 150,
    offerPrice: 135,
    image: ['/assets/basmati_rice_image.png'],
    description: ['Long grain rice', 'Aromatic', 'Great for biryani and pulao'],
    inStock: true,
  },
  {
    name: 'Onion 500g',
    category: 'Vegetables',
    price: 22,
    offerPrice: 19,
    image: ['/assets/onion_image_1.png'],
    description: ['Fresh and pungent', 'Perfect for cooking', 'A kitchen staple'],
    inStock: true,
  },
  {
    name: 'Banana 1 kg',
    category: 'Fruits',
    price: 50,
    offerPrice: 45,
    image: ['/assets/banana_image_1.png'],
    description: ['Sweet and ripe', 'High in potassium', 'Great for smoothies and snacking'],
    inStock: true,
  },
  {
    name: 'Mango 1 kg',
    category: 'Fruits',
    price: 150,
    offerPrice: 140,
    image: ['/assets/mango_image_1.png'],
    description: ['Sweet and flavorful', 'Perfect for smoothies and desserts', 'Rich in Vitamin A'],
    inStock: true,
  },
  {
    name: 'Grapes 500g',
    category: 'Fruits',
    price: 70,
    offerPrice: 65,
    image: ['/assets/grapes_image_1.png'],
    description: ['Fresh and seedless', 'Sweet and juicy', 'Great for snacking'],
    inStock: true,
  },
];

const NON_PRODUCT_TOKENS = [
  'banner',
  'upload_area',
  'profile_icon',
  'organic_vegitable',
  'fresh_fruits',
  'bottles',
  'dairy_product',
  'bakery',
  'grain',
  'main_',
  'bottom_',
];

const categoryFromFile = (fileName) => {
  const key = fileName.toLowerCase();
  if (/(potato|tomato|carrot|spinach|onion)/.test(key)) return 'Vegetables';
  if (/(apple|orange|banana|mango|grapes)/.test(key)) return 'Fruits';
  if (/(milk|paneer|cheese|eggs|yogurt)/.test(key)) return 'Dairy';
  if (/(rice|quinoa|barley|flour)/.test(key)) return 'Grains';
  if (/(cola|pepsi|sprite|fanta|seven_up)/.test(key)) return 'Drinks';
  if (/(bread|croissant|cake|muffins)/.test(key)) return 'Bakery';
  if (/(maggi|ramen|soup|yippee)/.test(key)) return 'Instant';
  return 'Groceries';
};

const titleCase = (value) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const nameFromFile = (fileName) => {
  const base = fileName
    .replace('.png', '')
    .replace(/_image(_\d+)?$/i, '')
    .replace(/_\d+$/i, '')
    .replace(/_/g, ' ')
    .trim();
  return titleCase(base);
};

const priceFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 1000;
  }
  const price = 30 + (hash % 170);
  const offerPrice = Math.max(10, price - Math.floor(price * 0.1));
  return { price, offerPrice };
};

export const createSeedKey = (product) => {
  const name = (product.name || '').trim().toLowerCase();
  const image = Array.isArray(product.image) && product.image.length > 0 ? product.image[0] : '';
  return `${name}::${image}`;
};

export const generateAssetSeedProducts = () => {
  const assetsDir = path.resolve(__dirname, '../public/assets');
  if (!fs.existsSync(assetsDir)) return [];

  const files = fs
    .readdirSync(assetsDir)
    .filter((file) => file.toLowerCase().endsWith('.png'))
    .filter((file) => file.toLowerCase().includes('_image'))
    .filter((file) => !NON_PRODUCT_TOKENS.some((token) => file.toLowerCase().includes(token)));

  return files.map((file) => {
    const name = nameFromFile(file);
    const { price, offerPrice } = priceFromName(name);
    return {
      name,
      category: categoryFromFile(file),
      price,
      offerPrice,
      image: [`/assets/${file}`],
      description: ['Fresh quality product', 'Carefully packed', 'Best value for daily shopping'],
      inStock: true,
    };
  });
};
