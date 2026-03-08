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

  window.voltarAdmin = function () {
    window.location.href = "admin.html";
  };

  const params = new URLSearchParams(window.location.search);
  const nomeParam = params.get("nome");

  if (!nomeParam) {
    alert("Cliente não informado.");
    window.location.href = "admin.html";
    return;
  }

  const { data: clienteAtual, error: clienteError } = await window.supabaseClient
    .from("clientes")
    .select("id, nome_empresa")
    .ilike("nome_empresa", nomeParam.trim())
    .single();

  if (clienteError || !clienteAtual) {
    alert("Cliente não encontrado.");
    window.location.href = "admin.html";
    return;
  }

  const clienteId = clienteAtual.id;
  const nomeClienteTopo = document.getElementById("nomeClienteTopo");
  const listaSaidasCliente = document.getElementById("listaSaidasCliente");
  const btnNovaSaidaCliente = document.getElementById("btnNovaSaidaCliente");

  if (nomeClienteTopo) nomeClienteTopo.textContent = clienteAtual.nome_empresa;

  const categorias = [
    "internet",
    "fornecedor",
    "aluguel",
    "energia",
    "agua",
    "anúncios",
    "material",
    "transporte",
    "imposto",
    "salário/comissão",
    "outros"
  ];

  const statusOpcoes = [
    "pendente de comprovante",
    "comprovado",
    "revisar"
  ];

  const formasPagamento = [
    "Dinheiro",
    "Pix",
    "Débito",
    "Crédito",
    "Transferência"
  ];

  let saidas = [];

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

  async function carregarSaidasCliente() {
    const { data, error } = await window.supabaseClient
      .from("saidas_clientes")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao carregar saídas do cliente:", error);
      alert("Erro ao carregar saídas do cliente.");
      saidas = [];
      return;
    }

    saidas = data || [];
  }

  function renderSaidasCliente() {
    if (!listaSaidasCliente) return;
    listaSaidasCliente.innerHTML = "";

    if (saidas.length === 0) {
      const vazio = document.createElement("div");
      vazio.className = "card";
      vazio.textContent = "Ainda não há saídas cadastradas para este cliente.";
      listaSaidasCliente.appendChild(vazio);
      return;
    }

    saidas.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";

      const dataTxt = item.data_lancamento
        ? new Date(item.data_lancamento + "T12:00:00").toLocaleDateString("pt-BR")
        : "";

      card.innerHTML = `
        <div class="linha1">
          <div class="desc">${item.descricao || "(sem descrição)"}</div>
          <div class="total">${formatBRL(item.valor)}</div>
        </div>
        <div class="detalhes">
          <span><strong>Data:</strong> ${dataTxt}</span>
          <span><strong>Categoria:</strong> ${item.categoria || "-"}</span>
          <span><strong>Pagamento:</strong> ${item.forma_pagamento || "-"}</span>
          <span><strong>Status:</strong> ${item.status_comprovante || "-"}</span>
        </div>
        ${item.observacao ? `<div class="detalhes"><span><strong>Obs:</strong> ${item.observacao}</span></div>` : ""}
      `;

      const acoes = document.createElement("div");
      acoes.className = "acoes";

      const editar = document.createElement("div");
      editar.className = "edit";
      editar.textContent = "✏️ Editar";

      editar.addEventListener("click", () => {
        const novaData = prompt("Data (AAAA-MM-DD):", item.data_lancamento || "");
        if (novaData === null) return;

        const novaDesc = prompt("Descrição:", item.descricao || "");
        if (novaDesc === null) return;

        const novaCategoria = prompt(
          "Categoria:\n" + categorias.join("\n"),
          item.categoria || "outros"
        );
        if (novaCategoria === null) return;

        const novoValorTxt = prompt("Valor (R$):", String(item.valor).replace(".", ","));
        if (novoValorTxt === null) return;

        const novaForma = prompt(
          "Forma de pagamento:\n" + formasPagamento.join("\n"),
          item.forma_pagamento || "Pix"
        );
        if (novaForma === null) return;

        const novaObs = prompt("Observação curta:", item.observacao || "");
        if (novaObs === null) return;

        const novoStatus = prompt(
          "Status:\n" + statusOpcoes.join("\n"),
          item.status_comprovante || "pendente de comprovante"
        );
        if (novoStatus === null) return;

        const valorN = parseValorBR(novoValorTxt);
        if (!novaData.trim() || !novaDesc.trim() || valorN === null) {
          alert("Preencha corretamente os campos.");
          return;
        }

        (async () => {
          const { error } = await window.supabaseClient
            .from("saidas_clientes")
            .update({
              data_lancamento: novaData.trim(),
              descricao: novaDesc.trim(),
              categoria: novaCategoria.trim(),
              valor: valorN,
              forma_pagamento: novaForma.trim(),
              observacao: novaObs.trim(),
              status_comprovante: novoStatus.trim(),
              updated_at: new Date().toISOString()
            })
            .eq("id", item.id);

          if (error) {
            console.error("Erro ao editar saída do cliente:", error);
            alert("Erro ao editar saída do cliente.");
            return;
          }

          await carregarSaidasCliente();
          renderSaidasCliente();
        })();
      });

      const deletar = document.createElement("div");
      deletar.className = "delete";
      deletar.textContent = "🗑 Deletar";

      deletar.addEventListener("click", () => {
        if (!confirm("Excluir esta saída?")) return;

        (async () => {
          const { error } = await window.supabaseClient
            .from("saidas_clientes")
            .delete()
            .eq("id", item.id);

          if (error) {
            console.error("Erro ao excluir saída do cliente:", error);
            alert("Erro ao excluir saída do cliente.");
            return;
          }

          await carregarSaidasCliente();
          renderSaidasCliente();
        })();
      });

      acoes.appendChild(editar);
      acoes.appendChild(deletar);
      card.appendChild(acoes);
      listaSaidasCliente.appendChild(card);
    });
  }

  btnNovaSaidaCliente?.addEventListener("click", async () => {
    const dataLanc = prompt("Data (AAAA-MM-DD):", new Date().toISOString().slice(0, 10));
    if (dataLanc === null) return;

    const desc = prompt("Descrição da saída:");
    if (desc === null) return;

    const categoria = prompt(
      "Categoria:\n" + categorias.join("\n"),
      "outros"
    );
    if (categoria === null) return;

    const valorTxt = prompt("Valor (R$):");
    if (valorTxt === null) return;

    const formaPagamento = prompt(
      "Forma de pagamento:\n" + formasPagamento.join("\n"),
      "Pix"
    );
    if (formaPagamento === null) return;

    const observacao = prompt("Observação curta:", "");
    if (observacao === null) return;

    const status = prompt(
      "Status:\n" + statusOpcoes.join("\n"),
      "pendente de comprovante"
    );
    if (status === null) return;

    const valorN = parseValorBR(valorTxt);

    if (!dataLanc.trim() || !desc.trim() || valorN === null) {
      alert("Preencha corretamente os campos.");
      return;
    }

    const { error } = await window.supabaseClient
      .from("saidas_clientes")
      .insert([{
        cliente_id: clienteId,
        data_lancamento: dataLanc.trim(),
        descricao: desc.trim(),
        categoria: categoria.trim(),
        valor: valorN,
        forma_pagamento: formaPagamento.trim(),
        observacao: observacao.trim(),
        status_comprovante: status.trim(),
        criado_por: user.id
      }]);

    if (error) {
      console.error("Erro ao salvar saída do cliente:", error);
      alert("Erro ao salvar saída do cliente.");
      return;
    }

    await carregarSaidasCliente();
    renderSaidasCliente();
  });

  await carregarSaidasCliente();
  renderSaidasCliente();
});
