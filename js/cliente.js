document.addEventListener("DOMContentLoaded", () => {

  // 🔐 PEGAR DADOS DA SESSÃO
  const tipo = localStorage.getItem("tipoUsuario");
  const nome = localStorage.getItem("usuarioLogado");

  // 🔒 BLOQUEIO TOTAL (só cliente entra)
  if (tipo !== "cliente" || !nome) {
    window.location.href = "index.html";
    return;
  }

  // 👤 MOSTRAR NOME
  const nomeClienteEl = document.getElementById("nomeCliente");
  if (nomeClienteEl) {
    nomeClienteEl.textContent = "Cliente: " + nome;
  }

  // 🚪 LOGOUT
  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }

  // 📦 PEGAR TODOS OS DADOS
  const todosDados = JSON.parse(localStorage.getItem("clientesEntradas")) || {};

  // 🧱 CRIAR ESTRUTURA SE NÃO EXISTIR
  if (!todosDados[nome]) {
    todosDados[nome] = [];
  }

  const dadosDoCliente = todosDados[nome];

  const lista = document.getElementById("listaEntradasCliente");

  let total = 0;

  // 📊 RENDER DAS ENTRADAS
  dadosDoCliente.forEach(item => {

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

});
