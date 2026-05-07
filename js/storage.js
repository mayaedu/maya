let Memoria = cargarMemoria();

function cargarMemoria() {
  const memoriaGuardada = localStorage.getItem(CONFIG.STORAGE_KEY);

  if (memoriaGuardada) {
    try {
      return JSON.parse(memoriaGuardada);
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