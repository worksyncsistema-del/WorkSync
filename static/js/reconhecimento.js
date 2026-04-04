console.log("JS CARREGADO");

// ELEMENTOS
const video = document.getElementById("video");
const btnRegistrar = document.getElementById("btnRegistrar");
const btnInstrucoes = document.getElementById("btnInstrucoes");
const btnFecharModal = document.getElementById("btnFecharModal");
const modal = document.getElementById("modal-instrucoes");

let processando = false;

// =========================
// CAMERA
// =========================
function ligarCamera() {
    navigator.mediaDevices.getUserMedia({
        video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
        }
    })
    .then((stream) => {
        video.srcObject = stream;
        video.play();

        const placeholder = document.querySelector(".camera-placeholder");
        if (placeholder) placeholder.style.display = "none";
    })
    .catch((erro) => {
        console.error("Erro câmera:", erro);
        alert("Erro ao acessar a câmera.");
    });
}

// =========================
// CAPTURA
// =========================
function capturarImagem() {
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg", 0.95);
}

// =========================
// RECONHECIMENTO
// =========================
async function registrarPonto() {
    if (processando) return;
    processando = true;

    const imagem = capturarImagem();
    if (!imagem) {
        processando = false;
        return;
    }

    try {
        const resposta = await fetch("/reconhecer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imagem })
        });

        const dados = await resposta.json();
        console.log("RETORNO:", dados);

        // 👉 pega elementos (podem não existir)
        const nomeRegistro = document.getElementById("nomeRegistro");
        const dataRegistro = document.getElementById("dataRegistro");
        const horaRegistro = document.getElementById("horaRegistro");

        // 👉 só atualiza se existir
        if (nomeRegistro && dados.nome) {
            nomeRegistro.innerText = "Nome: " + dados.nome;
        }

        if (dataRegistro && dados.data) {
            dataRegistro.innerText = "Data: " + dados.data;
        }

        if (horaRegistro && dados.horario) {
            horaRegistro.innerText = "Hora: " + dados.horario;
        }

        // 👉 feedback
        if (dados.nome && dados.data && dados.horario) {
            alert(
                "Funcionário identificado: " + dados.nome +
                "\nPonto registrado em: " + dados.data +
                " às " + dados.horario
            );

            // feedback visual opcional
            video.style.border = "4px solid green";
            setTimeout(() => video.style.border = "none", 2000);

        } else {
            alert(dados.erro || "Não reconhecido");

            video.style.border = "4px solid red";
            setTimeout(() => video.style.border = "none", 2000);
        }

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro no reconhecimento.");
    } finally {
        processando = false;
    }
}

// =========================
// MODAL
// =========================
if (btnInstrucoes && modal) {
    btnInstrucoes.addEventListener("click", () => {
        modal.classList.add("active");
    });
}

if (btnFecharModal && modal) {
    btnFecharModal.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

window.addEventListener("click", (event) => {
    if (modal && event.target === modal) {
        modal.classList.remove("active");
    }
});

// =========================
// INIT
// =========================
window.addEventListener("load", ligarCamera);

if (btnRegistrar) {
    btnRegistrar.addEventListener("click", registrarPonto);
}