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
    window.location.href = "index.html";
    return;
  }

  console.log("admin autorizado");

  function formatBRL(n) {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

  function parseValorBR(texto) {
  const limpo = String(texto || "")
    .trim()
    .replace(/\./g, "")
    .replace(",", ".");

  const n = parseFloat(limpo);
  return isNaN(n) ? null : n;
}
  
  // 🔴 LOGOUT
  const btnLogout = document.getElementById("btnLogout");

  if (btnLogout) {
btnLogout.addEventListener("click", async () => {
  await window.supabaseClient.auth.signOut();
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

  const btnRelatorios = document.getElementById("btnRelatorios");
  const relatoriosSection = document.getElementById("relatoriosSection");
  
  /* ===== CLIENTES ===== */
  const listaClientes = document.getElementById("listaClientes");

  let clientes = [];

async function carregarClientes() {
  if (!listaClientes) return;

  listaClientes.innerHTML = "";

  const { data, error } = await window.supabaseClient
    .from("clientes")
    .select("id, nome_empresa, responsavel")
    .order("nome_empresa", { ascending: true });

  if (error) {
    console.error("Erro ao carregar clientes:", error);
    listaClientes.innerHTML = '<div class="card">Erro ao carregar clientes.</div>';
    return;
  }

  clientes = data || [];

  clientes.forEach(cliente => {
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = cliente.nome_empresa;

    div.addEventListener("click", () => {
      window.location.href =
        "cliente-admin.html?nome=" + encodeURIComponent(cliente.nome_empresa);
    });

    listaClientes.appendChild(div);
  });
}

 /* ===== ENTRADAS MENSAIS (CNPJ) ===== */

const btnAddMes = document.getElementById("btnAddMes");
const listaEntradasMensais = document.getElementById("listaEntradasMensais");

let entradasMensais = [];

async function carregarEntradasCNPJ() {
  const { data, error } = await window.supabaseClient
    .from("entradas_cnpj")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar entradas CNPJ:", error);
    alert("Erro ao carregar entradas CNPJ.");
    entradasMensais = [];
    return;
  }

  entradasMensais = data || [];
}

function renderEntradas() {
  if (!listaEntradasMensais) return;
  listaEntradasMensais.innerHTML = "";

  const totalEl = document.getElementById("totalEntradasCNPJ");
  const totalGeral = entradasMensais.reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

  if (totalEl) {
    totalEl.textContent = "Total: " + totalGeral.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  entradasMensais.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const titulo = document.createElement("div");
    titulo.textContent = item.descricao || "-";

    const valor = document.createElement("div");
    valor.textContent = Number(item.valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const editar = document.createElement("div");
    editar.className = "edit";
    editar.textContent = "✏️ Editar";

    editar.addEventListener("click", () => {
      const novoMes = prompt("Editar nome do mês:", item.descricao || "");
      const novoValorTxt = prompt("Editar valor:", String(item.valor).replace(".", ","));

      if (novoMes === null || novoValorTxt === null) return;

      const valorN = parseValorBR(novoValorTxt);
      if (!novoMes.trim() || valorN === null) {
        alert("Preencha corretamente.");
        return;
      }

      (async () => {
        const { error } = await window.supabaseClient
          .from("entradas_cnpj")
          .update({
            descricao: novoMes.trim(),
            valor: valorN,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao editar entrada CNPJ:", error);
          alert("Erro ao editar entrada CNPJ.");
          return;
        }

        await carregarEntradasCNPJ();
        renderEntradas();
      })();
    });

    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      if (!confirm("Tem certeza que deseja excluir?")) return;

      (async () => {
        const { error } = await window.supabaseClient
          .from("entradas_cnpj")
          .delete()
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao excluir entrada CNPJ:", error);
          alert("Erro ao excluir entrada CNPJ.");
          return;
        }

        await carregarEntradasCNPJ();
        renderEntradas();
      })();
    });

    acoes.appendChild(editar);
    acoes.appendChild(deletar);

    card.appendChild(titulo);
    card.appendChild(valor);
    card.appendChild(acoes);

    listaEntradasMensais.appendChild(card);
  });
}

if (btnAddMes) {
  btnAddMes.addEventListener("click", async () => {
    const mes = prompt("Nome do mês (Ex: Janeiro / 2026)");
    const valorTxt = prompt("Valor total do mês:");

    if (mes === null || valorTxt === null) return;

    const valorN = parseValorBR(valorTxt);
    if (!mes.trim() || valorN === null) {
      alert("Preencha corretamente.");
      return;
    }

    const { error } = await window.supabaseClient
      .from("entradas_cnpj")
      .insert([{
        cliente_id: null,
        data_lancamento: new Date().toISOString().slice(0, 10),
        descricao: mes.trim(),
        cnpj: null,
        valor: valorN,
        criado_por: user.id
      }]);

    if (error) {
      console.error("Erro ao salvar entrada CNPJ:", error);
      alert("Erro ao salvar entrada CNPJ.");
      return;
    }

    await carregarEntradasCNPJ();
    renderEntradas();
  });
}

    /*  == NAVEGAÇÃO ==  */
function esconderTudo() {
  if (clientesSection) clientesSection.classList.add("hidden");
  if (entradasSection) entradasSection.classList.add("hidden");
  if (saidasSection) saidasSection.classList.add("hidden");
  if (relatoriosSection) relatoriosSection.classList.add("hidden");
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
// RELATÓRIO
btnRelatorios.addEventListener("click", async () => {
  esconderTudo();
  relatoriosSection.classList.remove("hidden");
  await renderRelatorios();
});
  
/* ===== SAÍDAS (EMPRESA) ===== */

const btnAddSaida = document.getElementById("btnAddSaida");
const listaSaidas = document.getElementById("listaSaidas");

let saidas = [];

async function carregarSaidas() {
  const { data, error } = await window.supabaseClient
    .from("saidas_empresa")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar saídas:", error);
    alert("Erro ao carregar saídas.");
    saidas = [];
    return;
  }

  saidas = data || [];
}

function renderSaidas() {
  if (!listaSaidas) return;
  listaSaidas.innerHTML = "";

  const totalMesEl = document.getElementById("totalSaidasMes");

  const agora = new Date();
  const mesAtual = agora.getMonth();
  const anoAtual = agora.getFullYear();

  const totalDoMes = saidas.reduce((acc, it) => {
    if (!it.created_at) return acc;
    const d = new Date(it.created_at);
    if (d.getMonth() === mesAtual && d.getFullYear() === anoAtual) {
      return acc + (Number(it.valor) || 0);
    }
    return acc;
  }, 0);

  if (totalMesEl) {
    totalMesEl.textContent = "Total do mês: " + totalDoMes.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  saidas.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";

    const titulo = document.createElement("div");
    titulo.style.fontWeight = "900";
    titulo.textContent = item.descricao || "Saída";

    const valor = document.createElement("div");
    valor.style.marginTop = "6px";
    valor.style.fontWeight = "900";
    valor.style.color = "#0d5884";
    valor.textContent = formatBRL(item.valor);

    const data = document.createElement("div");
    data.style.marginTop = "8px";
    data.style.fontSize = "13px";
    data.style.opacity = "0.8";
    data.textContent = item.created_at
      ? new Date(item.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
      : "";

    const acoes = document.createElement("div");
    acoes.className = "acoes";

    const editar = document.createElement("div");
    editar.className = "edit";
    editar.textContent = "✏️ Editar";

    editar.addEventListener("click", () => {
      const novaDesc = prompt("Editar descrição:", item.descricao || "");
      if (novaDesc === null) return;

      const novoValorTxt = prompt("Editar valor (R$):", String(item.valor).replace(".", ","));
      if (novoValorTxt === null) return;

      const valorN = parseValorBR(novoValorTxt);
      if (!novaDesc.trim() || valorN === null) {
        alert("Preencha corretamente (descrição e valor válido).");
        return;
      }

      (async () => {
        const { error } = await window.supabaseClient
          .from("saidas_empresa")
          .update({
            descricao: novaDesc.trim(),
            valor: valorN,
            updated_at: new Date().toISOString()
          })
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao editar saída:", error);
          alert("Erro ao editar saída.");
          return;
        }

        await carregarSaidas();
        renderSaidas();
      })();
    });

    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      if (!confirm("Excluir saída?")) return;

      (async () => {
        const { error } = await window.supabaseClient
          .from("saidas_empresa")
          .delete()
          .eq("id", item.id);

        if (error) {
          console.error("Erro ao excluir saída:", error);
          alert("Erro ao excluir saída.");
          return;
        }

        await carregarSaidas();
        renderSaidas();
      })();
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
  btnAddSaida.addEventListener("click", async () => {
    const desc = prompt("Descrição da saída (ex: Internet, Fornecedor, Anúncios)");
    if (desc === null) return;

    const valorTxt = prompt("Valor (R$):");
    if (valorTxt === null) return;

    const valorN = parseValorBR(valorTxt);
    if (!desc.trim() || valorN === null) {
      alert("Preencha corretamente (descrição e valor válido).");
      return;
    }

    const { error } = await window.supabaseClient
      .from("saidas_empresa")
      .insert([{
        cliente_id: null,
        data_lancamento: new Date().toISOString().slice(0, 10),
        descricao: desc.trim(),
        valor: valorN,
        criado_por: user.id
      }]);

    if (error) {
      console.error("Erro ao salvar saída:", error);
      alert("Erro ao salvar saída.");
      return;
    }

    await carregarSaidas();
    renderSaidas();
  });
}
  
/* ===== RELATÓRIOS (GERAL) ===== */

function formatDataHora(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

const listaRelatoriosEl = document.getElementById("listaRelatorios");
const btnRelEntradasMensal = document.getElementById("btnRelEntradasMensal");
const btnRelSaidasMensal = document.getElementById("btnRelSaidasMensal");

let relatorios = [];

async function carregarRelatorios() {
  const { data, error } = await window.supabaseClient
    .from("relatorios_nex")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar relatórios:", error);
    alert("Erro ao carregar relatórios.");
    relatorios = [];
    return;
  }

  relatorios = data || [];
}

async function adicionarRelatorio(rel) {
  const { error } = await window.supabaseClient
    .from("relatorios_nex")
    .insert([{
      cliente_id: null,
      competencia: rel.periodo || null,
      titulo: rel.titulo,
      conteudo: {
        origem: rel.origem || "Admin",
        tipo: rel.tipo || "GERAL",
        periodo: rel.periodo || "",
        total: Number(rel.total || 0),
        detalhes: rel.detalhes || ""
      },
      criado_por: user.id
    }]);

  if (error) {
    console.error("Erro ao salvar relatório:", error);
    alert("Erro ao salvar relatório.");
    return false;
  }

  await carregarRelatorios();
  return true;
}

async function renderRelatorios() {
  if (!listaRelatoriosEl) return;

  await carregarRelatorios();
  listaRelatoriosEl.innerHTML = "";

  if (relatorios.length === 0) {
    const vazio = document.createElement("div");
    vazio.className = "card";
    vazio.textContent = "Ainda não há relatórios gerados.";
    listaRelatoriosEl.appendChild(vazio);
    return;
  }

  relatorios.forEach((r) => {
    const payload = r.conteudo || {};

    const card = document.createElement("div");
    card.className = "card";
    card.style.position = "relative";

    const titulo = document.createElement("div");
    titulo.style.fontWeight = "900";
    titulo.textContent = r.titulo || "Relatório";

    const sub = document.createElement("div");
    sub.style.marginTop = "6px";
    sub.style.opacity = "0.85";
    sub.textContent = `${payload.origem || "Admin"} • ${formatDataHora(r.created_at)}`;

    const total = document.createElement("div");
    total.style.marginTop = "10px";
    total.style.fontWeight = "900";
    total.style.color = "#0d5884";
    total.textContent = "Total: " + formatBRL(payload.total || 0);

    const ver = document.createElement("div");
    ver.className = "edit";
    ver.textContent = "👁 Ver detalhes";
    ver.addEventListener("click", () => {
      alert(
        `${r.titulo}\n\n` +
        `Período: ${payload.periodo || "-"}\n` +
        `Total: ${formatBRL(payload.total || 0)}\n\n` +
        `${payload.detalhes || ""}`
      );
    });

    card.appendChild(titulo);
    card.appendChild(sub);
    card.appendChild(total);
    card.appendChild(ver);

    const btnDelete = document.createElement("button");
    btnDelete.innerHTML = "🗑";
    btnDelete.className = "relatorio-delete-btn";

    btnDelete.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!confirm("Excluir este relatório?")) return;

      const { error } = await window.supabaseClient
        .from("relatorios_nex")
        .delete()
        .eq("id", r.id);

      if (error) {
        console.error("Erro ao excluir relatório:", error);
        alert("Erro ao excluir relatório.");
        return;
      }

      await renderRelatorios();
    });

    card.appendChild(btnDelete);
    listaRelatoriosEl.appendChild(card);
  });
}

