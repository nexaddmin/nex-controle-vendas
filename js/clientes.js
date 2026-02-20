document.addEventListener("DOMContentLoaded", () => {

  const params = new URLSearchParams(window.location.search);
  const nome = params.get("nome");

  document.getElementById("nomeCliente").textContent = "Cliente: " + nome;

  const btnAdd = document.getElementById("btnAddEntrada");
  const lista = document.getElementById("listaEntradasCliente");

  let dados = JSON.parse(localStorage.getItem("clientesEntradas")) || {};

  if (!dados[nome]) {
    dados[nome] = [];
  }

  function salvar() {
    localStorage.setItem("clientesEntradas", JSON.stringify(dados));
  }

  function render() {
    lista.innerHTML = "";

    dados[nome].forEach((item, index) => {

      const card = document.createElement("div");
      card.className = "card";

      const titulo = document.createElement("h3");
      titulo.textContent = item.mes;

      const valor = document.createElement("div");
      valor.textContent = item.valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
      });

      const editar = document.createElement("div");
      editar.className = "edit";
      editar.textContent = "✏️ Editar";

      editar.addEventListener("click", () => {

        const novoMes = prompt("Editar mês:", item.mes);
        const novoValor = prompt("Editar valor:", item.valor);

        if (novoMes && novoValor) {
          dados[nome][index] = {
            mes: novoMes,
            valor: parseFloat(novoValor.replace(/\./g, '').replace(',', '.'))
          };

          salvar();
          render();
        }
      });

      card.appendChild(titulo);
      card.appendChild(valor);
      card.appendChild(editar);

      lista.appendChild(card);
    });
  }

  btnAdd.addEventListener("click", () => {

    const mes = prompt("Mês:");
    const valor = prompt("Valor:");

    if (mes && valor) {
      dados[nome].push({
        mes: mes,
        valor: parseFloat(valor.replace(/\./g, '').replace(',', '.'))
      });

      salvar();
      render();
    }
  });

  render();
});

function voltar() {
  window.location.href = "admin.html";
}
