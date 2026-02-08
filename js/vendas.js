// js/cliente.js

const tipo = localStorage.getItem("tipoUsuario");

if (tipo !== "cliente") {
  alert("Acesso não autorizado");
  window.location.href = "index.html";
} else {
  console.log("Cliente autorizado");
}
