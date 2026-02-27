document.addEventListener("DOMContentLoaded", () => {
  // ✅ DEBUG: se isso não aparecer, é cache / script não carregou
  console.log("cliente-admin.js carregou ✅");

  // 🔒 proteção admin (sessão)
  const tipo = localStorage.getItem("tipoUsuario");
  const usuario = localStorage.getItem("usuarioLogado");

  if (tipo !== "admin" || usuario !== "admin") {
    alert("Acesso negado (não está logado como admin). Faça login novamente.");
    window.location.href = "index.html";
    return;
  }

  // ✅ pega o cliente pela URL: cliente-admin.html?nome=Cinza
  const params = new URLSearchParams(window.location.search);
  const nomeParam = params.get("nome");

  if (!nomeParam) {
    alert("Faltou o nome na URL (?nome=...). Abra clicando no cliente dentro do admin.");
    window.location.href = "admin.html";
    return;
  }

  const nome = nomeParam.toLowerCase().trim();
  const nomeBonito = nome.charAt(0).toUpperCase() + nome.slice(1);

  // Botões do cliente-admin.html
const btnRelatorioMensal = document.getElementById("btnRelatorioMensal");
const btnRelatorioSemanal = document.getElementById("btnRelatorioSemanal");
  
  // ✅ Topo
  const nomeTopoEl = document.getElementById("nomeClienteTopo");
  if (nomeTopoEl) nomeTopoEl.textContent = nomeBonito;

  // ✅ Lista
  const lista = document.getElementById("listaAdminCliente");
  if (!lista) {
    alert("Elemento #listaAdminCliente não encontrado no HTML.");
    return;
  }

  // ✅ Dados
  const STORAGE_KEY = "clientesEntradas";
  const todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  if (!todos[nome]) todos[nome] = [];
  let lancamentos = todos[nome];

  function salvar() {
    todos[nome] = lancamentos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function formatBRL(n) {
    return Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  
/* ===== RELATÓRIOS (salva pro Admin também) ===== */
   const REL_KEY = "relatoriosNex";

  function carregarRelatorios() {
    return JSON.parse(localStorage.getItem(REL_KEY)) || [];
  }

  function salvarRelatorios(lista) {
    localStorage.setItem(REL_KEY, JSON.stringify(lista));
  }

  function adicionarRelatorio(rel) {
    const lista = carregarRelatorios();
    lista.unshift(rel); // mais recente em cima
    salvarRelatorios(lista);
  }
  
  function render() {
    lista.innerHTML = "";

    lancamentos.forEach((item, index) => {
      const qtd = Number(item.qtd || 1);
      const valor = Number(item.valor || 0);
      const total = valor * qtd;

const card = document.createElement("div");
card.className = "card";

const dataTxt = item.criadoEm
  ? new Date(item.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
  : "";

card.innerHTML = `
  <div class="linha1">
    <div class="desc">${item.desc || "(sem descrição)"}</div>
    <div class="total">${formatBRL(total)}</div>
  </div>
  <div class="detalhes">
    ${dataTxt ? `<span><strong>Data:</strong> ${dataTxt}</span>` : ""}
    <span><strong>Qtd:</strong> ${qtd}</span>
    <span><strong>Valor:</strong> ${formatBRL(valor)}</span>
    <span><strong>Pagamento:</strong> ${item.formaPagamento || "-"}</span>
  </div>
`;
      const editar = document.createElement("div");
      editar.className = "edit";
      editar.textContent = "✏️ Editar";
      editar.addEventListener("click", () => {
        const novaDesc = prompt("Editar descrição:", item.desc || "");
        if (novaDesc === null) return;

        const novaQtdTxt = prompt("Editar quantidade:", String(qtd));
        if (novaQtdTxt === null) return;

        const novoValorTxt = prompt("Editar valor (ex: 35,90):", String(valor).replace(".", ","));
        if (novoValorTxt === null) return;

        const novaQtd = parseInt(novaQtdTxt, 10);
        const novoValor = parseFloat(String(novoValorTxt).replace(/\./g, "").replace(",", "."));
        
       const opcoes = ["Dinheiro", "Pix", "Débito", "Crédito", "Transferência"];
       const escolha = prompt(
    "Forma de pagamento:\n1) Dinheiro\n2) Pix\n3) Débito\n4) Crédito\n5) Transferência\n\nDigite 1 a 5:",
    String((opcoes.indexOf(item.formaPagamento) + 1) || 1)
  );
  if (escolha === null) return;

      const idx = parseInt(escolha, 10) - 1;
  if (idx < 0 || idx > 4) {
    alert("Escolha inválida (digite 1 a 5).");
  return;
}

const novaForma = opcoes[idx];
        
        if (!novaDesc.trim() || !novaQtd || novaQtd < 1 || isNaN(novoValor)) {
          alert("Preencha corretamente: descrição, quantidade >= 1 e valor válido.");
          return;
        }

      lancamentos[index] = {
  ...item,
  desc: novaDesc.trim(),
  qtd: novaQtd,
  valor: novoValor,
  formaPagamento: novaForma
};
        salvar();
        render();
      });

      const deletar = document.createElement("div");
      deletar.className = "delete";
      deletar.textContent = "🗑 Deletar";
      deletar.addEventListener("click", () => {
        if (!confirm("Excluir lançamento?")) return;
        lancamentos.splice(index, 1);
        salvar();
        render();
      });

      card.appendChild(editar);
      card.appendChild(deletar);
      lista.appendChild(card);
    });
  }

  /* ===== GERAR RELATÓRIOS DO CLIENTE ===== */

// Função auxiliar
function formatDia(d) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

// Semana Domingo -> Sábado
function inicioDaSemanaDomingo(data) {
  const d = new Date(data);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0 = domingo
  d.setDate(d.getDate() - dow);
  return d;
}

function fimDaSemanaSabado(data) {
  const ini = inicioDaSemanaDomingo(data);
  const fim = new Date(ini);
  fim.setDate(ini.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

// 🔹 RELATÓRIO SEMANAL
btnRelatorioSemanal?.addEventListener("click", () => {
  const hoje = new Date();
  const ini = inicioDaSemanaDomingo(hoje);
  const fim = fimDaSemanaSabado(hoje);

  let totalSemana = 0;
  let detalhes = "";

  for (let i = 0; i < 7; i++) {
    const dia = new Date(ini);
    dia.setDate(ini.getDate() + i);

    const totalDia = lancamentos.reduce((acc, it) => {
      if (!it.criadoEm) return acc;
      const d = new Date(it.criadoEm);
      if (
        d.getFullYear() === dia.getFullYear() &&
        d.getMonth() === dia.getMonth() &&
        d.getDate() === dia.getDate()
      ) {
        return acc + (Number(it.valor) || 0) * (Number(it.qtd) || 1);
      }
      return acc;
    }, 0);

    totalSemana += totalDia;
    detalhes += `${formatDia(dia)}: ${formatBRL(totalDia)}\n`;
  }

  adicionarRelatorio({
    id: Date.now().toString(),
    origem: `Cliente (${nomeBonito})`,
    tipo: "CLIENTE_SEMANAL",
    titulo: `Relatório semanal — ${nomeBonito}`,
    periodo: `${ini.toLocaleDateString("pt-BR")} a ${fim.toLocaleDateString("pt-BR")}`,
    total: totalSemana,
    detalhes,
    criadoEm: new Date().toISOString()
  });

  alert("Relatório semanal salvo ✅");
});

// 🔹 RELATÓRIO MENSAL
btnRelatorioMensal?.addEventListener("click", () => {
  const hoje = new Date();
  const mes = hoje.getMonth();
  const ano = hoje.getFullYear();

  let totalMes = 0;

  lancamentos.forEach(it => {
    if (!it.criadoEm) return;
    const d = new Date(it.criadoEm);
    if (d.getMonth() === mes && d.getFullYear() === ano) {
      totalMes += (Number(it.valor) || 0) * (Number(it.qtd) || 1);
    }
  });

  const mm = String(mes + 1).padStart(2, "0");

  adicionarRelatorio({
    id: Date.now().toString(),
    origem: `Cliente (${nomeBonito})`,
    tipo: "CLIENTE_MENSAL",
    titulo: `Relatório mensal — ${nomeBonito}`,
    periodo: `${mm}/${ano}`,
    total: totalMes,
    detalhes: `Total do mês: ${formatBRL(totalMes)}`,
    criadoEm: new Date().toISOString()
  });

  alert("Relatório mensal salvo ✅");
});
  
  render();
});

function voltarAdmin() {
  window.location.href = "admin.html";
}
