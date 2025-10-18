import { state } from './state.js';
import { onAnswer, onSkip, goNext, downloadCSV, shareCSV, startReview, reviewNav, quitReview } from './quiz.js';

// --- Helpers y Selectores ---
export const $ = sel => document.querySelector(sel);
export const format2 = n => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// --- Gestión de Pantallas ---
export function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(id)?.classList.add("active");

  if (id === "#screen-password") {
    setTimeout(() => $("#input-password")?.focus(), 0);
  } else if (id === "#screen-start") {
    setTimeout(() => {
      const el = $("#input-name");
      if (el) { el.focus(); el.select?.(); }
    }, 0);
  }
}

// --- Configuración y Tema ---
export function loadConfigFromGlobal() {
  const cfg = window.APP_CONFIG ?? {};
  state.config = {
    titulo: cfg.titulo ?? "Quiz",
    curso: cfg.curso ?? "Curso",
    materia: cfg.materia ?? "Materia",
    tema: cfg.tema ?? "Tema",
    password: cfg.password ?? "1234",
    version: cfg.version ?? "1.0",
    feedbackMessages: cfg.feedbackMessages ?? {}
  };
  document.title = state.config.titulo || `${state.config.curso} · ${state.config.tema}`;
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }
}

function setupTheme() {
  const savedTheme = localStorage.getItem('quizTheme') || 'dark';
  applyTheme(savedTheme);
  $("#btn-theme").addEventListener('click', () => {
    const currentTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('quizTheme', newTheme);
    applyTheme(newTheme);
  });
}

function setupShareButton() {
  // 1. Comprobar si estamos en un dispositivo móvil.
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  
  // 2. Si es móvil, comprobar si puede compartir archivos.
  if (isMobile && navigator.canShare) {
    const dummyFile = new File([""], "test.csv", { type: "text/csv" });
    if (navigator.canShare({ files: [dummyFile] })) {
      // Si cumple ambas condiciones, mostramos el botón.
      $("#btn-share").style.display = "block";
    }
  }
}

export function setGlobalsFromConfig() {
  $("#pw-curso").textContent = state.config.curso;
  $("#pw-materia").textContent = state.config.materia;
  $("#pw-tema").textContent = state.config.tema;

  $("#st-curso").textContent = state.config.curso;
  $("#st-materia").textContent = state.config.materia;
  $("#st-tema").textContent = state.config.tema;

  $("#q-curso").textContent = state.config.curso;
  $("#q-materia").textContent = state.config.materia;
  $("#q-tema").textContent = state.config.tema;

  $("#r-curso").textContent = state.config.curso;
  $("#r-materia").textContent = state.config.materia;
  $("#r-tema").textContent = state.config.tema;

  const versionString = `v${state.config.version}`;
  document.querySelectorAll('.version-tag').forEach(el => {
    el.textContent = versionString;
  });
}

// --- Vinculación de Eventos ---
export function bindEvents({ onStart, onBack }) {
  setupTheme();
  setupShareButton(); // Comprobar y mostrar el botón de compartir al inicio.

  $("#btn-password").addEventListener("click", () => {
    const val = $("#input-password")?.value ?? "";
    if (val === state.config.password) {
      $("#input-password").value = "";
      showScreen("#screen-start");
      $("#input-name").value = "";
    } else {
      alert("Contraseña incorrecta");
    }
  });

  $("#input-password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); $("#btn-password").click(); }
  });

  $("#btn-start").addEventListener("click", async () => {
    const name = ($("#input-name")?.value ?? "").trim();
    if (!name) return alert("Escribe tu nombre antes de comenzar");
    await onStart(name);
  });

  $("#input-name").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") { e.preventDefault(); $("#btn-start").click(); }
  });

  // Eventos del cuestionario
  $("#a1").addEventListener("click", () => onAnswer(1));
  $("#a2").addEventListener("click", () => onAnswer(2));
  $("#a3").addEventListener("click", () => onAnswer(3));
  $("#a4").addEventListener("click", () => onAnswer(4));
  $("#btn-skip").addEventListener("click", onSkip);
  $("#btn-next").addEventListener("click", goNext);

  // Eventos de resultados y revisión
  $("#btn-export").addEventListener("click", downloadCSV);
  $("#btn-share").addEventListener("click", shareCSV);
  $("#btn-review").addEventListener("click", startReview);
  $("#btn-review-prev").addEventListener("click", () => reviewNav('prev'));
  $("#btn-review-next").addEventListener("click", () => reviewNav('next'));
  $("#btn-review-back").addEventListener("click", quitReview);
  $("#btn-back").addEventListener("click", onBack);

  // Evento para ampliar imagen
  $("#q-image").addEventListener("click", () => {
    const imgSrc = $("#q-image").src;
    if (imgSrc) {
      $("#modal-image").src = imgSrc;
      $("#image-modal").style.display = "flex";
    }
  });

  // Cerrar modal
  $("#modal-close").addEventListener("click", () => {
    $("#image-modal").style.display = "none";
  });

  $("#image-modal").addEventListener("click", (e) => {
    if (e.target === $("#image-modal")) {
      $("#image-modal").style.display = "none";
    }
  });
}
