import { state } from './state.js';
import { $, showScreen, format2 } from './ui.js';

// --- Constantes de configuración ---
const CSV_HEADERS = {
  PREGUNTA: "pregunta",
  RESPUESTA1: "respuesta1",
  RESPUESTA2: "respuesta2",
  RESPUESTA3: "respuesta3",
  RESPUESTA4: "respuesta4",
  INDICE_CORRECTA: "indice_correcta",
  COMPETENCIAS: "competencias_especificas",
  CRITERIOS: "criterios",
  SABERES: "saberes",
  DESCRIPTORES: "descriptores",
  IMAGEN: "imagen",
  EXPLICACION: "feedback_explicacion"
};

const RESULTS_CSV_HEADER = "curso;materia;tema;nombre_alumno;fecha;puntuacion_total;notas_por_saberes;notas_por_competencias_especificas;notas_por_criterios;notas_por_descriptores\n";

// --- Lógica de parsing y preparación ---
function normTag(s) { return (s ?? "").trim().replace(/^"|"$/g, ""); }

function buildQuestions(rows) {
  return rows.map(row => {
    const toList = txt => normTag(txt) === "" ? [] : txt.split(",").map(normTag).filter(x => x);
    return {
      pregunta: normTag(row[CSV_HEADERS.PREGUNTA]),
      r1: normTag(row[CSV_HEADERS.RESPUESTA1]),
      r2: normTag(row[CSV_HEADERS.RESPUESTA2]),
      r3: normTag(row[CSV_HEADERS.RESPUESTA3]),
      r4: normTag(row[CSV_HEADERS.RESPUESTA4]),
      correcta: parseInt(row[CSV_HEADERS.INDICE_CORRECTA], 10) || 1,
      comp: toList(row[CSV_HEADERS.COMPETENCIAS]),
      crit: toList(row[CSV_HEADERS.CRITERIOS]),
      sab: toList(row[CSV_HEADERS.SABERES]),
      desc: toList(row[CSV_HEADERS.DESCRIPTORES]),
      imagen: normTag(row[CSV_HEADERS.IMAGEN]),
      explicacion: normTag(row[CSV_HEADERS.EXPLICACION]),
    };
  });
}

function addToMap(map, key, delta = 1) { map.set(key, (map.get(key) || 0) + delta); }

function preCountTags() {
  const { sab, comp, crit, desc } = state.perTag;
  for (const q of state.preguntas) {
    q.sab.forEach(t => addToMap(sab.tot, t));
    q.comp.forEach(t => addToMap(comp.tot, t));
    q.crit.forEach(t => addToMap(crit.tot, t));
    q.desc.forEach(t => addToMap(desc.tot, t));
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export async function loadCSV() {
  const res = await fetch("assets/preguntas.csv", { cache: "no-store" });
  const text = await res.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        state.preguntas = buildQuestions(results.data);
        state.total = state.preguntas.length;
        state.puntosPorPregunta = state.total > 0 ? 10 / state.total : 0;
        state.orden = Array.from({ length: state.total }, (_, i) => i);
        state.userAnswers = Array(state.total).fill(null);
        shuffle(state.orden);
        preCountTags();
        state.idx = 0;
        state.score = 0;
        setupNavigator();
        showQuestion();
        resolve();
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        alert("No se pudo cargar el archivo de preguntas. Revisa el formato.");
        reject(error);
      }
    });
  });
}

// --- Lógica del Cuestionario ---
function setAnswersEnabled(enabled) {
  document.querySelectorAll('.quiz-buttons-grid .answer').forEach(b => b.disabled = !enabled);
}

function resetAnswerButtons() {
  document.querySelectorAll('.quiz-buttons-grid .answer').forEach(b => {
    b.classList.remove('good', 'bad', 'chosen');
  });
}

