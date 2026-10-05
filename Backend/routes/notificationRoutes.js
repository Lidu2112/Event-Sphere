const express = require("express");
const Notification = require("../models/Notification");

const router = express.Router();

router.get("/", async (req, res) => {
    try {

        const email = req.query.email;

        const notifications = await Notification.find({
            userEmail: email
        });

        notifications.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.json({
            success: true,
            notifications
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});

router.patch("/:id/read", async (req, res) => {

    await Notification.findByIdAndUpdate(
        req.params.id,
        {
            isRead: true
        }
    );

    res.json({
        success: true
    });

});
router.delete("/:id", async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});
module.exports = router;
