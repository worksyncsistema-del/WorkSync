function addTelefone() {
    const container = document.getElementById("telefones");

    const div = document.createElement("div");
    div.classList.add("telefone-linha");

    div.innerHTML = `
        <select>
            <option>Fixo</option>
            <option>Celular</option>
        </select>

        <input type="text" placeholder="(xx) xxxxx-xxxx">

        <input type="text" placeholder="Setor ou responsável">

        <button type="button" class="btn btn-secondary btn-sm btn-remover">
            Remover
        </button>
    `;

    container.appendChild(div);

    div.querySelector(".btn-remover").addEventListener("click", () => {
        const total = document.querySelectorAll(".telefone-linha").length;

        if (total > 1) {
            div.remove();
        } else {
            alert("Deve haver pelo menos um telefone.");
        }
    });
}

function addEmail() {
    const container = document.getElementById("emails");

    const div = document.createElement("div");
    div.classList.add("email-linha");

    div.innerHTML = `
        <input type="email" placeholder="Digite o e-mail">

        <button type="button" class="btn btn-secondary btn-sm btn-remover-email">
            Remover
        </button>
    `;

    container.appendChild(div);

    div.querySelector(".btn-remover-email").addEventListener("click", () => {
        if (document.querySelectorAll(".email-linha").length > 1) {
            div.remove();
        } else {
            alert("Deve haver pelo menos um e-mail.");
        }
    });
}

// inicial
window.onload = () => {
    if (document.querySelectorAll(".telefone-linha").length === 0) {
        addTelefone();
    }

    if (document.querySelectorAll(".email-linha").length === 0) {
        addEmail();
    }
};