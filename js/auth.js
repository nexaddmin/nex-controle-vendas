// js/auth.js
// Script exclusivo do login

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  // Se não existir formulário de login, não faz nada
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    // ADMIN
    if (usuario === "admin" && senha === "143103") {
      localStorage.setItem("usuarioLogado", "admin");
      localStorage.setItem("tipoUsuario", "admin");
      window.location.href = "admin.html";
      return;
    }

    // CLIENTE
    if (usuario === "cliente" && senha === "143103") {
      localStorage.setItem("usuarioLogado", "cliente");
      localStorage.setItem("tipoUsuario", "cliente");
      window.location.href = "dashboard.html";
      return;
    }

    alert("Usuário ou senha inválidos");
  });
});
