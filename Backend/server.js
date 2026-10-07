require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");

const { initializeDatabase } = require("./config/database");

// ===============================
// Routes
// ===============================

const attendeeRoutes = require("./routes/attendee");
const organizerRoutes = require("./routes/organizer");
const eventsRoutes = require("./routes/events");
const uploadRoutes = require("./routes/upload");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const paymentRoutes = require("./routes/payment");
const staffRoutes = require("./routes/staff");
const vendorRoutes = require("./routes/vendor");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// ===============================
// Security
// ===============================

app.use(
    helmet({
        crossOriginResourcePolicy: false
    })
);

// ===============================
// Compression
// ===============================

app.use(compression());

// ===============================
// CORS
// ===============================

const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without origin
            // such as Postman/server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("❌ CORS blocked:", origin);

            return callback(
                new Error("Not allowed by CORS")
            );
        },

        credentials: true
    })
);

// ===============================
// Body parser
// ===============================

app.use(
    express.json({
        limit: "2mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "2mb"
    })
);

// ===============================
// Static uploads
// ===============================

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads"),
        {
            maxAge: "7d",
            etag: true
        }
    )
);

// ===============================
// Routes
// ===============================

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/upload",
    uploadRoutes
);

app.use(
    "/api/attendee",
    attendeeRoutes
);

app.use(
    "/api/organizer",
    organizerRoutes
);

app.use(
    "/api/events",
    eventsRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/payment",
    paymentRoutes
);

app.use(
    "/api/staff",
    staffRoutes
);

app.use(
    "/api/vendor",
    (req, res, next) => {
        console.log(
            "🔥 Vendor route:",
            req.method,
            req.originalUrl
        );

        next();
    }
);

app.use(
    "/api/vendor",
    vendorRoutes
);

// ===============================
// Health check
// ===============================

app.get("/", (req, res) => {
    res.status(200).send(
        "Backend is working!"
    );
});

app.get("/api/test", async (req, res) => {

    try {

        await initializeDatabase();

        res.status(200).json({
            success: true,
            message: "Connected!",
            database: "MySQL"
        });

    } catch (error) {

        console.error(
            "❌ Database test error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Database connection failed",
            error: error.message
        });
    }
});

// ===============================
// Database middleware
// ===============================

app.use(async (req, res, next) => {

    if (!req.path.startsWith("/api")) {
        return next();
    }

    try {

        await initializeDatabase();

        next();

    } catch (error) {

        console.error(
            "❌ Database unavailable:",
            error.message
        );

        res.status(503).json({
            success: false,
            message: "Database is unavailable",
            error: error.message
        });
    }
});

// ===============================
// Global error handler
// ===============================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Server error:",
            err
        );

        res.status(
            err.status || 500
        ).json({
            success: false,
            message:
                err.message ||
                "Internal server error"
        });
    }
);

// ===============================
// Local server
// ===============================

const PORT =
    process.env.PORT || 5000;
initializeDatabase()
    .then(() => {
        console.log("✅ MySQL database connected");
    })
   .catch((error) => {
    console.error("❌ MySQL database connection failed:");
    console.error(error);
});
if (require.main === module) {

    app.listen(PORT, () => {

        console.log(
            `🚀 Server running on port ${PORT}`
        );

    });
}

// ===============================
// Vercel export
// ===============================

module.exports = app;