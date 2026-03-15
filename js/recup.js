function validarSenha() {
  const senha = document.getElementById("novaSenha").value;

  const tamanho = senha.length >= 8 && senha.length <= 12;
  const letra = /[a-z]/.test(senha);
  const letraMai = /[A-Z]/.test(senha);
  const numero = /[0-9]/.test(senha);
  const especial = /[@#$]/.test(senha);

  marcar("req-tamanho", tamanho);
  marcar("req-letra", letra);
  marcar("req-letraMai", letraMai);
  marcar("req-numero", numero);
  marcar("req-especial", especial);

  let forca = tamanho + letra + numero + letraMai + especial;
  const barra = document.getElementById("forca");

  if (forca === 1) {
    barra.style.width = "20%";
    barra.style.background = "#e74c3c";
  } else if (forca === 2) {
    barra.style.width = "40%";
    barra.style.background = "orange";
  } else if (forca === 3) {
    barra.style.width = "60%";
    barra.style.background = "#f1c40f";
  } else if (forca === 4) {
    barra.style.width = "80%";
    barra.style.background = "#9acd32";
  } else if (forca === 5) {
    barra.style.width = "100%";
    barra.style.background = "#2ecc71";
  }
  else {
    barra.style.width = "0%";
  }
}

function marcar(id, ok) {
  const el = document.getElementById(id);
  if (ok) el.classList.add("ok");
  else el.classList.remove("ok");
}
function validarConfirmacao() {
  const senha = document.getElementById("novaSenha").value;
  const confirmar = document.getElementById("confirmarSenha");
  const erro = document.getElementById("erroSenha");

  if (confirmar.value === "") {
    confirmar.classList.remove("erro", "ok");
    erro.style.display = "none";
    return;
  }

  if (confirmar.value === senha) {
    confirmar.classList.remove("erro");
    confirmar.classList.add("ok");
    erro.style.display = "none";
  } else {
    confirmar.classList.remove("ok");
    confirmar.classList.add("erro");
    erro.style.display = "block";
  }
}
function toggleSenha(el) {
  const input = el.previousElementSibling;

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}
