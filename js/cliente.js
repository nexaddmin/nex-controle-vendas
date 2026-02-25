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
  localStorage.removeItem("tipoUsuario");
  localStorage.removeItem("usuarioLogado");
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
  const formaPagamentoEntrada = document.getElementById("formaPagamentoEntrada");
  
  // Lista
  const lista = document.getElementById("listaEntradasCliente");

  // Storage: por cliente
  const STORAGE_KEY = "clientesEntradas";
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
function podeEditar(criadoEm) {
  if (!criadoEm) return true; // se for antigo sem data, deixa editar
  const agora = Date.now();
  const criado = new Date(criadoEm).getTime();
  const limiteMs = 24 * 60 * 60 * 1000; // 24h
  return (agora - criado) <= limiteMs;
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
const dataTxt = item.criadoEm
  ? new Date(item.criadoEm).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    })
  : "";
      
      card.innerHTML = `
        <div class="linha1">
          <div class="desc">${item.desc}</div>
          <div class="total">${formatBRL(totalLinha)}</div>
        </div>
   <div class="detalhes">
    <span><strong>Data:</strong> ${dataTxt}</span>
    <span><strong>Qtd:</strong> ${item.qtd}</span>
    <span><strong>Valor:</strong> ${formatBRL(item.valor)}</span>
    <span><strong>Pagamento:</strong> ${item.formaPagamento || "-"}</span>
  </div>
      `;

      const editar = document.createElement("div");
editar.className = "edit";

if (!podeEditar(item.criadoEm)) {
  editar.textContent = "⛔ Prazo expirado";
  editar.style.opacity = "0.5";
  editar.style.cursor = "not-allowed";

  editar.addEventListener("click", () => {
    alert("O prazo de 24h para edição expirou.");
  });

} else {
  editar.textContent = "✏️ Editar";

  editar.addEventListener("click", () => {
    const novaDesc = prompt("Editar descrição:", item.desc);
    if (novaDesc === null) return;

    const novaQtd = prompt("Editar quantidade:", String(item.qtd));
    if (novaQtd === null) return;

    const novoValorTxt = prompt("Editar valor (R$):", String(item.valor).replace(".", ","));
    if (novoValorTxt === null) return;
    
 const opcoes = ["Dinheiro", "Pix", "Débito", "Crédito", "Transferência"];
 const escolha = prompt(
  "Forma de pagamento:\n1) Dinheiro\n2) Pix\n3) Débito\n4) Crédito\n5) Transferência\n\nDigite 1 a 5:",
  String(opcoes.indexOf(item.formaPagamento) + 1 || 1)
);
if (escolha === null) return;

const idx = parseInt(escolha, 10) - 1;
if (idx < 0 || idx > 4) {
  alert("Escolha inválida (digite 1 a 5).");
  return;
}

const novaForma = opcoes[idx];
    
    const qtdN = parseInt(novaQtd, 10);
    const valorN = parseValorBR(novoValorTxt);

    if (!novaDesc.trim() || !qtdN || qtdN < 1 || valorN === null) {
      alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
      return;
    }

    // ✅ mantém criadoEm para não “resetar” o prazo
     lancamentos[index] = {
      ...item,
      desc: novaDesc.trim(),
      qtd: qtdN,
      valor: valorN,
      formaPagamento: novaForma.trim()
};

    salvarTudo();
    render();
  });
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
    const formaPagamento = formaPagamentoEntrada.value;
    
    if (!desc || !qtd || qtd < 1 || valor === null) {
      alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
      return;
    }

    const agora = new Date().toISOString(); // data/hora automática

lancamentos.unshift({          // joga o mais recente pra cima
  desc,
  qtd,
  valor,
  formaPagamento,
  criadoEm: agora
});                                
    salvarTudo();
    render();
    fecharForm();
  });

  // Inicial
  render();
  fecharForm();
});
