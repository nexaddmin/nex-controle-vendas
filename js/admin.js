<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Painel Admin — Nex</title>

    <!-- Fonte Literata -->
    <link href="https://fonts.googleapis.com/css2?family=Literata:wght@300;400;600&display=swap" rel="stylesheet">

    <style>
        body {
            margin: 0;
            font-family: 'Literata', serif;
            background: #dadadd;
            color: #333;
        }

        header {
            background: #65889d;
            color: #fff;
            padding: 20px 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        header h1 {
            margin: 0;
            font-weight: 400;
            font-size: 22px;
        }

        button {
            background: #0d5884;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-family: 'Literata', serif;
        }

        button:hover {
            opacity: 0.9;
        }

        main {
            padding: 30px;
        }

        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
        }

        .card {
            background: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .card h3 {
            margin-top: 0;
            font-weight: 400;
            font-size: 16px;
            color: #0d5884;
        }

        .card p {
            font-size: 15px;
            line-height: 1.5;
        }

        footer {
            text-align: center;
            padding: 20px;
            font-size: 13px;
            color: #555;
        }
    </style>
</head>
<body>

    <!-- PROTEÇÃO -->
    <script>
        const tipoUsuario = localStorage.getItem("tipoUsuario");
        if (tipoUsuario !== "admin") {
            window.location.href = "index.html";
        }
    </script>

    <header>
        <h1>Administração — Nex</h1>
        <button onclick="logout()">Sair</button>
    </header>

    <main>
        <div class="cards">
            <div class="card">
                <h3>Clientes ativos</h3>
                <p>0 clientes cadastrados</p>
            </div>

            <div class="card">
                <h3>Movimentações do mês</h3>
                <p>Sem dados</p>
            </div>

            <div class="card">
                <h3>Status do sistema</h3>
                <p>Operando normalmente</p>
            </div>
        </div>
    </main>

    <footer>
        Nex Admin & Financeiro © 2026
    </footer>

    <script>
        function logout() {
            localStorage.clear();
            window.location.href = "index.html";
        }
    </script>

</body>
</html>
