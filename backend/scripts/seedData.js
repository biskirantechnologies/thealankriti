require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ukriti_jewells');
    console.log('📊 MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

const sampleProducts = [
  {
    name: "Eternal Elegance Diamond Ring",
    description: "A stunning solitaire diamond ring featuring a brilliant-cut diamond set in 18k white gold. Perfect for engagements and special occasions.",
    shortDescription: "Brilliant-cut diamond solitaire ring in 18k white gold",
    category: "rings",
    subCategory: "engagement",
    price: 85000,
    originalPrice: 95000,
    discount: 10,
    sku: "ER001",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop",
        alt: "Diamond engagement ring",
        isPrimary: true
      },
      {
        url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=500&h=500&fit=crop",
        alt: "Ring side view",
        isPrimary: false
      }
    ],
    specifications: {
      metal: "white-gold",
      purity: "18k",
      gemstone: "diamond",
      weight: { value: 3.5, unit: "grams" },
      dimensions: { length: 15, width: 8, height: 6, unit: "mm" }
    },
    stock: { quantity: 15, lowStockThreshold: 5 },
    tags: ["engagement", "diamond", "luxury", "bridal"],
    featured: true,
    trending: true,
    seoTitle: "Eternal Elegance Diamond Ring - Ukriti Jewells",
    seoDescription: "Shop our stunning diamond engagement ring collection",
    seoKeywords: ["diamond ring", "engagement ring", "white gold", "solitaire"]
  },
  {
    name: "Royal Emerald Necklace Set",
    description: "An exquisite necklace set featuring natural emeralds and diamonds set in 22k gold. Includes matching earrings.",
    shortDescription: "Emerald and diamond necklace set in 22k gold",
    category: "necklaces",
    subCategory: "sets",
    price: 125000,
    originalPrice: 140000,
    discount: 11,
    sku: "RN002",
    images: [
      {
        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop",
        alt: "Emerald necklace set",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "gold",
      purity: "22k",
      gemstone: "emerald",
      weight: { value: 45, unit: "grams" },
      dimensions: { length: 400, width: 25, height: 8, unit: "mm" }
    },
    stock: { quantity: 8, lowStockThreshold: 3 },
    tags: ["emerald", "necklace", "set", "traditional", "luxury"],
    featured: true,
    trending: false
  },
  {
    name: "Classic Pearl Drop Earrings",
    description: "Timeless pearl drop earrings featuring lustrous freshwater pearls set in sterling silver with diamond accents.",
    shortDescription: "Pearl drop earrings in sterling silver",
    category: "earrings",
    subCategory: "drop",
    price: 12500,
    originalPrice: 15000,
    discount: 17,
    sku: "PE003",
    images: [
      {
        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop",
        alt: "Pearl drop earrings",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "silver",
      purity: "925-silver",
      gemstone: "pearl",
      weight: { value: 6, unit: "grams" },
      dimensions: { length: 25, width: 8, height: 8, unit: "mm" }
    },
    stock: { quantity: 25, lowStockThreshold: 10 },
    tags: ["pearl", "earrings", "silver", "classic", "elegant"],
    featured: false,
    trending: true
  },
  {
    name: "Infinity Love Bracelet",
    description: "A delicate rose gold bracelet featuring an infinity symbol adorned with sparkling diamonds.",
    shortDescription: "Diamond infinity bracelet in rose gold",
    category: "bracelets",
    subCategory: "charm",
    price: 35000,
    originalPrice: 38000,
    discount: 8,
    sku: "IB004",
    images: [
      {
        url: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500&h=500&fit=crop",
        alt: "Infinity bracelet",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "rose-gold",
      purity: "18k",
      gemstone: "diamond",
      weight: { value: 8, unit: "grams" },
      dimensions: { length: 180, width: 5, height: 2, unit: "mm" }
    },
    stock: { quantity: 20, lowStockThreshold: 8 },
    tags: ["infinity", "bracelet", "rose-gold", "diamond", "love"],
    featured: false,
    trending: true
  },
  {
    name: "Sapphire Halo Pendant",
    description: "A captivating blue sapphire pendant surrounded by a halo of diamonds, set in white gold chain.",
    shortDescription: "Sapphire and diamond halo pendant",
    category: "pendants",
    subCategory: "halo",
    price: 55000,
    originalPrice: 62000,
    discount: 11,
    sku: "SP005",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=500&h=500&fit=crop",
        alt: "Sapphire pendant",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "white-gold",
      purity: "18k",
      gemstone: "sapphire",
      weight: { value: 12, unit: "grams" },
      dimensions: { length: 15, width: 12, height: 6, unit: "mm" }
    },
    stock: { quantity: 12, lowStockThreshold: 5 },
    tags: ["sapphire", "pendant", "halo", "white-gold", "blue"],
    featured: true,
    trending: false
  },
  {
    name: "Traditional Kundan Set",
    description: "An elaborate traditional kundan jewelry set featuring intricate work and colored stones. Perfect for weddings and festivals.",
    shortDescription: "Traditional kundan jewelry set",
    category: "sets",
    subCategory: "traditional",
    price: 95000,
    originalPrice: 110000,
    discount: 14,
    sku: "KS006",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=500&h=500&fit=crop",
        alt: "Kundan jewelry set",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "gold",
      purity: "22k",
      gemstone: "none",
      weight: { value: 65, unit: "grams" },
      dimensions: { length: 350, width: 30, height: 10, unit: "mm" }
    },
    stock: { quantity: 6, lowStockThreshold: 2 },
    tags: ["kundan", "traditional", "wedding", "festival", "gold"],
    featured: true,
    trending: true
  },
  {
    name: "Modern Geometric Earrings",
    description: "Contemporary geometric earrings in brushed gold with clean lines and modern appeal.",
    shortDescription: "Modern geometric gold earrings",
    category: "earrings",
    subCategory: "modern",
    price: 18500,
    originalPrice: 22000,
    discount: 16,
    sku: "GE007",
    images: [
      {
        url: "https://images.unsplash.com/photo-1634149603310-5d3a03ab9e21?w=500&h=500&fit=crop",
        alt: "Geometric earrings",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "gold",
      purity: "18k",
      gemstone: "none",
      weight: { value: 5, unit: "grams" },
      dimensions: { length: 20, width: 15, height: 3, unit: "mm" }
    },
    stock: { quantity: 18, lowStockThreshold: 7 },
    tags: ["geometric", "modern", "contemporary", "gold", "minimalist"],
    featured: false,
    trending: true
  },
  {
    name: "Vintage Ruby Ring",
    description: "A vintage-inspired ruby ring with intricate filigree work in yellow gold, featuring a center ruby with diamond accents.",
    shortDescription: "Vintage ruby ring with filigree work",
    category: "rings",
    subCategory: "vintage",
    price: 72000,
    originalPrice: 80000,
    discount: 10,
    sku: "VR008",
    images: [
      {
        url: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=500&h=500&fit=crop",
        alt: "Vintage ruby ring",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "gold",
      purity: "18k",
      gemstone: "ruby",
      weight: { value: 7, unit: "grams" },
      dimensions: { length: 18, width: 12, height: 8, unit: "mm" }
    },
    stock: { quantity: 10, lowStockThreshold: 4 },
    tags: ["ruby", "vintage", "filigree", "yellow-gold", "antique"],
    featured: false,
    trending: false
  },
  {
    name: "Tennis Diamond Bracelet",
    description: "A classic tennis bracelet featuring a continuous line of brilliant-cut diamonds in white gold setting.",
    shortDescription: "Diamond tennis bracelet in white gold",
    category: "bracelets",
    subCategory: "tennis",
    price: 150000,
    originalPrice: 165000,
    discount: 9,
    sku: "TB009",
    images: [
      {
        url: "https://images.unsplash.com/photo-1505504604503-d8460f7a3286?w=500&h=500&fit=crop",
        alt: "Diamond tennis bracelet",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "white-gold",
      purity: "18k",
      gemstone: "diamond",
      weight: { value: 15, unit: "grams" },
      dimensions: { length: 185, width: 4, height: 2, unit: "mm" }
    },
    stock: { quantity: 5, lowStockThreshold: 2 },
    tags: ["tennis", "diamond", "bracelet", "white-gold", "luxury"],
    featured: true,
    trending: false
  },
  {
    name: "Bohemian Turquoise Necklace",
    description: "A bohemian-style necklace featuring natural turquoise stones and silver beads on an adjustable chain.",
    shortDescription: "Bohemian turquoise and silver necklace",
    category: "necklaces",
    subCategory: "bohemian",
    price: 8500,
    originalPrice: 10000,
    discount: 15,
    sku: "BN010",
    images: [
      {
        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=500&fit=crop",
        alt: "Turquoise necklace",
        isPrimary: true
      }
    ],
    specifications: {
      metal: "silver",
      purity: "925-silver",
      gemstone: "none",
      weight: { value: 25, unit: "grams" },
      dimensions: { length: 450, width: 12, height: 5, unit: "mm" }
    },
    stock: { quantity: 30, lowStockThreshold: 12 },
    tags: ["bohemian", "turquoise", "silver", "casual", "natural"],
    featured: false,
    trending: true
  }
];

const createAdminUser = async () => {
  try {
    const adminEmail = 'bewithu.aj@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminUser = new User({
        email: adminEmail,
        password: 'admin123',
        firstName: 'Ukriti',
        lastName: 'Admin',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

const seedProducts = async () => {
  try {
    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing products');

    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`✅ Inserted ${sampleProducts.length} sample products`);

    // Update averageRating for some products (simulate reviews)
    const updates = [
      { sku: 'ER001', averageRating: 4.8, totalReviews: 24 },
      { sku: 'RN002', averageRating: 4.9, totalReviews: 18 },
      { sku: 'PE003', averageRating: 4.6, totalReviews: 35 },
      { sku: 'IB004', averageRating: 4.7, totalReviews: 12 },
      { sku: 'SP005', averageRating: 4.5, totalReviews: 8 }
    ];

    for (const update of updates) {
      await Product.updateOne(
        { sku: update.sku },
        { 
          averageRating: update.averageRating,
          totalReviews: update.totalReviews
        }
      );
    }

    console.log('✅ Updated product ratings');
  } catch (error) {
    console.error('❌ Error seeding products:', error);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    await createAdminUser();
    await seedProducts();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • Admin user: ${process.env.ADMIN_EMAIL || 'admin@ukritijewells.com'}`);
    console.log(`   • Admin password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log(`   • Products seeded: ${sampleProducts.length}`);
    console.log('\n🚀 You can now start the server and test the application!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    process.exit(0);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, sampleProducts };
