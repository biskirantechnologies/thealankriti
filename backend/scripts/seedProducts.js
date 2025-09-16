const mongoose = require('mongoose');
const Product = require('../models/Product');

// Sample product data
const sampleProducts = [
  {
    name: "Golden Rose Ring",
    description: "Beautiful 18k gold ring with rose design, perfect for special occasions. Crafted with precision and attention to detail.",
    shortDescription: "Elegant 18k gold ring with intricate rose pattern",
    category: "rings",
    subCategory: "gold rings",
    price: 25000,
    originalPrice: 30000,
    discount: 17,
    sku: "GRR001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop",
        alt: "Golden Rose Ring - Front View",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop",
        alt: "Golden Rose Ring - Side View",
        isPrimary: false
      }
    ],
    weight: 8.5,
    material: "18K Gold",
    purity: "18K",
    gemstones: [],
    sizes: ["6", "7", "8", "9", "10"],
    inStock: true,
    stockQuantity: 15,
    featured: true,
    tags: ["gold", "ring", "rose", "elegant", "bridal"],
    metadata: {
      seoTitle: "Golden Rose Ring - 18K Gold | Ukriti Jewells",
      seoDescription: "Shop our exquisite Golden Rose Ring in 18K gold. Perfect for engagements and special occasions.",
      keywords: ["gold ring", "rose ring", "18k gold", "bridal jewelry"]
    }
  },
  {
    name: "Diamond Stud Earrings",
    description: "Classic diamond stud earrings in white gold setting. These timeless pieces feature brilliant cut diamonds.",
    shortDescription: "Classic diamond studs in white gold",
    category: "earrings",
    subCategory: "diamond earrings",
    price: 45000,
    originalPrice: 50000,
    discount: 10,
    sku: "DSE001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop",
        alt: "Diamond Stud Earrings",
        isPrimary: true
      }
    ],
    weight: 3.2,
    material: "White Gold",
    purity: "18K",
    gemstones: [
      {
        type: "Diamond",
        carat: 1.0,
        clarity: "VS1",
        color: "G",
        cut: "Round"
      }
    ],
    inStock: true,
    stockQuantity: 8,
    featured: true,
    tags: ["diamond", "earrings", "white gold", "classic", "studs"]
  },
  {
    name: "Pearl Pendant Necklace",
    description: "Elegant freshwater pearl pendant on gold chain. A perfect piece for everyday wear or special occasions.",
    shortDescription: "Freshwater pearl pendant on gold chain",
    category: "necklaces",
    subCategory: "pearl necklaces",
    price: 18000,
    originalPrice: 22000,
    discount: 18,
    sku: "PPN001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
        alt: "Pearl Pendant Necklace",
        isPrimary: true
      }
    ],
    weight: 12.5,
    material: "Gold",
    purity: "22K",
    gemstones: [
      {
        type: "Pearl",
        size: "8mm",
        origin: "Freshwater"
      }
    ],
    inStock: true,
    stockQuantity: 12,
    featured: true,
    tags: ["pearl", "necklace", "pendant", "gold", "elegant"]
  },
  {
    name: "Silver Charm Bracelet",
    description: "Beautiful sterling silver charm bracelet with multiple decorative charms. Adjustable length for perfect fit.",
    shortDescription: "Sterling silver bracelet with charms",
    category: "bracelets",
    subCategory: "silver bracelets",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    sku: "SCB001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&h=500&fit=crop",
        alt: "Silver Charm Bracelet",
        isPrimary: true
      }
    ],
    weight: 25.0,
    material: "Sterling Silver",
    purity: "925",
    gemstones: [],
    sizes: ["Small", "Medium", "Large"],
    inStock: true,
    stockQuantity: 20,
    featured: false,
    tags: ["silver", "bracelet", "charm", "adjustable"]
  },
  {
    name: "Emerald Drop Earrings",
    description: "Stunning emerald drop earrings set in gold. These elegant pieces feature natural emeralds with excellent clarity.",
    shortDescription: "Natural emerald drops in gold setting",
    category: "earrings",
    subCategory: "gemstone earrings",
    price: 65000,
    originalPrice: 75000,
    discount: 13,
    sku: "EDE001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500&h=500&fit=crop",
        alt: "Emerald Drop Earrings",
        isPrimary: true
      }
    ],
    weight: 6.8,
    material: "Gold",
    purity: "18K",
    gemstones: [
      {
        type: "Emerald",
        carat: 2.5,
        clarity: "VS",
        origin: "Colombian"
      }
    ],
    inStock: true,
    stockQuantity: 5,
    featured: true,
    tags: ["emerald", "earrings", "gold", "drop", "gemstone"]
  },
  {
    name: "Gold Chain Necklace",
    description: "Classic gold chain necklace, perfect for layering or wearing alone. Available in multiple lengths.",
    shortDescription: "Classic gold chain for everyday wear",
    category: "chains",
    subCategory: "gold chains",
    price: 35000,
    originalPrice: 38000,
    discount: 8,
    sku: "GCN001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop",
        alt: "Gold Chain Necklace",
        isPrimary: true
      }
    ],
    weight: 15.2,
    material: "Gold",
    purity: "22K",
    gemstones: [],
    sizes: ["16 inches", "18 inches", "20 inches", "22 inches"],
    inStock: true,
    stockQuantity: 25,
    featured: false,
    tags: ["gold", "chain", "necklace", "classic", "layering"]
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ukriti-jewells');
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} sample products`);

    console.log('Sample products created successfully:');
    createdProducts.forEach(product => {
      console.log(`- ${product.name} (${product.sku}) - ₹${product.price.toLocaleString()}`);
    });

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, sampleProducts };
