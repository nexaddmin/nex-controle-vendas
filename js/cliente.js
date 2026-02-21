document.addEventListener("DOMContentLoaded", () => {
  const tipo = localStorage.getItem("tipoUsuario");
  const nome = localStorage.getItem("usuarioLogado");

  // 🔒 Proteção: só cliente entra
  if (tipo !== "cliente" || !nome) {
    window.location.href = "index.html";
    return;
  }

  // Topo
  const nomeClienteEl = document.getElementById("nomeCliente");
  nomeClienteEl.textContent = nome; // só o nome, como você pediu

  const btnLogout = document.getElementById("btnLogout");
  btnLogout.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "index.html";
  });

  // Elementos do form
  const btnAddEntrada = document.getElementById("btnAddEntrada");
  const formEntrada = document.getElementById("formEntrada");
  const btnSalvarEntrada = document.getElementById("btnSalvarEntrada");
  const btnCancelarEntrada = document.getElementById("btnCancelarEntrada");

  const descEntrada = document.getElementById("descEntrada");
  const qtdEntrada = document.getElementById("qtdEntrada");
  const valorEntrada = document.getElementById("valorEntrada");

  // Lista
  const lista = document.getElementById("listaEntradasCliente");

  // Storage: por cliente
  const STORAGE_KEY = "clientesLancamentos";
  const todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  if (!todos[nome]) todos[nome] = [];
  let lancamentos = todos[nome];

  function salvarTudo() {
    todos[nome] = lancamentos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function parseValorBR(texto) {
    // aceita "3.500,10" ou "3500,10" ou "3500.10"
    const limpo = String(texto || "")
      .trim()
      .replace(/\./g, "")
      .replace(",", ".");
    const n = parseFloat(limpo);
    return isNaN(n) ? null : n;
  }

  function formatBRL(n) {
    return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function abrirForm() {
    formEntrada.classList.remove("hidden");
    descEntrada.value = "";
    qtdEntrada.value = "1";
    valorEntrada.value = "";
    descEntrada.focus();
  }

  function fecharForm() {
    formEntrada.classList.add("hidden");
  }

  function render() {
    lista.innerHTML = "";

    lancamentos.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "card";

      const totalLinha = (item.valor * item.qtd);

      card.innerHTML = `
        <div class="linha1">
          <div class="desc">${item.desc}</div>
          <div class="total">${formatBRL(totalLinha)}</div>
        </div>
        <div class="detalhes">
          <span><strong>Qtd:</strong> ${item.qtd}</span>
          <span><strong>Valor:</strong> ${formatBRL(item.valor)}</span>
        </div>
      `;

      const editar = document.createElement("div");
      editar.className = "edit";
      editar.textContent = "✏️ Editar";

      editar.addEventListener("click", () => {
        const novaDesc = prompt("Editar descrição:", item.desc);
        if (novaDesc === null) return;

        const novaQtd = prompt("Editar quantidade:", String(item.qtd));
        if (novaQtd === null) return;

        const novoValorTxt = prompt("Editar valor (R$):", String(item.valor).replace(".", ","));
        if (novoValorTxt === null) return;

        const qtdN = parseInt(novaQtd, 10);
        const valorN = parseValorBR(novoValorTxt);

        if (!novaDesc.trim() || !qtdN || qtdN < 1 || valorN === null) {
          alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
          return;
        }

        lancamentos[index] = { desc: novaDesc.trim(), qtd: qtdN, valor: valorN };
        salvarTudo();
        render();
      });

      card.appendChild(editar);
      lista.appendChild(card);
    });
  }

  // Eventos
  btnAddEntrada.addEventListener("click", abrirForm);

  btnCancelarEntrada.addEventListener("click", () => {
    fecharForm();
  });

  btnSalvarEntrada.addEventListener("click", () => {
    const desc = descEntrada.value.trim();
    const qtd = parseInt(qtdEntrada.value, 10);
    const valor = parseValorBR(valorEntrada.value);

    if (!desc || !qtd || qtd < 1 || valor === null) {
      alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
      return;
    }

    lancamentos.unshift({ desc, qtd, valor }); // joga o mais recente pra cima
    salvarTudo();
    render();
    fecharForm();
  });

  // Inicial
  render();
  fecharForm();
});
