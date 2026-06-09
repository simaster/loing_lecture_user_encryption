"use strict";

const logger = require("../../config/logger");
const User = require("../../models/User");
const db = require("../../config/db");
const jwt = require("jsonwebtoken");

const output = {
  home: (req, res) => {
    logger.info(`GET / 304 "홈 화면으로 이동"`);
    
    db.query("SELECT * FROM data", (err, rows) => {
      if (err) {
        logger.error(`GET / 500 "데이터베이스 조회 오류: ${err.message}"`);
        return res.render("home/index", { dbData: [] });
      }
      res.render("home/index", { dbData: rows });
    });
  },

  login: (req, res) => {
    logger.info(`GET /login 304 "로그인 화면으로 이동"`);
    res.render("home/login");
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
      const access_token = jwt.sign({ id: req.body.id }, 'secure');
      res.cookie('access_token', access_token, { httpOnly: true });
    }

    const url = {
      method: "POST",
      path: "/login",
      status: response.err ? 400 : 200,
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
