const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const router = express.Router();

// Configure Cloudinary using environment variables from Render / .env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'eventsphere-banners', // Folder name inside your Cloudinary account
        allowed_formats: ['jpeg', 'png', 'jpg', 'webp', 'gif'],
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// POST /api/upload/banner
router.post('/banner', (req, res) => {
    upload.single('banner')(req, res, (err) => {
        // Multer error (file too large, wrong type, etc.)
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
        }
        // Any other error
        if (err) {
            return res.status(500).json({ success: false, message: err.message || 'Upload failed' });
        }
        // No file in request
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file received. Make sure the field name is "banner".' });
        }
        
        // req.file.path returns the secure, permanent Cloudinary HTTPS URL automatically
        const url = req.file.path;
        res.json({ success: true, url });
    });
});

module.exports = router;