const Service = require('../models/Service');


// ===============================
// CREATE SERVICE
// ===============================
exports.createService = async (req, res) => {
    try {
        const user = req.user;
        console.log('SERVICE BODY:', req.body);
console.log('SERVICE USER:', req.user);
console.log('SERVICE FILE:', req.file);

        if (!user) {
            return res.status(401).json({
                message: 'User not authenticated'
            });
        }

        const {
            name,
            category,
            description,
            price,
            priceUnit,
            status
        } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({
                message: 'Name, category and price are required'
            });
        }

        const image = req.file
            ? `/uploads/services/${req.file.filename}`
            : '';

        const service = await Service.create({
            vendorId: user._id,
            vendorEmail: user.email,
            name,
            category,
            description: description || '',
            price: Number(price),
            priceUnit: priceUnit || 'per event',
            status: status || 'active',
            image
        });

        res.status(201).json({
            success: true,
            message: 'Service created successfully',
            service
        });

    } catch (error) {
        console.error('CREATE SERVICE ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// ===============================
// GET ALL SERVICES
// ===============================
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find({
            status: 'active'
        })
            .populate('vendorId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            services
        });

    } catch (error) {
        console.error('GET ALL SERVICES ERROR:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ===============================
// GET MY SERVICES
// ===============================
exports.getMyServices = async (req, res) => {
    try {

        console.log("===== GET MY SERVICES =====");
        console.log("REQ.USER:", req.user);

        const services = await Service.find({
            vendorId: req.user._id
        }).sort({ createdAt: -1 });

        console.log("SERVICES FOUND:", services);

        res.status(200).json({
            success: true,
            services
        });

    } catch (error) {

        console.error("GET MY SERVICES ERROR:");
        console.error(error);
        console.error(error.stack);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};