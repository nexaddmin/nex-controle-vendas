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

  function atualizarTotaisTopo() {
  const totalMesEl = document.getElementById("totalMes");
  const totalSemanaEl = document.getElementById("totalSemana");

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const inicioSemana = inicioDaSemanaDomingo(hoje);
  const fimSemana = fimDaSemanaSabado(hoje);

  let totalMes = 0;
  let totalSemana = 0;

  lancamentos.forEach((it) => {
    if (!it.created_at) return;

    const d = new Date(it.created_at);

    const meta = it.observacoes ? JSON.parse(it.observacoes || "{}") : {};
    const qtd = Number(meta.qtd || 1);

    const total = (Number(it.valor) || 0) * qtd;

    if (d.getMonth() === mesAtual && d.getFullYear() === anoAtual) {
      totalMes += total;
    }

    if (d >= inicioSemana && d <= fimSemana) {
      totalSemana += total;
    }
  });

  if (totalMesEl) totalMesEl.textContent = formatBRL(totalMes);
  if (totalSemanaEl) totalSemanaEl.textContent = formatBRL(totalSemana);
}
  
/* ===== RELATÓRIOS (salva pro Admin também) ===== */

async function adicionarRelatorio(rel) {

  const { error } = await window.supabaseClient
    .from("relatorios_nex")
    .insert([{
      cliente_id: clienteId,
      competencia: rel.periodo || null,
      titulo: rel.titulo,
      conteudo: {
        origem: rel.origem,
        tipo: rel.tipo,
        periodo: rel.periodo,
        total: rel.total,
        detalhes: rel.detalhes
      },
      criado_por: user.id
    }]);

  if (error) {
    console.error("Erro ao salvar relatório:", error);
    alert("Erro ao salvar relatório.");
    return false;
  }

  return true;
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
        atualizarTotaisTopo();
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
        atualizarTotaisTopo();
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
btnRelatorioSemanal?.addEventListener("click", async () => {
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

 await adicionarRelatorio({
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
btnRelatorioMensal?.addEventListener("click", async () => {
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

  await adicionarRelatorio({
    id: Date.now().toString(),
    origem: `Cliente (${nomeBonito}
    
    )`,
    tipo: "CLIENTE_MENSAL",
    titulo: `Relatório mensal — ${nomeBonito}`,
    periodo: `${mm}/${ano}`,
    total: totalMes,
    detalhes: `Total do mês: ${formatBRL(totalMes)}`,
    criadoEm: new Date().toISOString()
  });

  alert("Relatório mensal salvo ✅");
});

const btnExportarPDF = document.getElementById("btnExportarPDF");

function agruparPorPeriodo(lista, mesSelecionado, anoSelecionado) {
  const agrupado = {};
  let totalMes = 0;
  let totalRegistros = 0;

  lista.forEach((item) => {
    if (!item.created_at) return;

    const d = new Date(item.created_at);
    if (d.getMonth() !== mesSelecionado || d.getFullYear() !== anoSelecionado) return;

    const meta = item.observacoes ? JSON.parse(item.observacoes || "{}") : {};
    const qtd = Number(meta.qtd || 1);
    const total = (Number(item.valor) || 0) * qtd;

    const chave = d.toLocaleDateString("pt-BR");

    if (!agrupado[chave]) {
      agrupado[chave] = {
        total: 0,
        registros: 0
      };
    }

    agrupado[chave].total += total;
    agrupado[chave].registros += 1;

    totalMes += total;
    totalRegistros += 1;
  });

  return { agrupado, totalMes, totalRegistros };
}

btnExportarPDF?.addEventListener("click", () => {
  const hoje = new Date();
  const sugestao = hoje.toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" });

  const periodoEscolhido = prompt("Qual mês deseja exportar? (MM/AAAA)", sugestao);
  if (!periodoEscolhido) return;

  const [mesStr, anoStr] = periodoEscolhido.split("/");
  const mesSelecionado = parseInt(mesStr, 10) - 1;
  const anoSelecionado = parseInt(anoStr, 10);

  if (isNaN(mesSelecionado) || isNaN(anoSelecionado) || mesSelecionado < 0 || mesSelecionado > 11) {
    alert("Período inválido. Use o formato MM/AAAA.");
    return;
  }

  const { agrupado, totalMes, totalRegistros } = agruparPorPeriodo(
    lancamentos,
    mesSelecionado,
    anoSelecionado
  );

  const geradoEm = hoje.toLocaleString("pt-BR");
  const periodo = periodoEscolhido;

    const linhas = Object.entries(agrupado)
    .sort((a, b) => {
      const [da, ma, aa] = a[0].split("/");
      const [db, mb, ab] = b[0].split("/");
      return new Date(`${aa}-${ma}-${da}`) - new Date(`${ab}-${mb}-${db}`);
    })
    .map(([data, info]) => {
      return `
        <tr>
          <td style="padding:10px; border:1px solid #dbe5ef;">${data}</td>
          <td style="padding:10px; border:1px solid #dbe5ef; text-align:center;">
            ${info.registros}
          </td>
          <td style="padding:10px; border:1px solid #dbe5ef; text-align:right;">
            ${formatBRL(info.total)}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <div style="font-family: Arial, sans-serif; color:#163247; padding:24px;">
      <div style="border-bottom:2px solid #0d5884; padding-bottom:12px; margin-bottom:20px;">
        <h1 style="margin:0; font-size:24px;">Nex Admin Financeiro</h1>
        <div style="margin-top:8px; font-size:14px; color:#4b6477;">
          Relatório mensal de entradas
        </div>
      </div>

      <div style="margin-bottom:20px; line-height:1.8; font-size:14px;">
        <div><strong>Cliente/Empresa:</strong> ${nomeBonito}</div>
        <div><strong>Período:</strong> ${periodo}</div>
        <div><strong>Gerado em:</strong> ${geradoEm}</div>
      </div>

      <div style="display:flex; gap:12px; margin-bottom:24px;">
        <div style="flex:1; background:#f4f8fb; padding:14px; border-radius:10px; border:1px solid #dbe5ef;">
          <div style="font-size:12px; color:#5d7383;">Total de registros</div>
          <div style="font-size:22px; font-weight:700; margin-top:6px;">${totalRegistros}</div>
        </div>

        <div style="flex:1; background:#f4f8fb; padding:14px; border-radius:10px; border:1px solid #dbe5ef;">
          <div style="font-size:12px; color:#5d7383;">Total no mês</div>
          <div style="font-size:22px; font-weight:700; margin-top:6px;">${formatBRL(totalMes)}</div>
        </div>
      </div>

      <h2 style="font-size:16px; margin-bottom:12px;">Total de valor por data</h2>

      <table style="width:100%; border-collapse:collapse; font-size:14px;">
        <thead>
    <tr style="background:#eef4f8;">
      <th style="padding:10px; border:1px solid #dbe5ef; text-align:left;">Data</th>
      <th style="padding:10px; border:1px solid #dbe5ef; text-align:center;">Registros</th>
      <th style="padding:10px; border:1px solid #dbe5ef; text-align:right;">Total</th>
    </tr>
  </thead>
        <tbody>
          ${linhas || `
            <tr>
              <td colspan="2" style="padding:12px; border:1px solid #dbe5ef; text-align:center;">
                Nenhum lançamento encontrado no mês atual.
              </td>
            </tr>
          `}
        </tbody>
      </table>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;

  const opt = {
    margin: 8,
    filename: `relatorio-mensal-${nomeBonito}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  html2pdf().set(opt).from(container).save();
});
  
await carregarLancamentos();
render();
atualizarTotaisTopo();
});

function voltarAdmin() {
  window.location.href = "admin.html";
}
