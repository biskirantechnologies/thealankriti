const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

// Configuration
const PRODUCTION_API_URL = 'https://thealankriti-backendd.onrender.com';
const LOCAL_UPLOADS_DIR = path.join(__dirname, 'uploads', 'products');

// Admin credentials for authentication
const ADMIN_EMAIL = 'bewithu.aj@gmail.com';
const ADMIN_PASSWORD = 'admin123';

let authToken = null;

// Function to login and get auth token
async function loginAdmin() {
  try {
    console.log('🔐 Logging in as admin...');
    const response = await axios.post(`${PRODUCTION_API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Admin login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data?.message || error.message);
    throw error;
  }
}

// Function to upload a single image file
async function uploadImageFile(filename, filePath) {
  try {
    const form = new FormData();
    const fileStream = fs.createReadStream(filePath);
    
    form.append('image', fileStream, {
      filename: filename,
      contentType: filename.endsWith('.png') ? 'image/png' : 'image/jpeg'
    });

    console.log(`📤 Uploading ${filename}...`);
    
    const response = await axios.post(
      `${PRODUCTION_API_URL}/api/admin/upload-existing-image`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          'Authorization': `Bearer ${authToken}`
        },
        maxContentLength: 10 * 1024 * 1024, // 10MB
        maxBodyLength: 10 * 1024 * 1024
      }
    );

    console.log(`✅ ${filename} uploaded successfully`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to upload ${filename}:`, error.response?.data?.message || error.message);
    throw error;
  }
}

// Main function to upload all existing images
async function uploadAllExistingImages() {
  try {
    console.log('🚀 Starting upload of existing images to production...\n');
    
    // Login first
    await loginAdmin();
    
    // Get list of image files
    const imageFiles = fs.readdirSync(LOCAL_UPLOADS_DIR)
      .filter(file => file.match(/\.(png|jpg|jpeg)$/i));
    
    console.log(`📋 Found ${imageFiles.length} image files to upload:\n`);
    imageFiles.forEach(file => console.log(`  - ${file}`));
    console.log('');
    
    // Upload each image
    let successCount = 0;
    let failCount = 0;
    
    for (const filename of imageFiles) {
      try {
        const filePath = path.join(LOCAL_UPLOADS_DIR, filename);
        await uploadImageFile(filename, filePath);
        successCount++;
      } catch (error) {
        failCount++;
        console.error(`Failed to upload ${filename}`);
      }
    }
    
    console.log('\n🎉 Upload process completed!');
    console.log(`✅ Successfully uploaded: ${successCount} files`);
    console.log(`❌ Failed uploads: ${failCount} files`);
    
    if (successCount > 0) {
      console.log('\n🔗 Testing image access...');
      // Test a few uploaded images
      const testFile = imageFiles[0];
      if (testFile) {
        const testUrl = `${PRODUCTION_API_URL}/uploads/products/${testFile}`;
        try {
          const testResponse = await axios.head(testUrl);
          console.log(`✅ Test image accessible: ${testUrl}`);
        } catch (error) {
          console.log(`❌ Test image not accessible: ${testUrl}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Upload process failed:', error.message);
    process.exit(1);
  }
}

// Check if this is run directly
if (require.main === module) {
  uploadAllExistingImages();
}

module.exports = { uploadAllExistingImages };