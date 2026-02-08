// js/admin.js

document.addEventListener("DOMContentLoaded", function () {
  const tipo = localStorage.getItem("tipoUsuario");

  if (tipo !== "admin") {
    alert("Acesso não autorizado");
    window.location.href = "index.html";
    return;
  }

  const clientes = [
    "cinza",
    "marrom",
    "vermelho",
    "verde",
    "laranja",
    "branco"
  ];

  const lista = document.getElementById("listaClientes");

  clientes.forEach(cliente => {
    const li = document.createElement("li");
    li.textContent = cliente;
    lista.appendChild(li);
  });
});
