import { state, resetState } from './state.js';
import { loadConfigFromGlobal, setGlobalsFromConfig, showScreen, bindEvents } from './ui.js';
import { loadCSV } from './quiz.js';

// Evitar autofill del nombre
window.addEventListener("pageshow", () => {
  const nameInput = document.querySelector("#input-name");
  if (nameInput) {
    nameInput.setAttribute("autocomplete", "off");
    nameInput.setAttribute("aria-autocomplete", "none");
    nameInput.setAttribute("name", "student_name_no_store");
    nameInput.value = "";
  }
});

// Init
function init() {
  loadConfigFromGlobal();
  setGlobalsFromConfig();
  bindEvents({
    onStart: async (name) => {
      state.nombre = name;
      await loadCSV();
      showScreen("#screen-quiz");
    },
    onBack: () => {
      resetState();
      document.querySelector("#input-name").value = "";
      document.querySelector("#input-password").value = "";
      showScreen("#screen-password");
    }
  });

  // Foco inicial en contraseña si esa pantalla está activa al cargar
  if (document.querySelector("#screen-password")?.classList.contains("active")) {
    setTimeout(() => document.querySelector("#input-password")?.focus(), 0);
  }
}

init();
