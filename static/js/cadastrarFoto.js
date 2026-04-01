const video = document.getElementById('video');
const contador = document.getElementById("contador");
const barra = document.getElementById("barra");
const btnCapturar = document.getElementById("btnCapturar");

let fotosCapturadas = 0;
const maxFotos = 5;

// =========================
// CAMERA
// =========================
function ligarCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;

            video.onloadedmetadata = () => {
                video.play();
                console.log("Câmera pronta!");
            };
        })
        .catch(error => {
            alert("Erro ao acessar a câmera!");
            console.error(error);
        });
}

// inicia automaticamente
window.addEventListener("load", ligarCamera);

// =========================
// CAPTURA IMAGEM
// =========================
function capturarImagem() {
    if (video.videoWidth === 0 || video.videoHeight === 0) {
        alert("A câmera ainda não carregou!");
        return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/jpeg");
}

// =========================
// CADASTRO (AGORA COMPLETO)
// =========================
function cadastrar() {

    const nome = document.getElementById("nome").value.trim();

    if (!nome) {
        alert("Digite seu nome!");
        return;
    }

    if (fotosCapturadas >= maxFotos) return;
    if (btnCapturar.disabled) return;

    const imagemBase64 = capturarImagem();
    if (!imagemBase64) return;

    btnCapturar.disabled = true;
    btnCapturar.innerText = "Processando...";

    fetch('/salvar_cadastro', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            nome: nome,
            imagem: imagemBase64
        })
    })
    .then(response => response.json())
    .then(data => {

        if (data.erro) {
            throw new Error(data.erro);
        }

        // 📊 CONTADOR
        fotosCapturadas++;
        contador.innerText = `Foto ${fotosCapturadas} de 5`;

        // 📊 BARRA
        const progresso = (fotosCapturadas / maxFotos) * 100;
        barra.style.width = progresso + "%";

        const cores = [
            "#e74c3c",
            "orange",
            "#f1c40f",
            "#9acd32",
            "#2ecc71"
        ];

        barra.style.background = cores[fotosCapturadas - 1];

        // ✅ FINALIZA
        if (fotosCapturadas === maxFotos) {
            setTimeout(() => {
                alert("Cadastro concluído!");
                window.location.href = "/menu";
            }, 300);
        }

    })
    .catch(error => {
        console.error(error);
        alert("Erro ao cadastrar");
    })
    .finally(() => {
        btnCapturar.disabled = false;
        btnCapturar.innerText = "Capturar Foto";
    });
}

const modal = document.getElementById('modal-instrucoes');

function abrirInstrucoes() {
    modal.classList.add('active');
}

function fecharInstrucoes() {
    modal.classList.remove('active');
}

window.onclick = function(event) {
    if (event.target === modal) {
        fecharInstrucoes();
    }
}