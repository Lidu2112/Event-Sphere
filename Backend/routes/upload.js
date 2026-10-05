const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists at startup
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        cb(null, `banner_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
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
        const url = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({ success: true, url });
    });
});

module.exports = router;
