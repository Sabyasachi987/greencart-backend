import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import connectDB from './configs/db.js';
import 'dotenv/config';
import userRouter from './routes/userRoute.js';
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';
import Product from './models/Product.js';
import { createSeedKey, generateAssetSeedProducts, seedProducts } from './configs/seedProducts.js';

const app = express();
const port = process.env.PORT || 4000;

await connectDB()
await connectCloudinary()

// Allow multiple origins
const allowedOrigins = [
  process.env.URL || 'http://localhost:5173'
];

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks)

// Middleware configuration
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}));
app.use('/assets', express.static('public/assets'));


app.get('/', (req, res) => res.send("API is Working"));
app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)

const seedInitialProducts = async ()=>{
  const generatedProducts = generateAssetSeedProducts();
  const allSeedProducts = [...seedProducts, ...generatedProducts];
  let insertedCount = 0;

  for (const product of allSeedProducts) {
    const seedKey = createSeedKey(product);
    const result = await Product.updateOne({
      seedKey,
    }, {
      $setOnInsert: {
        ...product,
        seedKey,
        isSeeded: true,
      },
    }, {
      upsert: true,
    });

    if (result.upsertedCount > 0) {
      insertedCount += result.upsertedCount;
    }
  }

  if (insertedCount > 0) {
    console.log(`Seeded ${insertedCount} product(s) from assets`);
  }
}

const removeDuplicateSeedProducts = async ()=>{
  const generatedProducts = generateAssetSeedProducts();
  const allSeedProducts = [...seedProducts, ...generatedProducts];
  let duplicateCount = 0;

  for (const product of allSeedProducts) {
    const seedKey = createSeedKey(product);
    const candidates = await Product.find({
      name: product.name,
      'image.0': product.image[0],
    }).sort({ createdAt: 1 });

    if (candidates.length === 0) continue;

    const keeper = candidates.find((item) => item.seedKey === seedKey) || candidates[0];
    const duplicates = candidates.filter((item) => String(item._id) !== String(keeper._id));

    if (!keeper.seedKey) {
      await Product.updateOne({ _id: keeper._id }, {
        $set: {
          seedKey,
          isSeeded: true,
        },
      });
    }

    if (duplicates.length > 0) {
      const duplicateIds = duplicates.map((item) => item._id);
      await Product.deleteMany({ _id: { $in: duplicateIds } });
      duplicateCount += duplicateIds.length;
    }
  }

  if (duplicateCount > 0) {
    console.log(`Removed ${duplicateCount} duplicate seeded product(s)`);
  }
}

await seedInitialProducts()
await removeDuplicateSeedProducts()

console.log("hekllo")
app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`)
})