function showQuestion() {
  if (state.idx >= state.total || state.idx === -1) return finalizeQuiz();

  const q = state.preguntas[state.orden[state.idx]];
  
  resetAnswerButtons();
  
  // Rellenar texto de botones
  $("#a1").textContent = q.r1;
  $("#a2").textContent = q.r2;
  $("#a3").textContent = q.r3;
  $("#a4").textContent = q.r4;
  
  if (state.isReviewMode) {
    // Modo Revisión
    $("#quiz-actions").style.display = 'none';
    $("#quiz-review-actions").style.display = 'block';

    const userAnswer = state.userAnswers[state.idx];
    const correct = q.correcta;
    const reviewButtons = [$("#ra1"), $("#ra2"), $("#ra3"), $("#ra4")];
    reviewButtons.forEach((btn, i) => {
      btn.textContent = q[`r${i+1}`];
      btn.className = 'answer'; // Reset
    });
    
    reviewButtons[correct - 1]?.classList.add('good');
    if (userAnswer && userAnswer.choice && !userAnswer.isCorrect) {
      reviewButtons[userAnswer.choice - 1]?.classList.add('bad');
    }
    
    $("#btn-review-prev").disabled = state.idx === 0;
    $("#btn-review-next").disabled = state.idx === state.total - 1;
    $("#q-progress").textContent = `Revisando: ${state.idx + 1}/${state.total}`;
    
  } else {
    // Modo Cuestionario Normal
    $("#quiz-actions").style.display = 'grid';
    $("#quiz-review-actions").style.display = 'none';
    
    const remaining = state.userAnswers.filter(a => a === null || a?.skipped).length;
    $("#q-progress").textContent = `Preguntas restantes: ${remaining}`;
    const hasSkipped = state.userAnswers.some(a => a && a.skipped);
    $("#btn-next").textContent = (remaining === 1 && !hasSkipped) ? "Finalizar" : "Siguiente";
    $("#btn-skip").textContent = "Responder luego";
    
    setAnswersEnabled(true);
    $("#btn-skip").disabled = false;
    $("#btn-next").disabled = true;
  }
  
  $("#q-score").textContent = `Puntuación: ${format2(state.score)}/10`;
  $("#q-text").textContent = q.pregunta;
  
  state.answered = state.isReviewMode;

  $("#q-cats").innerHTML =
    `<strong>Saberes básicos:</strong> ${q.sab.join(", ") || "-"}<br>` +
    `<strong>Competencias específicas:</strong> ${q.comp.join(", ") || "-"}<br>` +
    `<strong>Criterios de evaluación:</strong> ${q.crit.join(", ") || "-"}<br>` +
    `<strong>Descriptores del perfil de salida:</strong> ${q.desc.join(", ") || "-"}`;

  $("#q-feedback").textContent = "";
  $("#q-explanation").textContent = state.isReviewMode ? (q.explicacion || '') : '';
  $("#q-feedback").classList.remove("good", "bad");
  
  updateImage(q.imagen);
  updateNavigator();
}

async function updateImage(imageName) {
  const wrap = $("#q-image-wrap");
  const img = $("#q-image");
  const loader = $("#q-image-loader");

  if (imageName) {
    wrap.style.display = "flex";
    img.style.display = "none";
    loader.style.display = "inline-block";
    
    try {
      img.src = `assets/${imageName}`;
      await img.decode();
      img.style.display = "block";
    } catch (error) {
      console.error("Error al cargar la imagen:", error);
      img.alt = "Error al cargar la imagen";
      img.style.display = "block";
    } finally {
      loader.style.display = "none";
    }
  } else {
    wrap.style.display = "none";
  }
}

export function onAnswer(choice) {
  if (state.answered) return;
  state.answered = true;
  const q = state.preguntas[state.orden[state.idx]];
  const correct = q.correcta;
  
  let isCorrect = choice === correct;
  state.userAnswers[state.idx] = { choice, isCorrect, skipped: false };

  const btns = [$("#a1"), $("#a2"), $("#a3"), $("#a4")];
  btns[choice - 1]?.classList.add('chosen');

  let msg = "";
  if (isCorrect) {
    state.score += state.puntosPorPregunta;
    btns[choice - 1]?.classList.add("good");
    $("#q-feedback").classList.add("good");
    msg = "¡Correcto!";
    q.sab.forEach(t => addToMap(state.perTag.sab.ok, t));
    q.comp.forEach(t => addToMap(state.perTag.comp.ok, t));
    q.crit.forEach(t => addToMap(state.perTag.crit.ok, t));
    q.desc.forEach(t => addToMap(state.perTag.desc.ok, t));
  } else {
    btns[choice - 1]?.classList.add("bad");
    btns[correct - 1]?.classList.add("good");
    $("#q-feedback").classList.add("bad");
    const correctText = [q.r1, q.r2, q.r3, q.r4][correct - 1];
    msg = `Incorrecto. La respuesta correcta es: ${correctText}`;
  }

  $("#q-feedback").textContent = msg;
  if (q.explicacion) $("#q-explanation").textContent = q.explicacion;
  
  setAnswersEnabled(false);
  $("#btn-skip").disabled = true;
  $("#btn-next").disabled = false;
  updateNavigator();
  setTimeout(() => $("#btn-next")?.focus(), 100);
}

