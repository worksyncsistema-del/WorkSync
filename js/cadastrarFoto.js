const video = document.getElementById('video');

function ligarCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            alert("Erro ao acessar a câmera!");
            console.error(error);
        });
}

function capturarImagem() {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/jpeg");
}

function cadastrar() {
    const nome = document.getElementById("nome").value;

    if (!nome) {
        alert("Digite seu nome!");
        return;
    }

    const imagemBase64 = capturarImagem();

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

        alert(data.mensagem);

        if (data.quantidade !== undefined) {
            document.getElementById("contador").innerText =
                "Fotos cadastradas: " + data.quantidade + "/5";
        }

        if (data.bloqueado) {
            document.getElementById("btnCadastrar").disabled = true;
        }
    });
}