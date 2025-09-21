const fs = require('fs');
const path = require('path');

const cleanTestImageFiles = () => {
  try {
    const uploadsDir = path.join(__dirname, '../uploads/products');
    
    console.log('🔄 Checking uploads directory:', uploadsDir);

    if (!fs.existsSync(uploadsDir)) {
      console.log('📁 Uploads directory does not exist');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    console.log(`📋 Found ${files.length} files in uploads directory`);

    const testImageFiles = files.filter(file => {
      // Check if it's the test image we saw in the database
      return file.includes('product-1756915898917-768217433') || 
             file.toLowerCase().includes('test');
    });

    if (testImageFiles.length === 0) {
      console.log('✅ No test image files found');
      return;
    }

    console.log(`\n🗂️ Test image files found:`);
    testImageFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    console.log('\n🗑️ Removing test image files...');
    
    testImageFiles.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`  ✅ Deleted: ${file}`);
      } catch (error) {
        console.log(`  ❌ Failed to delete ${file}:`, error.message);
      }
    });

    // Show remaining files
    const remainingFiles = fs.readdirSync(uploadsDir);
    console.log(`\n📊 Remaining files in uploads: ${remainingFiles.length}`);
    
    if (remainingFiles.length > 0) {
      console.log('📁 Remaining files:');
      remainingFiles.forEach((file, index) => {
        console.log(`  ${index + 1}. ${file}`);
      });
    }

  } catch (error) {
    console.error('❌ Error cleaning test image files:', error);
  }
};

// Run the cleanup
cleanTestImageFiles();