export function onSkip() {
  if (state.answered) return;
  state.answered = true;
  state.userAnswers[state.idx] = { choice: null, isCorrect: false, skipped: true };
  $("#q-feedback").textContent = "Pregunta saltada. La responderás más tarde.";
  $("#q-explanation").textContent = "";
  setAnswersEnabled(false);
  $("#btn-skip").disabled = true;
  $("#btn-next").disabled = true;
  updateNavigator();

  setTimeout(advanceQuestion, 800);
}

function findNextUnansweredIndex(startIndex = 0) {
  for (let i = startIndex; i < state.total; i++) {
    if (state.userAnswers[i] === null || state.userAnswers[i]?.skipped) {
      return i;
    }
  }
  for (let i = 0; i < startIndex; i++) {
    if (state.userAnswers[i] === null || state.userAnswers[i]?.skipped) {
      return i;
    }
  }
  return -1;
}

function advanceQuestion() {
  const card = $("#screen-quiz .card");
  card.classList.add("changing");

  setTimeout(() => {
    const nextIndex = findNextUnansweredIndex(state.idx + 1);
    
    if (nextIndex !== -1) {
      state.idx = nextIndex;
      showQuestion();
    } else {
      finalizeQuiz();
    }
    
    card.classList.remove("changing");
  }, 200);
}

export function goNext() {
  if (!$("#btn-next").disabled) {
    advanceQuestion();
  }
}

function setupNavigator() {
  const nav = $("#q-navigator");
  nav.innerHTML = "";
  for (let i = 0; i < state.total; i++) {
    const item = document.createElement('div');
    item.className = 'nav-item';
    item.dataset.index = i;
    nav.appendChild(item);
  }
}

function updateNavigator() {
  const items = document.querySelectorAll('.nav-item');
  items.forEach((item, i) => {
    const answer = state.userAnswers[i];
    item.className = 'nav-item';
    if (answer) {
      if (answer.skipped) item.classList.add('skipped');
      else if (answer.isCorrect) item.classList.add('correct');
      else item.classList.add('incorrect');
    }
    if (i === state.idx) item.classList.add('current');
    if (state.isReviewMode) item.classList.add('review');
  });
}

export function startReview() {
  state.isReviewMode = true;
  state.idx = 0;
  $("#q-navigator").addEventListener('click', handleNavClick);
  showQuestion();
  showScreen('#screen-quiz');
}

export function quitReview() {
  state.isReviewMode = false;
  $("#q-navigator").removeEventListener('click', handleNavClick);
  showScreen('#screen-results');
}

export function reviewNav(dir) {
  const card = $("#screen-quiz .card");
  card.classList.add("changing");

  setTimeout(() => {
    if (dir === 'next' && state.idx < state.total - 1) state.idx++;
    else if (dir === 'prev' && state.idx > 0) state.idx--;
    showQuestion();
    card.classList.remove("changing");
  }, 200);
}

function handleNavClick(e) {
  if (state.isReviewMode && e.target.classList.contains('nav-item')) {
    const index = parseInt(e.target.dataset.index, 10);
    if (!isNaN(index) && index !== state.idx) {
      const card = $("#screen-quiz .card");
      card.classList.add("changing");
      setTimeout(() => {
        state.idx = index;
        showQuestion();
        card.classList.remove("changing");
      }, 200);
    }
  }
}

// --- Finalización y Resultados ---

function getScoreClass(score) {
  if (score >= 7) return 'score-good';
  if (score >= 5) return 'score-avg';
  return 'score-bad';
}

function createScoreBar(score) {
  const scoreClass = getScoreClass(score);
  return `
    <div class="score-display">
      <span class="note ${scoreClass}">${format2(score)}/10</span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar ${scoreClass}" style="width: ${score * 10}%"></div>
    </div>
  `;
}

function getFeedbackMessage(score) {
  const messages = state.config.feedbackMessages;
  let category;
  if (score >= 9) category = 'excellent';
  else if (score >= 7) category = 'good';
  else if (score >= 5) category = 'average';
  else category = 'poor';

  const categoryMessages = messages[category] || [];
  if (categoryMessages.length === 0) return "";

  const randomIndex = Math.floor(Math.random() * categoryMessages.length);
  return categoryMessages[randomIndex].replace('[Nombre]', state.nombre);
}

