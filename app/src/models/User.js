"use strict";

const UserStorage = require("./UserStorage");
const argon2 = require("argon2");

class User {
  constructor(body) {
    this.body = body;
  }

  async login() {
    const client = this.body;
    try {
      const user = await UserStorage.getUserInfo(client.id);

      if (user) {
        if (await argon2.verify(user.psword, client.psword)) {
          return { success: true };
        }
        return { success: false, msg: "비밀번호가 틀렸습니다." };
      }
      return { success: false, msg: "존재하지 않는 아이디입니다." };
    } catch (err) {
      return { success: false, err };
    }
  }

  async register() {
    const client = this.body;
    try {
      if (!client.psword || !client.pswordConfirm) {
        return { success: false, msg: "비밀번호를 입력해주세요." };
      }
      if (client.psword !== client.pswordConfirm) {
        return { success: false, msg: "비밀번호가 일치하지 않습니다." };
      }
      client.psword = await argon2.hash(client.psword);
      const response = await UserStorage.save(client);
      return response;
    } catch (err) {
      return { success: false, err };
    }
  }
}

module.exports = User;
