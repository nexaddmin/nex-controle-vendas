document.addEventListener("DOMContentLoaded", () => {

  const btnLogin = document.getElementById("btnLogin");

  const usuarios = {
    "Cinza": "1356",
    "Marrom": "9732",
    "Vermelho": "4561",
    "Verde": "7854",
    "Laranja": "3826",
    "Branco": "8630",
    "admin": "9999" // senha do admin
  };

  btnLogin.addEventListener("click", () => {

    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuarios[usuario] && usuarios[usuario] === senha) {

      localStorage.setItem("usuarioLogado", usuario);

      if (usuario === "admin") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "cliente.html";
      }

    } else {
      alert("Usuário ou senha incorretos");
    }

  });

});