function finalizeQuiz() {
  // --- Cálculo de notas ---
  state.notasGlobal = {
    saberes: calcGroupNote(state.perTag.sab.tot, state.perTag.sab.ok),
    comp: calcGroupNote(state.perTag.comp.tot, state.perTag.comp.ok),
    crit: calcGroupNote(state.perTag.crit.tot, state.perTag.crit.ok),
    desc: calcGroupNote(state.perTag.desc.tot, state.perTag.desc.ok)
  };

  const sab = calcDetail(state.perTag.sab.tot, state.perTag.sab.ok);
  const comp = calcDetail(state.perTag.comp.tot, state.perTag.comp.ok);
  const crit = calcDetail(state.perTag.crit.tot, state.perTag.crit.ok);
  const desc = calcDetail(state.perTag.desc.tot, state.perTag.desc.ok);
  state.detalle = { sabList: sab.list, sabNotes: sab.dict, compList: comp.list, compNotes: comp.dict, critList: crit.list, critNotes: crit.dict, descList: desc.list, descNotes: desc.dict };

  // --- Rellenar la pantalla de resultados ---
  $("#r-alumno").innerHTML = `<strong>Alumno:</strong> <span>${state.nombre}</span>`;

  // Mensaje de feedback dinámico
  const feedbackMsgEl = $("#r-feedback-message");
  const finalScoreClass = getScoreClass(state.score);
  feedbackMsgEl.textContent = getFeedbackMessage(state.score);
  feedbackMsgEl.className = `feedback-message ${finalScoreClass}`;

  // Nota total
  $("#r-total").innerHTML = `<strong>Nota total:</strong> <span class="${finalScoreClass}">${format2(state.score)}/10</span>`;

  // Notas globales con barras
  $("#r-saberes").innerHTML = createScoreBar(state.notasGlobal.saberes);
  $("#r-comp").innerHTML = createScoreBar(state.notasGlobal.comp);
  $("#r-crit").innerHTML = createScoreBar(state.notasGlobal.crit);
  $("#r-desc").innerHTML = createScoreBar(state.notasGlobal.desc);

  // Rellenar listas por etiqueta con barras
  const fillList = (ul, items) => {
    ul.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="score-display">
          <span>${item.tag}</span>
          <span class="note ${getScoreClass(item.note)}">(${item.ok}/${item.tot})</span>
        </div>
        ${createScoreBar(item.note)}
      `;
      ul.appendChild(li);
    });
  };
  
  fillList($("#r-saberes-list"), state.detalle.sabList);
  fillList($("#r-comp-list"), state.detalle.compList);
  fillList($("#r-crit-list"), state.detalle.critList);
  fillList($("#r-desc-list"), state.detalle.descList);

  // --- Preparar exportación ---
  const csv = buildResultsCSV();
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  state.csvBlob = new Blob([bom, csv], { type: "text/csv;charset=utf-8" });

  const stamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, "");
  state.csvFilename = `Resultados_Quiz3ESO_${state.nombre}_${stamp}.csv`;

  $("#r-path").textContent = "El archivo CSV está listo para descargar o compartir.";
  showScreen("#screen-results");
}

function calcGroupNote(totMap, okMap) { let tot = 0, ok = 0; for (const [tag, t] of totMap.entries()) { tot += t; ok += (okMap.get(tag) || 0); } return tot > 0 ? 10 * (ok / tot) : 0; }

function calcDetail(totMap, okMap) {
  const list = [];
  const dict = new Map();
  const keys = Array.from(totMap.keys()).sort();
  for (const k of keys) {
    const t = totMap.get(k) || 0;
    const o = okMap.get(k) || 0;
    const note = t > 0 ? 10 * (o / t) : 0;
    dict.set(k, note);
    list.push({ tag: k, note: note, ok: o, tot: t });
  }
  return { list, dict };
}

// --- Exportación y Compartir ---
function mapToFlatString(m) { const parts = []; for (const k of Array.from(m.keys()).sort()) parts.push(`${k}:${format2(m.get(k) || 0)}`); return parts.join(" | "); }

function buildResultsCSV() {
  const fechaStr = new Date().toISOString().slice(0, 16).replace("T", " ");
  const row = [ state.config.curso, state.config.materia, state.config.tema, state.nombre, fechaStr, format2(state.score), mapToFlatString(state.detalle.sabNotes), mapToFlatString(state.detalle.compNotes), mapToFlatString(state.detalle.critNotes), mapToFlatString(state.detalle.descNotes) ].map(v => `"${(v ?? "").toString().replace(/"/g, '""')}"`).join(";") + "\n";
  return RESULTS_CSV_HEADER + row;
}

export function downloadCSV() { if (!state.csvBlob) return; const url = URL.createObjectURL(state.csvBlob); const a = document.createElement("a"); a.href = url; a.download = state.csvFilename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

export async function shareCSV() {
  if (!state.csvBlob) return downloadCSV();
  const file = new File([state.csvBlob], state.csvFilename, { type: "text/csv;charset=utf-8" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: `Resultados: ${state.nombre}`, text: "Adjunto mis resultados del test." }); return; } catch (e) { console.error("Error al compartir:", e); }
  }
  downloadCSV();
}
