"use strict";

const loginId = document.querySelector("#login-id"),
  loginPsword = document.querySelector("#login-psword"),
  loginBtn = document.querySelector("#login-button");

if (loginBtn) {
  loginBtn.addEventListener("click", login);
}

function login() {
  if (!loginId.value) return alert("아이디를 입력해주십시오.");
  if (!loginPsword.value) return alert("비밀번호를 입력해주십시오.");

  const req = {
    id: loginId.value,
    psword: loginPsword.value,
  };

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        location.href = "/";
      } else {
        if (res.err) return alert(res.err);
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.error("로그인 중 에러 발생");
    });
}

// UI Toggle Logic from script.js
const container = document.getElementById('container');
const registerToggleBtn = document.getElementById('register-toggle');
const loginToggleBtn = document.getElementById('login-toggle');

if (registerToggleBtn && loginToggleBtn && container) {
  registerToggleBtn.addEventListener('click', () => {
      container.classList.add("active");
      history.pushState(null, '', '/register');
  });

  loginToggleBtn.addEventListener('click', () => {
      container.classList.remove("active");
      history.pushState(null, '', '/login');
  });
}
