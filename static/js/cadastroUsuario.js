function toggleDia(id) {
  const dia = document.getElementById(id);

  if (dia.style.display === "none") {
    dia.style.display = "grid";
  } else {
    dia.style.display = "none";
  }
}

function alternarJornada() {
  const tipo = document.getElementById("tipoJornada").value;

  const padrao = document.getElementById("jornadaPadrao");
  const manual = document.getElementById("jornadaManual");

  if (tipo === "padrao") {
    padrao.style.display = "block";
    manual.style.display = "none";
  } else {
    padrao.style.display = "none";
    manual.style.display = "block";
  }
}

async function cadastrarUsuario() {
  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    telefone: document.getElementById("telefone").value,
    cpf: document.getElementById("cpf").value,

    cargo: document.getElementById("cargo").value,
    setor: document.getElementById("setor").value,
    tipo_perfil: document.getElementById("tipo_perfil").value,
    tipo_contrato: document.getElementById("tipo_contrato").value,

    data_admissao: document.getElementById("data_admissao").value,
    carga_horaria: document.getElementById("carga_horaria").value,

    matricula: "AUTO-" + Math.floor(Math.random() * 10000),
    jornada: document.getElementById("tipoJornada").value,
  };

  if (!dados.nome || !dados.email) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const res = await fetch("http://127.0.0.1:5000/cadastrar_usuario", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  const json = await res.json();

  if (json.status === "ok") {
    alert(json.mensagem);
    const form = document.getElementById("formCadastro");
    form.reset();

    document.getElementById("jornadaPadrao").style.display = "block";
    document.getElementById("jornadaManual").style.display = "none";
    document.getElementById("tipoJornada").value = "padrao";

    document.querySelectorAll(".dia-manual").forEach((div) => {
      div.style.display = "none";
    });

    document.getElementById("nome").focus();
  } else {
    alert("Erro: " + json.mensagem);
  }
}