function mesAnoAtual() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const aa = d.getFullYear();
  return `${mm}/${aa}`;
}

btnRelEntradasMensal?.addEventListener("click", async () => {
  const periodo = prompt("Qual período? (ex: 02/2026)", mesAnoAtual());
  if (!periodo) return;

  const total = (entradasMensais || []).reduce((acc, it) => acc + (Number(it.valor) || 0), 0);

  const ok = await adicionarRelatorio({
    origem: "Admin",
    tipo: "ENTRADAS_CNPJ_MENSAL",
    titulo: `Entradas (CNPJ) — ${periodo}`,
    periodo,
    total,
    detalhes: `Total geral das entradas cadastradas: ${formatBRL(total)}`
  });

  if (!ok) return;

  await renderRelatorios();
  alert("Relatório salvo em Relatórios ✅");
});

btnRelSaidasMensal?.addEventListener("click", async () => {
  const periodo = prompt("Qual período? (ex: 02/2026)", mesAnoAtual());
  if (!periodo) return;

  const [mmStr, aaStr] = periodo.split("/");
  const mm = parseInt(mmStr, 10) - 1;
  const aa = parseInt(aaStr, 10);

  const total = (saidas || []).reduce((acc, it) => {
    if (!it.created_at) return acc;
    const d = new Date(it.created_at);
    if (d.getMonth() === mm && d.getFullYear() === aa) return acc + (Number(it.valor) || 0);
    return acc;
  }, 0);

  const ok = await adicionarRelatorio({
    origem: "Admin",
    tipo: "SAIDAS_MENSAL",
    titulo: `Saídas — ${periodo}`,
    periodo,
    total,
    detalhes: `Total do mês em Saídas: ${formatBRL(total)}`
  });

  if (!ok) return;

  await renderRelatorios();
  alert("Relatório salvo em Relatórios ✅");
});
  
  /* ===== INICIAL ===== */

await carregarClientes();
await carregarEntradasCNPJ();
renderEntradas();
await carregarSaidas();
renderSaidas();
await renderRelatorios();
});
