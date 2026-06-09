"use strict";

const registerId = document.querySelector("#register-id"),
  registerName = document.querySelector("#register-name"),
  registerPsword = document.querySelector("#register-psword"),
  registerConfirmPsword = document.querySelector("#register-confirm-psword"),
  registerBtn = document.querySelector("#register-button");

if (registerBtn) {
  registerBtn.addEventListener("click", register);
}

function register() {
  if (!registerId.value) return alert("아이디를 입력해주십시오.");
  if (!registerName.value) return alert("이름을 입력해주십시오.");
  if (registerPsword.value !== registerConfirmPsword.value)
    return alert("비밀번호가 일치하지 않습니다.");

  const req = {
    id: registerId.value,
    name: registerName.value,
    psword: registerPsword.value,
  };

  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        // 회원가입 성공 시 로그인 화면으로 애니메이션 전환 (동일 페이지에 있을 경우)
        const container = document.getElementById('container');
        if (container) {
          container.classList.remove("active");
          history.pushState(null, '', '/login');
          alert("회원가입이 완료되었습니다. 로그인해주세요.");
        } else {
          location.href = "/login";
        }
      } else {
        if (res.err) return alert(res.err);
        alert(res.msg);
      }
    })
    .catch((err) => {
      console.error("회원가입 중 에러 발생");
    });
}
