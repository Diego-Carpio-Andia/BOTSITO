const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");

router.post("/GuardarHistorialUsuario", userController.GuardarHistorialUsuario);

module.exports = router;
