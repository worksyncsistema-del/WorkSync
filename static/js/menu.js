const items = document.querySelectorAll(".sidebar li a");

items.forEach(item => {
  item.addEventListener("click", () => {
    items.forEach(i => i.parentElement.classList.remove("active"));
    item.parentElement.classList.add("active");
  });
});
const links = document.querySelectorAll(".sidebar a");

links.forEach(link => {
  link.addEventListener("click", () => {
    links.forEach(l => l.parentElement.classList.remove("active"));
    link.parentElement.classList.add("active");
  });
});

async function atualizarRelogio() {
  const resposta = await fetch(
    "/hora-servidor",
  );
  const dados = await resposta.json();

  document.getElementById("hora").textContent = dados.hora;
  document.getElementById("data").textContent =
  `${dados.dia}, ${dados.data}`;
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();

async function atualizarStatus() {
  const resposta = await fetch(
    "/status",
  );
  const dados = await resposta.json();

  const statusEl = document.getElementById("status");

  // 👤 pega nome salvo no login
  const nome = localStorage.getItem("usuarioNome") || "";

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

// atualiza a cada 5 segundos
setInterval(atualizarStatus, 5000);
atualizarStatus();

function carregarUsuario() {
  const nome = localStorage.getItem("usuarioNome");
  document.getElementById("nomeUsuario").textContent = nome;
}

carregarUsuario();
