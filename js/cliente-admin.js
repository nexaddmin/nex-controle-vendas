document.addEventListener("DOMContentLoaded", async function () {
  const {
    data: { session },
    error: sessionError
  } = await window.supabaseClient.auth.getSession();

  if (sessionError || !session || !session.user) {
    window.location.href = "index.html";
    return;
  }

  const user = session.user;

  const { data: profile, error: profileError } = await window.supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    alert("Acesso negado");
    window.location.href = "index.html";
    return;
  }

  console.log("cliente-admin autorizado");
  
  console.log("entrou na página do cliente-admin");
  
    window.voltarAdmin = function () {
    window.location.href = "admin.html";
  };
  
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
  console.log("cliente aberto:", nome);

  const { data: clienteAtual, error: clienteAtualError } = await window.supabaseClient
  .from("clientes")
  .select("id, nome_empresa")
  .ilike("nome_empresa", nomeParam.trim())
  .single();

if (clienteAtualError || !clienteAtual) {
  alert("Cliente não encontrado no banco.");
  console.error("Erro ao buscar cliente:", clienteAtualError);
  window.location.href = "admin.html";
  return;
}

const clienteId = clienteAtual.id;
  
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
let lancamentos = [];

async function carregarLancamentos() {
  const { data, error } = await window.supabaseClient
    .from("entradas_clientes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar lançamentos:", error);
    alert("Erro ao carregar lançamentos do banco.");
    lancamentos = [];
    return;
  }

  lancamentos = data || [];
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

  lancamentos.forEach((item) => {
    const meta = item.observacoes ? JSON.parse(item.observacoes || "{}") : {};
    const qtd = Number(meta.qtd || 1);
    const valor = Number(item.valor || 0);
    const total = valor * qtd;
    const formaPagamento = item.categoria || "-";

    const card = document.createElement("div");
    card.className = "card";

    const dataTxt = item.created_at
      ? new Date(item.created_at).toLocaleString("pt-BR", {
          dateStyle: "short",
          timeStyle: "short"
        })
      : "";

    card.innerHTML = `
      <div class="linha1">
        <div class="desc">${item.descricao || "(sem descrição)"}</div>
        <div class="total">${formatBRL(total)}</div>
      </div>
      <div class="detalhes">
        ${dataTxt ? `<span><strong>Data:</strong> ${dataTxt}</span>` : ""}
        <span><strong>Qtd:</strong> ${qtd}</span>
        <span><strong>Valor:</strong> ${formatBRL(valor)}</span>
        <span><strong>Pagamento:</strong> ${formaPagamento}</span>
      </div>
    `;

    const editar = document.createElement("div");
    editar.className = "edit";
    editar.textContent = "✏️ Editar";

    editar.addEventListener("click", () => {
      const novaDesc = prompt("Editar descrição:", item.descricao || "");
      if (novaDesc === null) return;

      const novaQtdTxt = prompt("Editar quantidade:", String(qtd));
      if (novaQtdTxt === null) return;

      const novoValorTxt = prompt("Editar valor (R$):", String(valor).replace(".", ","));
      if (novoValorTxt === null) return;

      const opcoes = ["Dinheiro", "Pix", "Débito", "Crédito", "Transferência"];
      const escolha = prompt(
        "Forma de pagamento:\n1) Dinheiro\n2) Pix\n3) Débito\n4) Crédito\n5) Transferência\n\nDigite 1 a 5:",
        String((opcoes.indexOf(formaPagamento) + 1) || 1)
      );
      if (escolha === null) return;

      const idx = parseInt(escolha, 10) - 1;
      if (idx < 0 || idx > 4) {
        alert("Escolha inválida (digite 1 a 5).");
        return;
      }

      const qtdN = parseInt(novaQtdTxt, 10);
      const valorN = parseFloat(String(novoValorTxt).replace(/\./g, "").replace(",", "."));

      if (!novaDesc.trim() || !qtdN || qtdN < 1 || isNaN(valorN)) {
        alert("Preencha corretamente: descrição, quantidade >= 1 e valor válido.");
        return;
      }

      (async () => {
        const { error } = await window.supabaseClient
          .from("entradas_clientes")
          .update({
            descricao: novaDesc.trim(),
            valor: valorN,
            categoria: opcoes[idx],
            observacoes: JSON.stringify({ qtd: qtdN })
          })
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao editar lançamento:", error);
          alert("Erro ao editar lançamento.");
          return;
        }

        await carregarLancamentos();
        render();
      })();
    });

    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      if (!confirm("Excluir lançamento?")) return;

      (async () => {
        const { error } = await window.supabaseClient
          .from("entradas_clientes")
          .delete()
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao excluir lançamento:", error);
          alert("Erro ao excluir lançamento.");
          return;
        }

        await carregarLancamentos();
        render();
      })();
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
  if (!it.created_at) return acc;

  const d = new Date(it.created_at);
  const meta = it.observacoes ? JSON.parse(it.observacoes || "{}") : {};
  const qtd = Number(meta.qtd || 1);

  if (
    d.getFullYear() === dia.getFullYear() &&
    d.getMonth() === dia.getMonth() &&
    d.getDate() === dia.getDate()
  ) {
    return acc + (Number(it.valor) || 0) * qtd;
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
  if (!it.created_at) return;

  const d = new Date(it.created_at);
  const meta = it.observacoes ? JSON.parse(it.observacoes || "{}") : {};
  const qtd = Number(meta.qtd || 1);

  if (d.getMonth() === mes && d.getFullYear() === ano) {
    totalMes += (Number(it.valor) || 0) * qtd;
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
  
  await carregarLancamentos();
render();
});

function voltarAdmin() {
  window.location.href = "admin.html";
}
