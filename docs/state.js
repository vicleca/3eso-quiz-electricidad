// Estado global de la aplicación
export const state = {
  config: { curso: "", materia: "", tema: "", password: "", titulo: "", preguntasPorExamen: 0 },
  nombre: "",
  preguntas: [],
  orden: [],
  userAnswers: [], // Almacena las respuestas del usuario
  idx: 0,
  total: 0,
  puntosPorPregunta: 0,
  score: 0,
  answered: false,
  isReviewMode: false, // Flag para el modo de revisión
  perTag: {
    sab: { tot: new Map(), ok: new Map() },
    comp: { tot: new Map(), ok: new Map() },
    crit: { tot: new Map(), ok: new Map() },
    desc: { tot: new Map(), ok: new Map() },
  },
  notasGlobal: { saberes: 0, comp: 0, crit: 0, desc: 0 },
  detalle: {
    sabList: [], sabNotes: new Map(),
    compList: [], compNotes: new Map(),
    critList: [], critNotes: new Map(),
    descList: [], descNotes: new Map(),
  },
  csvBlob: null,
  csvFilename: "",
};

// Función para reiniciar el estado al volver al inicio
export function resetState() {
  state.nombre = "";
  state.preguntas = [];
  state.orden = [];
  state.userAnswers = [];
  state.idx = 0;
  state.total = 0;
  state.score = 0;
  state.answered = false;
  state.isReviewMode = false;
  state.perTag = {
    sab: { tot: new Map(), ok: new Map() },
    comp: { tot: new Map(), ok: new Map() },
    crit: { tot: new Map(), ok: new Map() },
    desc: { tot: new Map(), ok: new Map() },
  };
  state.csvBlob = null;
  state.csvFilename = "";
}
