const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.join(__dirname, '..', '.env.production')
    : path.join(__dirname, '..', '.env')
});

const mongoose = require('mongoose');
const Product = require('../models/Product');

const DRY_RUN = process.argv.includes('--dry-run');

const getNormalizedUrl = (value) => {
  if (!value) return '';

  const raw = typeof value === 'string'
    ? value
    : value.url || value.path || value.image || value.src || '';

  if (typeof raw !== 'string') return '';

  const trimmed = raw.trim();
  if (!trimmed) return '';

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return '';

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
      return trimmed;
    } catch (error) {
      return '';
    }
  }

  const slashNormalized = trimmed.replace(/\\/g, '/');
  const uploadsIndex = slashNormalized.indexOf('uploads/');

  if (uploadsIndex !== -1) {
    return `/${slashNormalized.slice(uploadsIndex).replace(/^\/+/, '')}`;
  }

  const withoutLeadingSlashes = slashNormalized.replace(/^\/+/, '');

  if (withoutLeadingSlashes.startsWith('uploads/')) {
    return `/${withoutLeadingSlashes}`;
  }

  return '';
};

const normalizeMediaArray = (items, productName, type = 'image') => {
  if (!Array.isArray(items)) return [];

  const seen = new Set();
  const normalized = [];

  items.forEach((item, index) => {
    const normalizedUrl = getNormalizedUrl(item);
    if (!normalizedUrl || seen.has(normalizedUrl)) {
      return;
    }

    seen.add(normalizedUrl);

    const isObject = typeof item === 'object' && item !== null;
    const incomingPrimary = isObject ? Boolean(item.isPrimary) : false;

    if (type === 'video') {
      normalized.push({
        url: normalizedUrl,
        title: (isObject ? item.title : '') || `${productName || 'Product'} video ${normalized.length + 1}`,
        isPrimary: incomingPrimary
      });
      return;
    }

    normalized.push({
      url: normalizedUrl,
      alt: (isObject ? item.alt : '') || `${productName || 'Product'} image ${normalized.length + 1}`,
      isPrimary: incomingPrimary
    });
  });

  if (normalized.length > 0 && !normalized.some((img) => img.isPrimary)) {
    normalized[0].isPrimary = true;
  }

  return normalized;
};

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set. Check your .env/.env.production file.');
    }

    console.log(`🔄 Starting product image cleanup${DRY_RUN ? ' (dry-run)' : ''}...`);

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const products = await Product.find({}).select('_id name images videos').lean();

    let total = 0;
    let changed = 0;
    let removedInvalid = 0;
    let deduplicated = 0;

    for (const product of products) {
      total += 1;
      const originalImages = Array.isArray(product.images) ? product.images : [];
      const originalVideos = Array.isArray(product.videos) ? product.videos : [];

      const normalizedImages = normalizeMediaArray(originalImages, product.name, 'image');
      const normalizedVideos = normalizeMediaArray(originalVideos, product.name, 'video');

      const originalCount = originalImages.length + originalVideos.length;
      const normalizedCount = normalizedImages.length + normalizedVideos.length;
      const removed = Math.max(0, originalCount - normalizedCount);

      if (removed > 0) {
        removedInvalid += removed;
      }

      const uniqueOriginalUrls = new Set([
        ...originalImages.map((img) => getNormalizedUrl(img)).filter(Boolean),
        ...originalVideos.map((video) => getNormalizedUrl(video)).filter(Boolean)
      ]);

      if (uniqueOriginalUrls.size < originalCount) {
        deduplicated += (originalCount - uniqueOriginalUrls.size);
      }

      const hasChanged =
        JSON.stringify(originalImages) !== JSON.stringify(normalizedImages) ||
        JSON.stringify(originalVideos) !== JSON.stringify(normalizedVideos);
      if (!hasChanged) continue;

      changed += 1;

      if (!DRY_RUN) {
        await Product.updateOne(
          { _id: product._id },
          { $set: { images: normalizedImages, videos: normalizedVideos } }
        );
      }

      console.log(`🛠️ ${product.name} (${product._id}) :: media ${originalCount} -> ${normalizedCount} items`);
    }

    console.log('\n✅ Product media cleanup summary');
    console.log(`- Products scanned: ${total}`);
    console.log(`- Products updated: ${changed}`);
    console.log(`- Invalid/empty media entries removed: ${removedInvalid}`);
    console.log(`- Duplicate media entries removed: ${deduplicated}`);
    console.log(`- Mode: ${DRY_RUN ? 'DRY RUN (no DB writes)' : 'LIVE UPDATE'}`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

run();
