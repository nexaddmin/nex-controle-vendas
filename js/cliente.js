document.addEventListener("DOMContentLoaded", async () => {
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
    .select("id, nome, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "cliente") {
    window.location.href = "index.html";
    return;
  }

  const nome = (profile.nome || user.email || "Cliente").trim();

  const { data: clienteAtual, error: clienteAtualError } = await window.supabaseClient
    .from("clientes")
    .select("id, nome_empresa, profile_id")
    .eq("profile_id", user.id)
    .single();

  if (clienteAtualError || !clienteAtual) {
    alert("Cadastro do cliente não encontrado.");
    console.error("Erro ao buscar cliente:", clienteAtualError);
    window.location.href = "index.html";
    return;
  }

  const clienteId = clienteAtual.id;

  // Topo
  const nomeClienteEl = document.getElementById("nomeCliente");
  if (nomeClienteEl) {
  nomeClienteEl.textContent = profile.nome || clienteAtual.nome_empresa || nome;
}

 const btnLogout = document.getElementById("btnLogout");
btnLogout.addEventListener("click", async () => {
  await window.supabaseClient.auth.signOut();
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
let lancamentos = [];

async function carregarLancamentos() {
  const { data, error } = await window.supabaseClient
    .from("entradas_clientes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar lançamentos:", error);
    alert("Erro ao carregar entradas.");
    lancamentos = [];
    return;
  }

  lancamentos = data || [];
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
function podeEditar(createdAt) {
  if (!createdAt) return true;
  const agora = Date.now();
  const criado = new Date(createdAt).getTime();
  const limiteMs = 24 * 60 * 60 * 1000;
  return (agora - criado) <= limiteMs;
}
  function abrirForm() {
    formEntrada.classList.remove("hidden");
    descEntrada.value = "";
    qtdEntrada.value = "1";
    valorEntrada.value = "";
    formaPagamentoEntrada.value = "Dinheiro";
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

const meta = item.observacoes ? JSON.parse(item.observacoes || "{}") : {};
const qtd = Number(meta.qtd || 1);
const formaPagamento = item.categoria || "-";
const totalLinha = Number(item.valor || 0) * qtd;

const dataTxt = item.created_at
  ? new Date(item.created_at).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short"
    })
  : "";
      
      card.innerHTML = `
        <div class="linha1">
<div class="desc">${item.descricao}</div>
<div class="total">${formatBRL(totalLinha)}</div>
...
<span><strong>Qtd:</strong> ${qtd}</span>
<span><strong>Valor:</strong> ${formatBRL(item.valor)}</span>
<span><strong>Pagamento:</strong> ${formaPagamento}</span>
  </div>
      `;

const editar = document.createElement("div");
editar.className = "edit";

if (!podeEditar(item.created_at)) {
  editar.textContent = "⛔ Prazo expirado";
  editar.style.opacity = "0.5";
  editar.style.cursor = "not-allowed";

  editar.addEventListener("click", () => {
    alert("O prazo de 24h para edição expirou.");
  });

} else {
  editar.textContent = "✏️ Editar";

  editar.addEventListener("click", () => {
    const novaDesc = prompt("Editar descrição:", item.descricao);
    if (novaDesc === null) return;

    const novaQtd = prompt("Editar quantidade:", String(qtd));
    if (novaQtd === null) return;

    const novoValorTxt = prompt("Editar valor (R$):", String(item.valor).replace(".", ","));
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

    const qtdN = parseInt(novaQtd, 10);
    const valorN = parseValorBR(novoValorTxt);

    if (!novaDesc.trim() || !qtdN || qtdN < 1 || valorN === null) {
      alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
      return;
    }

    // mantém criadoEm (não reseta as 24h)
  (async () => {
  const { error } = await window.supabaseClient
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
}

      card.appendChild(editar);
      lista.appendChild(card);
    });
  }

  // Eventos
  btnAddEntrada.addEventListener("click", abrirForm);

  btnCancelarEntrada.addEventListener("click", () => {
    fecharForm();
  });

  btnSalvarEntrada.addEventListener("click", async () => {
    const desc = descEntrada.value.trim();
    const qtd = parseInt(qtdEntrada.value, 10);
    const valor = parseValorBR(valorEntrada.value);
    const formaPagamento = formaPagamentoEntrada.value;
    
    if (!desc || !qtd || qtd < 1 || valor === null) {
      alert("Preencha corretamente (descrição, quantidade >= 1 e valor válido).");
      return;
    }

const { error } = await window.supabaseClient
  .from("entradas_clientes")
  .insert([{
    cliente_id: clienteId,
    data_lancamento: new Date().toISOString().slice(0, 10),
    descricao: desc,
    categoria: formaPagamento,
    valor: valor,
    observacoes: JSON.stringify({ qtd }),
    criado_por: user.id
  }]);

if (error) {
  console.error("Erro ao salvar entrada:", error);
  alert("Erro ao salvar entrada.");
  return;
}

await carregarLancamentos();
render();
fecharForm();
  });

  // Inicial
 await carregarLancamentos();
 render();
 fecharForm();
});
