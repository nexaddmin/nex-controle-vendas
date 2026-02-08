// js/auth.js

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Formulário de login não encontrado");
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "admin" && senha === "143103") {
      localStorage.setItem("usuarioLogado", "admin");
      localStorage.setItem("tipoUsuario", "admin");
      window.location.href = "admin.html";
      return;
    }

    if (usuario === "cliente" && senha === "143103") {
      localStorage.setItem("usuarioLogado", "cliente");
      localStorage.setItem("tipoUsuario", "cliente");
      window.location.href = "cliente.html";
      return;
    }

    alert("Usuário ou senha inválidos");
  });
});
