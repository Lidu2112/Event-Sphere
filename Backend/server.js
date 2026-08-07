require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");
const { initializeDatabase } = require("./config/database");

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


// ── Security headers
app.use(helmet({
    crossOriginResourcePolicy: false
}));


// ── Compression
app.use(compression());

app.use("/api/notifications", notificationRoutes);
// ── CORS
app.use(cors({
    origin: function (origin, callback) {

        if (
            !origin ||
            /^http:\/\/localhost(:\d+)?$/.test(origin)
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }

    },
    credentials: true
}));


// ── Keep alive
app.use((req, res, next) => {

    res.setHeader(
        "Connection",
        "keep-alive"
    );

    next();
});


// ── Body parser
app.use(express.json({
    limit: "2mb"
}));


// ── Static uploads folder
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
// ROUTES
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);

app.use("/api/attendee", attendeeRoutes);

app.use("/api/organizer", organizerRoutes);

app.use("/api/events", eventsRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/payment", paymentRoutes);

app.use("/api/staff", staffRoutes);
app.use("/api/vendor", (req, res, next) => {
    console.log("🔥 Vendor route hit:", req.method, req.originalUrl);
    next();
});
app.use("/api/vendor", vendorRoutes);



// ── Health check

app.get("/", (req, res) => {

    res.send(
        "Backend is working!"
    );

});


app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Connected!"
    });

});



// ── Global error handler

app.use((err, req, res, next) => {

    console.error(
        "Server error:",
        err.message
    );

    res.status(
        err.status || 500
    ).json({

        success: false,

        message:
            err.message ||
            "Internal server error"

    });

});



// ===============================
// MySQL Connection
// ===============================

let dbReady = false;
let retryTimer = null;

async function connectDB(isRetry = false) {

    try {

        await initializeDatabase();

        console.log(
            "✅ MySQL database Connected"
        );


dbReady = true;

if (retryTimer) {
    clearInterval(retryTimer);
    retryTimer = null;
}
        // ===============================
        // Auto seed entrances
        // ===============================

        const Entrance = require("./models/Entrance");


        const count =
            await Entrance.countDocuments();


        if (count === 0) {


            await Entrance.insertMany([

                {
                    name: "Main Gate",
                    status: "open"
                },

                {
                    name: "VIP Entrance",
                    status: "open"
                },

                {
                    name: "West Gate",
                    status: "open"
                },

                {
                    name: "Emergency Exit",
                    status: "closed"
                }

            ]);


            console.log(
                "✅ Seeded 4 default entrances"
            );

        }


    } catch (error) {
        dbReady = false;
        console.error(
            "❌ MySQL Connection Error:",
            error.message
        );

        if (!isRetry) {
            console.warn("⚠️ MySQL is not reachable yet. The server will keep running and retry in the background.");
        }

        if (!retryTimer) {
            retryTimer = setInterval(() => {
                connectDB(true).catch(() => {});
            }, 10000);
        }
    }

}

app.use((req, res, next) => {
    if (req.path.startsWith("/api") && !dbReady) {
        return res.status(503).json({
            success: false,
            message: "Database is unavailable right now. The server is retrying the connection."
        });
    }
    next();
});

connectDB();



// ===============================
// Server
// ===============================

const PORT =
    process.env.PORT || 5000;



const server =
    app.listen(
        PORT,
        () => {

            console.log(
                `🚀 Server running on port ${PORT}`
            );

        }
    );



// Keep alive timeout

server.keepAliveTimeout = 65000;

server.headersTimeout = 66000;