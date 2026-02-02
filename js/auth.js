function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (!usuario || !senha) {
        alert("Informe usuário e senha");
        return;
    }

    // ADMIN
    if (usuario === "admin" && senha === "1234") {
        localStorage.setItem("tipoUsuario", "admin");
        window.location.href = "admin.html";
        return;
    }

    // CLIENTE
    if (senha === "1234") {
        localStorage.setItem("tipoUsuario", "cliente");
        window.location.href = "dashboard.html";
        return;
    }

    alert("Usuário ou senha inválidos");
}
