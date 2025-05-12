const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create images directory if it doesn't exist
const imagesDir = path.join(uploadsDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

/**
 * Save a base64 image to the filesystem
 * @param {string} base64Image - The base64 encoded image
 * @returns {string} The path to the saved image
 */
const saveBase64Image = (base64Image) => {
  // Check if the input is a base64 image
  if (!base64Image || typeof base64Image !== 'string') {
    return null;
  }

  // Extract the image type and data
  const matches = base64Image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return null;
  }

  const imageType = matches[1];
  const imageData = matches[2];
  const buffer = Buffer.from(imageData, 'base64');

  // Generate a unique filename
  const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${imageType}`;
  const filepath = path.join(imagesDir, filename);

  // Save the image to the filesystem
  fs.writeFileSync(filepath, buffer);

  // Return the relative path to be stored in the database
  return `/uploads/images/${filename}`;
};

module.exports = {
  saveBase64Image
};
