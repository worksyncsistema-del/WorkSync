function alterarDados() {
    document.querySelectorAll(".campo-editavel").forEach(el => {
    if (el.tagName === "INPUT") {
        el.readOnly = false;
    } else {
        el.disabled = false;
    }});
        document.getElementById("btnSalvar").style.display = "inline-block";
}

function bloquearCampos() {
    document.querySelectorAll(".campo-editavel").forEach(el => {
    if (el.tagName === "INPUT") {
        el.readOnly = true;
    }

    if (el.tagName === "SELECT") {
        el.disabled = true;
        }
    });
}

async function salvarAlteracoes() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const res = await fetch("/atualizar_usuario", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
        id: id,
        nome: nome,
        email: email})
    });

    const data = await res.json();

    if (data.status === "ok") {
        alert("Campos atualizados com sucesso!");
        bloquearCampos();
        document.getElementById("btnSalvar").style.display = "none";
        window.location.href = "/gerenciarUsuario";
    } else {
        alert("Erro ao atualizar");
    }
}