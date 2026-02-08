// js/admin.js
// Proteção da página admin

document.addEventListener("DOMContentLoaded", function () {
  const tipoUsuario = localStorage.getItem("tipoUsuario");

  if (tipoUsuario !== "admin") {
    alert("Acesso não autorizado");
    window.location.href = "index.html";
    return;
  }

  console.log("Admin autorizado e página carregada");
});
