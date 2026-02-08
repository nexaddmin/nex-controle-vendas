// js/auth.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    // LOGIN ADMIN
    if (usuario === "admin" && senha === "1234") {
      localStorage.setItem("usuarioLogado", "admin");
      localStorage.setItem("tipoUsuario", "admin");
      window.location.href = "admin.html";
      return;
    }

    // LOGIN CLIENTE
    if (usuario === "cliente" && senha === "1234") {
      localStorage.setItem("usuarioLogado", "cliente");
      localStorage.setItem("tipoUsuario", "cliente");
      window.location.href = "cliente.html";
      return;
    }

    alert("Usuário ou senha inválidos");
  });
});
