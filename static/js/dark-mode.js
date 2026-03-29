// ===== APLICAR TEMA AO CARREGAR =====
(function () {
  const tema = localStorage.getItem("tema") || "light";

  if (tema === "dark") {
    document.body.classList.add("dark-mode");
  } else {
    document.body.classList.remove("dark-mode");
  }

  // marca radio correto (se existir)
  const radio = document.querySelector(`input[name="tema"][value="${tema}"]`);
  if (radio) {
    radio.checked = true;
  }
})();


// ===== BOTÃO APLICAR =====
const btnAplicar = document.getElementById("aplicar-tema");

if (btnAplicar) {
  btnAplicar.addEventListener("click", () => {
    const selecionado = document.querySelector('input[name="tema"]:checked');

    if (!selecionado) return;

    const tema = selecionado.value;

    // salva
    localStorage.setItem("tema", tema);

    // aplica na página atual
    document.body.classList.toggle("dark-mode", tema === "dark");

    // aplica no menu (caso esteja em iframe)
    if (window.parent !== window) {
      window.parent.document.body.classList.toggle("dark-mode", tema === "dark");
    }

    // aplica no iframe (se existir)
    const iframe = window.parent.document.querySelector("iframe");

    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.document.body.classList.toggle(
        "dark-mode",
        tema === "dark"
      );
    }

    console.log("Tema aplicado:", tema);
  });
}