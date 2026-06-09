"use strict";

const logger = require("../../config/logger");
const User = require("../../models/User");
const { secretKey, tokenKey } = require("../../models/auth");
const db = require("../../config/db");
const jwt = require("jsonwebtoken");

const formatLoginTime = (payload) => {
  if (!payload || !payload.iat) {
    return "-";
  }

  return new Date(payload.iat * 1000).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const buildAuthViewModel = (payload) => ({
  isLoggedIn: Boolean(payload),
  userId: payload?.id || "-",
  loginTime: formatLoginTime(payload),
});

const output = {
  home: (req, res) => {
    logger.info(`GET / 304 "대시보드 화면으로 이동"`);

    const auth = buildAuthViewModel(req.user);

    db.query("SELECT * FROM data", (err, rows) => {
      if (err) {
        logger.error(`GET / 500 "데이터베이스 조회 오류: ${err.message}"`);
        return res.render("home/index", { dbData: [], auth });
      }

      res.render("home/index", { dbData: rows, auth });
    });
  },

  login: (req, res) => {
    logger.info(`GET /login 304 "로그인 화면으로 이동"`);
    res.render("home/login", { auth: buildAuthViewModel(req.user) });
  },

  register: (req, res) => {
    logger.info(`GET /register 304 "회원가입 화면으로 이동"`);
    res.render("home/register");
  },
};

const process = {
  login: async (req, res) => {
    const user = new User(req.body);
    const response = await user.login();

    if (response.success) {
      const access_token = jwt.sign({ id: req.body.id }, secretKey);
      res.cookie(tokenKey, access_token, { httpOnly: true, path: "/" });
    }

    const url = {
      method: "POST",
      path: "/login",
      status: response.err ? 400 : response.success ? 200 : 401,
    };

    log(response, url);
    return res.status(url.status).json(response);
  },

  register: async (req, res) => {
    const user = new User(req.body);
    const response = await user.register();

    const url = {
      method: "POST",
      path: "/register",
      status: response.success ? 201 : response.err ? 409 : 400,
    };

    log(response, url);
    return res.status(url.status).json(response);
  },

  logout: async (req, res) => {
    res.clearCookie(tokenKey, { path: "/" });
    return res.json({ success: true });
  },
};

module.exports = {
  output,
  process,
};

const log = (response, url) => {
  if (response.err) {
    logger.error(
      `${url.method} ${url.path} ${url.status} Response: ${response.success} ${response.err}`
    );
  } else {
    logger.info(
      `${url.method} ${url.path} ${url.status} Response: ${response.success} ${
        response.msg || ""
      }`
    );
  }
};
