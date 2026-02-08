// js/admin.js

// Garante que o DOM carregou
document.addEventListener("DOMContentLoaded", () => {
  // Proteção básica: só entra se estiver logado como admin
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const tipoUsuario = localStorage.getItem("tipoUsuario");

  if (!usuarioLogado || tipoUsuario !== "admin") {
    alert("Acesso não autorizado.");
    window.location.href = "index.html";
    return;
  }

  console.log("Admin carregado com sucesso");
});

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}
