const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.get("/tasks", requireLogin, (req, res) => {
    const tasks = [
        {
            id: 1,
            title: "Prepare community meeting",
            status: "open",
            assignedTo: "admin"
        },
        {
            id: 2,
            title: "Check shared garden equipment",
            status: "in progress",
            assignedTo: "admin"
        },
        {
            id: 3,
            title: "Update notice board",
            status: "done",
            assignedTo: "admin"
        }
    ];

    res.json({
        success: true,
        message: "Tasks loaded successfully",
        tasks: tasks
    });
});

module.exports = router;