document.addEventListener("DOMContentLoaded", () => {
  
const usuario = localStorage.getItem("usuarioLogado");

if (usuario !== "admin") {
  window.location.href = "login.html";
}
  /* ===== SEÇÕES ===== */
  const clientesSection = document.getElementById("clientesSection");
  const entradasSection = document.getElementById("entradasSection");

  const btnEntradas = document.getElementById("btnEntradas");
  const btnClientes = document.getElementById("btnClientes");
  
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
  window.location.href = "cliente-admin.html?nome=" + cliente.nome;
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
  
  /* ===== NAVEGAÇÃO ===== */

// Mostrar Entradas
btnEntradas.addEventListener("click", () => {
  clientesSection.classList.add("hidden");
  entradasSection.classList.remove("hidden");
});

// Mostrar Clientes
btnClientes.addEventListener("click", () => {
  entradasSection.classList.add("hidden");
  clientesSection.classList.remove("hidden");
});

  /* ===== INICIAL ===== */

  carregarClientes();
  renderEntradas();

});
