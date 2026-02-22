document.addEventListener("DOMContentLoaded", () => {

  // 🔒 proteção admin
  const tipo = localStorage.getItem("tipoUsuario");
  if (tipo !== "admin") {
    window.location.href = "index.html";
    return;
  }

 const params = new URLSearchParams(window.location.search);
const nomeParam = params.get("nome");

// normaliza para bater com o localStorage (cliente salva em minúsculo)
const nome = (nomeParam || "").toLowerCase();

if (!nome) {
  window.location.href = "admin.html";
  return;
}
  
  const titulo = document.getElementById("tituloCliente");
  const lista = document.getElementById("listaAdminCliente");

  const nomeBonito = nome.charAt(0).toUpperCase() + nome.slice(1);
titulo.textContent = "Lançamentos - " + nomeBonito;

  const todos = JSON.parse(localStorage.getItem("clientesEntradas")) || {};
  if (!todos[nome]) todos[nome] = [];

  let lancamentos = todos[nome];

  function salvar() {
    todos[nome] = lancamentos;
    localStorage.setItem("clientesEntradas", JSON.stringify(todos));
  }

  function formatBRL(n) {
    return Number(n).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
  }

  function render() {
    lista.innerHTML = "";

    lancamentos.forEach((item, index) => {

      const total = item.valor * item.qtd;

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <div class="linha1">
          <div class="desc">${item.desc}</div>
          <div class="total">${formatBRL(total)}</div>
        </div>
        <div class="detalhes">
          <span>Qtd: ${item.qtd}</span>
          <span>Valor: ${formatBRL(item.valor)}</span>
          <span>Data: ${new Date(item.criadoEm).toLocaleString("pt-BR", {
            dateStyle: "short",
            timeStyle: "short"
          })}</span>
        </div>
      `;

      const editar = document.createElement("div");
      editar.className = "edit";
      editar.textContent = "✏️ Editar";

      editar.addEventListener("click", () => {

        const novaDesc = prompt("Editar descrição:", item.desc);
        if (!novaDesc) return;

        const novaQtd = parseInt(prompt("Editar quantidade:", item.qtd), 10);
        const novoValor = parseFloat(
          prompt("Editar valor:", item.valor)
        );

        if (!novaQtd || !novoValor) return;

        lancamentos[index] = {
          ...item,
          desc: novaDesc,
          qtd: novaQtd,
          valor: novoValor
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

  render();
});

function voltarAdmin() {
  window.location.href = "admin.html";
}
