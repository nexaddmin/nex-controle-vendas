// js/cliente.js

document.addEventListener("DOMContentLoaded", function () {
  const tipo = localStorage.getItem("tipoUsuario");
  const usuario = localStorage.getItem("usuarioLogado");

  if (tipo !== "cliente") {
    alert("Acesso não autorizado");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("boasVindas").innerText =
    "Bem-vindo, cliente " + usuario;
});

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
