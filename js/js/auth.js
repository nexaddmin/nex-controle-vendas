function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (email === "" || senha === "") {
        alert("Preencha email e senha");
        return;
    }

    // LOGIN DE TESTE
    if (email === "admin@nex.com" && senha === "123456") {
        alert("Login realizado com sucesso!");
        // futuramente: window.location.href = "admin.html";
    } else {
        alert("Email ou senha inválidos");
    }
}
