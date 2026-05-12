let Memoria = cargarMemoria();

function cargarMemoria() {
  const memoriaGuardada = localStorage.getItem(CONFIG.STORAGE_KEY);

  if (memoriaGuardada) {
    try {
      const memoria = JSON.parse(memoriaGuardada);
      return normalizarMemoria(memoria);
    } catch (error) {
      console.warn("La memoria estaba dañada. Se creó una nueva memoria.");
    }
  }

  return crearMemoriaInicial();
}

function crearMemoriaInicial() {
  return {
    estudiante: {
      nombre: "",
      grado: "",
      puntos: 0,

      correctas: 0,
      incorrectas: 0,

      palabrasAprendidas: [],
      errores: [],

      // Aprendizaje adaptativo por palabra
      palabras: {},

      progresoPorNivel: {
        nivel1: {
          correctas: 0,
          incorrectas: 0
        },
        nivel2: {
          correctas: 0,
          incorrectas: 0
        },
        nivel3: {
          correctas: 0,
          incorrectas: 0
        },
        nivel5: {
          correctas: 0,
          incorrectas: 0
        }
      },

      categoriasPracticadas: {}
    }
  };
}

function normalizarMemoria(memoria) {
  const base = crearMemoriaInicial();

  if (!memoria || typeof memoria !== "object") {
    return base;
  }

  if (!memoria.estudiante) {
    memoria.estudiante = {};
  }

  memoria.estudiante.nombre = memoria.estudiante.nombre || base.estudiante.nombre;
  memoria.estudiante.grado = memoria.estudiante.grado || base.estudiante.grado;
  memoria.estudiante.puntos = memoria.estudiante.puntos || 0;

  memoria.estudiante.correctas = memoria.estudiante.correctas || 0;
  memoria.estudiante.incorrectas = memoria.estudiante.incorrectas || 0;

  memoria.estudiante.palabrasAprendidas = memoria.estudiante.palabrasAprendidas || [];
  memoria.estudiante.errores = memoria.estudiante.errores || [];

  // Si la memoria vieja no tiene aprendizaje por palabra, se crea
  memoria.estudiante.palabras = memoria.estudiante.palabras || {};

  if (!memoria.estudiante.progresoPorNivel) {
    memoria.estudiante.progresoPorNivel = base.estudiante.progresoPorNivel;
  }

  if (!memoria.estudiante.progresoPorNivel.nivel1) {
    memoria.estudiante.progresoPorNivel.nivel1 = {
      correctas: 0,
      incorrectas: 0
    };
  }

  if (!memoria.estudiante.progresoPorNivel.nivel2) {
    memoria.estudiante.progresoPorNivel.nivel2 = {
      correctas: 0,
      incorrectas: 0
    };
  }

  if (!memoria.estudiante.progresoPorNivel.nivel3) {
    memoria.estudiante.progresoPorNivel.nivel3 = {
      correctas: 0,
      incorrectas: 0
    };
  }

  if (!memoria.estudiante.progresoPorNivel.nivel5) {
    memoria.estudiante.progresoPorNivel.nivel5 = {
      correctas: 0,
      incorrectas: 0
    };
  }

  if (!memoria.estudiante.categoriasPracticadas) {
    memoria.estudiante.categoriasPracticadas = {};
  }

  return memoria;
}

function guardarMemoria() {
  localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(Memoria));
}

function reiniciarMemoria() {
  Memoria = crearMemoriaInicial();
  guardarMemoria();
}

function exportarMemoria() {
  const datos = JSON.stringify(Memoria, null, 2);
  const blob = new Blob([datos], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = "progreso_estudiante.json";
  enlace.click();

  URL.revokeObjectURL(url);
}