document.addEventListener("DOMContentLoaded", () => {

  /* ===== BOTÕES MENU ===== */
  const btnClientes = document.getElementById("btnClientes");
  const btnEntradas = document.getElementById("btnEntradas");

  const clientesSection = document.getElementById("clientesSection");
  const entradasSection = document.getElementById("entradasSection");

  /* ===== LISTA DE CLIENTES ===== */
  const listaClientes = document.getElementById("listaClientes");

  const clientes = [
    { nome: "Cinza", senha: "1356" },
    { nome: "Marrom", senha: "9732" },
    { nome: "Vermelho", senha: "4561" },
    { nome: "Verde", senha: "7854" },
    { nome: "Laranja", senha: "3826" },
    { nome: "Branco", senha: "8630" }
  ];

  function carregarClientes() {
    if (!listaClientes) return;

    listaClientes.innerHTML = "";

    clientes.forEach(cliente => {
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = cliente.nome;

      div.addEventListener("click", () => {
        alert(`Cliente selecionado: ${cliente.nome}`);
        // depois: abrir dashboard do cliente
      });

      listaClientes.appendChild(div);
    });
  }

  /* ===== NAVEGAÇÃO ===== */
  btnClientes.addEventListener("click", () => {
    clientesSection.classList.remove("hidden");
    entradasSection.classList.add("hidden");
  });

  btnEntradas.addEventListener("click", () => {
    clientesSection.classList.add("hidden");
    entradasSection.classList.remove("hidden");
  });

  /* ===== INICIAL ===== */
  carregarClientes();
});
