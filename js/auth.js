// js/auth.js

document.addEventListener("DOMContentLoaded", function () {

  // 🔐 Se já estiver logado, redireciona automaticamente
  const tipo = localStorage.getItem("tipoUsuario");

  if (tipo === "admin") {
    window.location.href = "admin.html";
    return;
  }

  if (tipo === "cliente") {
    window.location.href = "cliente.html";
    return;
  }

  const form = document.getElementById("loginForm");
  if (!form) return;

  // base simples de clientes
  const clientes = {
    cinza: "1356",
    marrom: "9732",
    vermelho: "4561",
    verde: "7854",
    laranja: "3826",
    branco: "8630"
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const usuario = document.getElementById("usuario").value.toLowerCase();
    const senha = document.getElementById("senha").value;

    // ADMIN
    if (usuario === "admin" && senha === "143103") {
      localStorage.setItem("tipoUsuario", "admin");
      localStorage.setItem("usuarioLogado", "admin");
      window.location.href = "admin.html";
      return;
    }

    // CLIENTES
    if (clientes[usuario] && clientes[usuario] === senha) {
      localStorage.setItem("tipoUsuario", "cliente");
      localStorage.setItem("usuarioLogado", usuario);
      window.location.href = "cliente.html";
      return;
    }

    alert("Usuário ou senha inválidos");
  });

});
