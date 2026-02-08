// js/auth.js

document.getElementById("loginForm").addEventListener("submit", function (e) {
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
    window.location.href = "cliente.html";
    return;
  }

  alert("Usuário ou senha inválidos");
});
