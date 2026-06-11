const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.get("/dashboard", requireLogin, (req, res) => {
    const dashboardData = {
        welcomeMessage: `Welcome, ${req.session.user.username}`,
        openTasks: 2,
        completedTasks: 1,
        openDecisions: 2,
        approvedDecisions: 1,
        userRole: req.session.user.role
    };

    res.json({
        success: true,
        message: "Dashboard data loaded successfully",
        dashboard: dashboardData
    });
});

module.exports = router;