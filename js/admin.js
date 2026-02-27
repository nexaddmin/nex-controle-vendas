document.addEventListener("DOMContentLoaded", () => {

  const tipo = localStorage.getItem("tipoUsuario");
  const usuario = localStorage.getItem("usuarioLogado");

  // 🔒 PROTEÇÃO ADMIN
  if (tipo !== "admin" || usuario !== "admin") {
    window.location.href = "index.html";
    return;
  }

  // 🔴 LOGOUT
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
    });
  }
  
  /* ===== SEÇÕES ===== */
  const clientesSection = document.getElementById("clientesSection");
  const entradasSection = document.getElementById("entradasSection");

  const btnEntradas = document.getElementById("btnEntradas");
  const btnClientes = document.getElementById("btnClientes");

  const btnSaidas = document.getElementById("btnSaidas");
  const saidasSection = document.getElementById("saidasSection");
  
  /* ===== CLIENTES ===== */
  const listaClientes = document.getElementById("listaClientes");

  const clientes = [
    { nome: "Cinza" },
    { nome: "Marrom" },
    { nome: "Vermelho" },
    { nome: "Verde" },
    { nome: "Laranja" },
    { nome: "Branco" }
  ];

  function carregarClientes() {
    listaClientes.innerHTML = "";

    clientes.forEach(cliente => {
      const div = document.createElement("div");
      div.className = "card";
     div.textContent = cliente.nome;

div.addEventListener("click", () => {
  window.location.href =
    "cliente-admin.html?nome=" + encodeURIComponent(cliente.nome);
});
      listaClientes.appendChild(div);
    });
  }

  /* ===== ENTRADAS MENSAIS (CNPJ) ===== */

  const btnAddMes = document.getElementById("btnAddMes");
  const listaEntradasMensais = document.getElementById("listaEntradasMensais");

  let entradasMensais = JSON.parse(localStorage.getItem("entradasCNPJ")) || [];

  function salvarEntradas() {
    localStorage.setItem("entradasCNPJ", JSON.stringify(entradasMensais));
  }

function renderEntradas() {
  listaEntradasMensais.innerHTML = "";

  const totalEl = document.getElementById("totalEntradasCNPJ");
  const totalGeral = entradasMensais.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);
   if (totalEl) {
    totalEl.textContent = "Total: " + totalGeral.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }
  
  entradasMensais.forEach((item, index) => {

    const card = document.createElement("div");
    card.className = "card";

    const titulo = document.createElement("div");
    titulo.textContent = item.mes;

    const valor = document.createElement("div");
    valor.textContent = item.valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    // ===== EDITAR =====
    const editar = document.createElement("div");
    editar.className = "edit";
    editar.textContent = "✏️ Editar";

    editar.addEventListener("click", () => {
      const novoMes = prompt("Editar nome do mês:", item.mes);
      const novoValor = prompt("Editar valor:", item.valor);

      if (novoMes !== null && novoValor !== null) {
        entradasMensais[index] = {
          mes: novoMes,
          valor: parseFloat(
            novoValor.replace(/\./g, '').replace(',', '.')
          )
        };

        salvarEntradas();
        renderEntradas();
      }
    });

    // ===== DELETE =====
    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      const confirmar = confirm("Tem certeza que deseja excluir?");
      if (!confirmar) return;

      entradasMensais.splice(index, 1);
      salvarEntradas();
      renderEntradas();
    });

    acoes.appendChild(editar);
    acoes.appendChild(deletar);

    card.appendChild(titulo);
    card.appendChild(valor);
    card.appendChild(acoes);

    listaEntradasMensais.appendChild(card);
  });
}
    btnAddMes.addEventListener("click", () => {

    const mes = prompt("Nome do mês (Ex: Janeiro / 2026)");
    const valor = prompt("Valor total do mês:");

  if (mes && valor) {
    entradasMensais.push({
      mes: mes,
      valor: parseFloat(
        valor.replace(/\./g, '').replace(',', '.')
      )
    });

    salvarEntradas();
    renderEntradas();
  }
});

  renderEntradas();

    /*  == NAVEGAÇÃO ==  */
