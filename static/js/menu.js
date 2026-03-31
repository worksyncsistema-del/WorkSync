const links = document.querySelectorAll(".sidebar a");

links.forEach(link => {
  link.addEventListener("click", () => {
    links.forEach(l => l.parentElement.classList.remove("active"));
    link.parentElement.classList.add("active");
  });
});

async function atualizarRelogio() {
  const resposta = await fetch("/hora-servidor");
  const dados = await resposta.json();

  document.getElementById("hora").textContent = dados.hora;
  document.getElementById("data").textContent =
    `${dados.dia}, ${dados.data}`;
}

setInterval(atualizarRelogio, 500);
atualizarRelogio();

async function atualizarStatus() {
  const resposta = await fetch("/status");
  const dados = await resposta.json();

  const statusEl = document.getElementById("status");
  const nome = usuarioNome || "";

  if (dados.status === "expediente") {
    statusEl.textContent = `🟢 Em expediente — ${nome}`;
    statusEl.className = "status-expediente";
  } else if (dados.status === "intervalo") {
    statusEl.textContent = `🟡 Em intervalo — ${nome}`;
    statusEl.className = "status-intervalo";
  } else {
    statusEl.textContent = `🔴 Fora do expediente — ${nome}`;
    statusEl.className = "status-fora";
  }
}

setInterval(atualizarStatus, 5000);
atualizarStatus();

function carregarUsuario() {
  const nome = localStorage.getItem("usuarioNome");
  const el = document.getElementById("nomeUsuario");

  if (el) {
    el.textContent = nome;
  }
}

carregarUsuario();


// 🌙 AQUI É O TEMA GLOBAL (CORRIGIDO)
function aplicarTemaGlobal() {
  const tema = localStorage.getItem("tema") || "light";

  if (tema === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  const iframe = document.querySelector("iframe");

  if (iframe) {
    iframe.onload = () => {
      const temaAtual = localStorage.getItem("tema") || "light";

      if (temaAtual === "dark") {
        iframe.contentWindow.document.body.classList.add("dark-mode");
      } else {
        iframe.contentWindow.document.body.classList.remove("dark-mode");
      }
    };
  }
}

aplicarTemaGlobal();

function logout(event) {
  event.preventDefault(); // 🔥 impede o "#"

  sessionStorage.clear();

  window.top.location = "/logout";
}