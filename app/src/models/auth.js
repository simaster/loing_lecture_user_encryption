"use strict";

const jwt = require("jsonwebtoken");

const tokenKey = "access_token";
const secretKey = "secure";

const readAuth = (req) => {
  const token = req.cookies?.[tokenKey];
  if (!token) return null;

  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};

const attachUser = (req, res, next) => {
  req.user = readAuth(req);
  next();
};

const requireAuth = (req, res, next) => {
  const user = readAuth(req);
  req.user = user;

  if (!user) {
    res.clearCookie(tokenKey, { path: "/" });
    return res.redirect("/login");
  }

  next();
};

module.exports = {
  attachUser,
  requireAuth,
  tokenKey,
  secretKey,
};
