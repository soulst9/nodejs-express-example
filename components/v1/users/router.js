const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { authorization } = require("../../../middleware/auth");

/**
 * sign in
 */
router.post("/login", controller.signin);

module.exports = router;
