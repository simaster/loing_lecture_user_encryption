"use strict";

const express = require("express");
const router = express.Router();

const auth = require("../../models/auth");
const ctrl = require("./home.ctrl");

router.get("/", auth.requireAuth, ctrl.output.home);
router.get("/login", auth.attachUser, ctrl.output.login);
router.get("/register", (req, res) => res.redirect("/login"));

router.post("/login", ctrl.process.login);
router.post("/register", ctrl.process.register);
router.post("/logout", ctrl.process.logout);

module.exports = router;
