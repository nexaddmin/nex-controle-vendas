document.addEventListener("DOMContentLoaded", () => {

  const nome = localStorage.getItem("usuarioLogado");

  if (!nome) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById("nomeCliente").textContent = "Cliente: " + nome;

  const lista = document.getElementById("listaEntradas");
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

  totalEl.textContent = "Total acumulado: " + total.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

});