function esconderTudo() {
  clientesSection.classList.add("hidden");
  entradasSection.classList.add("hidden");
  saidasSection.classList.add("hidden");
}

// Mostrar Entradas
btnEntradas.addEventListener("click", () => {
  esconderTudo();
  entradasSection.classList.remove("hidden");
});

// Mostrar Clientes
btnClientes.addEventListener("click", () => {
  esconderTudo();
  clientesSection.classList.remove("hidden");
});

// Mostrar Saídas
btnSaidas.addEventListener("click", () => {
  esconderTudo();
  saidasSection.classList.remove("hidden");
});

      /* ===== SAÍDAS (EMPRESA) ===== */

const btnAddSaida = document.getElementById("btnAddSaida");
const listaSaidas = document.getElementById("listaSaidas");

let saidas = JSON.parse(localStorage.getItem("saidasEmpresa")) || [];

function salvarSaidas() {
  localStorage.setItem("saidasEmpresa", JSON.stringify(saidas));
}

function parseValorBR(texto) {
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

function renderSaidas() {
  if (!listaSaidas) return;
  listaSaidas.innerHTML = "";

  saidas.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";

    const titulo = document.createElement("div");
    titulo.style.fontWeight = "900";
    titulo.textContent = item.desc || "Saída";

    const valor = document.createElement("div");
    valor.style.marginTop = "6px";
    valor.style.fontWeight = "900";
    valor.style.color = "#0d5884";
    valor.textContent = formatBRL(item.valor);

    const data = document.createElement("div");
    data.style.marginTop = "8px";
    data.style.fontSize = "13px";
    data.style.opacity = "0.8";
    data.textContent = item.criadoEm
      ? new Date(item.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      : "";

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const editar = document.createElement("div");
    editar.className = "edit";
    editar.textContent = "✏️ Editar";

    editar.addEventListener("click", () => {
      const novaDesc = prompt("Editar descrição:", item.desc || "");
      if (novaDesc === null) return;

      const novoValorTxt = prompt("Editar valor (R$):", String(item.valor).replace(".", ","));
      if (novoValorTxt === null) return;

      const valorN = parseValorBR(novoValorTxt);
      if (!novaDesc.trim() || valorN === null) {
        alert("Preencha corretamente (descrição e valor válido).");
        return;
      }

      saidas[index] = { ...item, desc: novaDesc.trim(), valor: valorN };
      salvarSaidas();
      renderSaidas();
    });

    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      if (!confirm("Excluir saída?")) return;
      saidas.splice(index, 1);
      salvarSaidas();
      renderSaidas();
    });

    acoes.appendChild(editar);
    acoes.appendChild(deletar);

    card.appendChild(titulo);
    card.appendChild(valor);
    if (data.textContent) card.appendChild(data);
    card.appendChild(acoes);

    listaSaidas.appendChild(card);
  });
}

if (btnAddSaida) {
  btnAddSaida.addEventListener("click", () => {
    const desc = prompt("Descrição da saída (ex: Internet, Fornecedor, Anúncios)");
    if (desc === null) return;

    const valorTxt = prompt("Valor (R$):");
    if (valorTxt === null) return;

    const valorN = parseValorBR(valorTxt);
    if (!desc.trim() || valorN === null) {
      alert("Preencha corretamente (descrição e valor válido).");
      return;
    }

    saidas.unshift({
      desc: desc.trim(),
      valor: valorN,
      criadoEm: new Date().toISOString()
    });

    salvarSaidas();
    renderSaidas();
  });
}
  
  /* ===== INICIAL ===== */

  carregarClientes();
  renderEntradas();
  renderSaidas();
});
