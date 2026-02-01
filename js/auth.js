function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (!usuario || !senha) {
        alert("Informe usuário e senha");
        return;
    }

    alert("Login OK!\nUsuário: " + usuario);
}
