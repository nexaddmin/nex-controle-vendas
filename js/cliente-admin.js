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

        if (!novaDesc.trim() || !novaQtd || novaQtd < 1 || isNaN(novoValor)) {
          alert("Preencha corretamente: descrição, quantidade >= 1 e valor válido.");
          return;
        }

        lancamentos[index] = { ...item, desc: novaDesc.trim(), qtd: novaQtd, valor: novoValor };
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

  render();
});

function voltarAdmin() {
  window.location.href = "admin.html";
}
