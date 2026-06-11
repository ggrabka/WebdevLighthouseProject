const express = require("express");
const requireLogin = require("../middleware/requireLogin");

const router = express.Router();

router.get("/decisions", requireLogin, (req, res) => {
    const decisions = [
        {
            id: 1,
            title: "Should we organize a summer event?",
            status: "open",
            yesVotes: 5,
            noVotes: 1
        },
        {
            id: 2,
            title: "Approve new cleaning schedule",
            status: "approved",
            yesVotes: 8,
            noVotes: 2
        },
        {
            id: 3,
            title: "Buy new tools for shared storage room",
            status: "open",
            yesVotes: 3,
            noVotes: 0
        }
    ];

    res.json({
        success: true,
        message: "Decisions loaded successfully",
        decisions: decisions
    });
});

module.exports = router;