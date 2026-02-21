document.addEventListener("DOMContentLoaded", () => {

  // 👤 pegar usuário logado
  const nome = localStorage.getItem("usuarioLogado");
  const tipo = localStorage.getItem("tipoUsuario");

  // 🔴 PROTEÇÃO CLIENTE
  if (!nome || tipo !== "cliente") {
    window.location.href = "index.html";
    return;
  }

  // 🔴 LOGOUT
  const btnLogout = document.getElementById("btnLogout");

  btnLogout.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  document.getElementById("nomeCliente").textContent = "Cliente: " + nome;

  const lista = document.getElementById("listaEntradasCliente");
  const totalEl = document.getElementById("total");

  let dados = JSON.parse(localStorage.getItem("clientesEntradas")) || {};

  if (!dados[nome]) {
    dados[nome] = [];
  }

  let total = 0;

  dados[nome].forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${item.mes}</h3>
      <div>${item.valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      })}</div>
    `;

    lista.appendChild(card);
    total += item.valor;
  });

  if (totalEl) {
    totalEl.textContent = "Total acumulado: " + total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

});
