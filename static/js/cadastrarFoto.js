const video = document.getElementById('video');
const contador = document.getElementById("contador");
const barra = document.getElementById("barra");
const btnCapturar = document.getElementById("btnCapturar");
const modal = document.getElementById('modal-instrucoes');

let fotosCapturadas = 0;
const maxFotos = 5;

let cadastroIniciado = false;
let nomeGlobal = "";


async function carregarUsuarios() {
  const res = await fetch("/listar_usuarios_select");
  const usuarios = await res.json();

    const select = document.getElementById("nome");
    const nome = select.options[select.selectedIndex].text;

  usuarios.forEach((u) => {
    const option = document.createElement("option");
    option.value = u.id;
    option.textContent = u.nome;

    select.appendChild(option);
  });
}

carregarUsuarios();

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
        .then(stream => {
            video.srcObject = stream;

            video.onloadedmetadata = () => {
                video.play();
                console.log("Câmera pronta!");

                const placeholder = document.querySelector(".camera-placeholder");
                if (placeholder) placeholder.style.display = "none";
            };
        })
        .catch(error => {
            alert("Erro ao acessar a câmera!");
            console.error(error);
        });
}

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
    const largura = 320;
    const altura = 240;

    canvas.width = largura;
    canvas.height = altura;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, largura, altura);

    return canvas.toDataURL("image/jpeg", 0.85);
}

// =========================
// CADASTRO
// =========================
async function cadastrar() {
    const select = document.getElementById("nome");
    const nome = select.options[select.selectedIndex].text;
    if (!nome) {
        alert("Digite seu nome!");
        return;
    }

    if (fotosCapturadas >= maxFotos) return;
    if (btnCapturar.disabled) return;

    const imagemBase64 = capturarImagem();
    if (!imagemBase64) return;

    btnCapturar.disabled = true;
    btnCapturar.innerText = "Salvando...";

    try {
        if (!cadastroIniciado) {
            const resInicio = await fetch("/iniciar_cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome })
            });

            const dataInicio = await resInicio.json();

            if (!resInicio.ok) {
                throw new Error(dataInicio.erro || "Erro ao iniciar cadastro");
            }

            cadastroIniciado = true;
            nomeGlobal = nome;
        }

        const resFoto = await fetch("/adicionar_foto", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nome: nomeGlobal,
                imagem: imagemBase64
            })
        });

        const dataFoto = await resFoto.json();

        if (!resFoto.ok) {
            throw new Error(dataFoto.erro || "Erro ao salvar foto");
        }

        fotosCapturadas++;
        contador.innerText = `Foto ${fotosCapturadas} de 5`;

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

        if (fotosCapturadas === maxFotos) {
            btnCapturar.innerText = "Processando cadastro...";

            const resFinal = await fetch("/finalizar_cadastro", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nome: nomeGlobal })
            });

            const dataFinal = await resFinal.json();

            if (!resFinal.ok) {
                let mensagemErro = dataFinal.erro || "Erro ao finalizar cadastro";

                if (dataFinal.erros && dataFinal.erros.length > 0) {
                    mensagemErro += "\n\nDetalhes:\n" + dataFinal.erros.join("\n");
                }

                throw new Error(mensagemErro);
            }

            let mensagem = dataFinal.mensagem || "Cadastro concluído!";

            if (dataFinal.erros && dataFinal.erros.length > 0) {
                mensagem += "\n\nObservações:\n" + dataFinal.erros.join("\n");
            }

            setTimeout(() => {
                alert(mensagem);

                fotosCapturadas = 0;
                cadastroIniciado = false;
                nomeGlobal = "";
                contador.innerText = "Foto 0 de 5";
                barra.style.width = "0%";

                window.location.href = "/menu";
            }, 300);
        }

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        btnCapturar.disabled = false;
        btnCapturar.innerText = "Capturar Foto";
    }
}

// =========================
// MODAL
// =========================
function abrirInstrucoes() {
    modal.classList.add('active');
}

function fecharInstrucoes() {
    modal.classList.remove('active');
}

window.onclick = function (event) {
    if (event.target == modal) {
        fecharInstrucoes();
    }
}