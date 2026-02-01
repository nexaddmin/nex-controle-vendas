function login() {
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (!email || !senha) {
        alert("Preencha email e senha");
        return;
    }

    alert("Login clicado com sucesso!\nEmail: " + email);
}
