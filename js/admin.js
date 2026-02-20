document.addEventListener("DOMContentLoaded", () => {

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
      listaClientes.appendChild(div);
    });
  }

  /* ===== ENTRADAS MENSAIS (CNPJ) ===== */

 let entradasMensais =
  JSON.parse(localStorage.getItem("entradasMensais")) || [];

const listaEntradas = document.getElementById("listaEntradas");


function salvarLocalStorage() {
  localStorage.setItem(
    "entradasMensais",
    JSON.stringify(entradasMensais)
  );
}


function renderEntradas() {
  listaEntradas.innerHTML = "";

  entradasMensais.forEach((item, index) => {

    const linha = document.createElement("div");
    linha.className = "linha";

    const mes = document.createElement("div");
    mes.textContent = item.mes;

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
      const novoMes = prompt("Editar mês:", item.mes);
      const novoValor = prompt("Editar valor:", item.valor);

      if (novoMes !== null && novoValor !== null) {
        entradasMensais[index] = {
          mes: novoMes,
          valor: parseFloat(
            novoValor.replace(/\./g, "").replace(",", ".")
          )
        };

        salvarLocalStorage();
        renderEntradas();
      }
    });

    // ===== DELETAR =====
    const deletar = document.createElement("div");
    deletar.className = "delete";
    deletar.textContent = "🗑 Deletar";

    deletar.addEventListener("click", () => {
      const confirmar = confirm(
        "Tem certeza que deseja excluir?"
      );
      if (!confirmar) return;

      entradasMensais.splice(index, 1);
      salvarLocalStorage();
      renderEntradas();
    });

    // adiciona botões nas ações
    acoes.appendChild(editar);
    acoes.appendChild(deletar);

    // adiciona tudo na linha
    linha.appendChild(mes);
    linha.appendChild(valor);
    linha.appendChild(acoes);

    // adiciona linha na lista
    listaEntradas.appendChild(linha);
  });
}
      salvarEntradas();
      renderEntradas();
    }
  });

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
