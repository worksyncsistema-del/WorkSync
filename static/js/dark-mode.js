const botao = document.getElementById("toggle-dark");

botao.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  const iframe = document.querySelector("iframe");

  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.document.body.classList.toggle("dark-mode");
  }

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("tema", "dark");
  } else {
    localStorage.setItem("tema", "light");
  }
});

// carregar ao abrir
window.onload = () => {
  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark-mode");

    const iframe = document.querySelector("iframe");
    if (iframe && iframe.contentWindow) {
      iframe.onload = () => {
        iframe.contentWindow.document.body.classList.add("dark-mode");
      };
    }
  }
};