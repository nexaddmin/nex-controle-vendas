document.addEventListener("DOMContentLoaded", () => {

  const btnSalvar = document.getElementById("btnSalvarEntrada");
  const lista = document.getElementById("listaEntradas");

  if (!btnSalvar || !lista) return;

  function carregarEntradas() {
    lista.innerHTML = "";
    const entradas = JSON.parse(localStorage.getItem("entradasCNPJ")) || [];

    entradas.forEach((e) => {
      const li = document.createElement("li");
      li.textContent = `${e.data} — ${e.descricao} — R$ ${e.valor}`;
      lista.appendChild(li);
    });
  }

  btnSalvar.addEventListener("click", () => {
    const descricao = document.getElementById("entradaDescricao").value;
    const valor = document.getElementById("entradaValor").value;

    if (!descricao || !valor) {
      alert("Preencha todos os campos");
      return;
    }

    const entradas = JSON.parse(localStorage.getItem("entradasCNPJ")) || [];

    entradas.push({
      descricao,
      valor,
      data: new Date().toLocaleDateString("pt-BR")
    });

    localStorage.setItem("entradasCNPJ", JSON.stringify(entradas));

    document.getElementById("entradaDescricao").value = "";
    document.getElementById("entradaValor").value = "";

    carregarEntradas();
  });

  carregarEntradas();
});
