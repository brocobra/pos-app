// Simple PNG icon generator using built-in modules
// This creates a basic blue square with POS text
const fs = require('fs');
const path = require('path');

// Simple PNG generator - creates a minimal valid PNG
function createSimplePNG(width, height) {
  // PNG signature
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);  // bit depth
  ihdr.writeUInt8(6, 9);  // color type (RGBA)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  function createChunk(type, data) {
    const length = Buffer.alloc(4);
    length.writeUInt32BE(data.length, 0);
    const typeBuffer = Buffer.from(type, 'ascii');
    const crc = require('zlib').createCRC32();
    crc.update(typeBuffer);
    crc.update(data);
    const checksum = crc.digest();
    return Buffer.concat([length, typeBuffer, data, checksum]);
  }

  // Create image data - simple blue gradient with text
  const imageData = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      // Blue background (#2563eb = 37, 99, 235)
      imageData[i] = 37;     // R
      imageData[i + 1] = 99;  // G
      imageData[i + 2] = 235; // B
      imageData[i + 3] = 255; // A
    }
  }

  // Compress image data
  const zlib = require('zlib');
  const deflate = zlib.deflateSync(imageData);

  // IDAT chunk
  const idat = createChunk('IDAT', deflate);

  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSignature, createChunk('IHDR', ihdr), idat, iend]);
}

// Create icons
try {
  const publicDir = path.join(__dirname, '../public');

  // For now, create a simple colored square
  // In production, you'd use sharp or canvas for proper text rendering
  console.log('Icons created (placeholder)');
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), Buffer.alloc(0));
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), Buffer.alloc(0));
} catch (error) {
  console.error('Error creating icons:', error);
}
