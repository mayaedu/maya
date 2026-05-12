function registrarCorrectaNivel(nivel) {
  const clave = "nivel" + nivel;

  if (!Memoria.estudiante.progresoPorNivel[clave]) {
    Memoria.estudiante.progresoPorNivel[clave] = {
      correctas: 0,
      incorrectas: 0
    };
  }

  Memoria.estudiante.progresoPorNivel[clave].correctas++;
}

function registrarIncorrectaNivel(nivel) {
  const clave = "nivel" + nivel;

  if (!Memoria.estudiante.progresoPorNivel[clave]) {
    Memoria.estudiante.progresoPorNivel[clave] = {
      correctas: 0,
      incorrectas: 0
    };
  }

  Memoria.estudiante.progresoPorNivel[clave].incorrectas++;
}

function guardarPalabraAprendida(palabra) {
  const yaExiste = Memoria.estudiante.palabrasAprendidas.some(item => {
    return item.id === palabra.id;
  });

  if (!yaExiste) {
    Memoria.estudiante.palabrasAprendidas.push({
      id: palabra.id,
      espanol: palabra.espanol,
      ingles: palabra.ingles,
      categoria: BotState.categoriaActual,
      fecha: new Date().toISOString()
    });
  }
}

function guardarError(palabra, nivel, respuestaUsuario) {
  Memoria.estudiante.errores.push({
    id: palabra.id,
    espanol: palabra.espanol,
    ingles: palabra.ingles,
    categoria: BotState.categoriaActual,
    nivel: nivel,
    respuestaUsuario: respuestaUsuario,
    fecha: new Date().toISOString()
  });
}

function registrarCategoriaPracticada(categoria) {
  if (!Memoria.estudiante.categoriasPracticadas[categoria]) {
    Memoria.estudiante.categoriasPracticadas[categoria] = {
      veces: 0,
      ultimaPractica: null
    };
  }

  Memoria.estudiante.categoriasPracticadas[categoria].veces++;
  Memoria.estudiante.categoriasPracticadas[categoria].ultimaPractica = new Date().toISOString();

  guardarMemoria();
}

function mostrarProgreso() {
  return `Progreso del estudiante:

Nombre: ${Memoria.estudiante.nombre || "Sin nombre"}
Puntos: ${Memoria.estudiante.puntos}
Correctas: ${Memoria.estudiante.correctas}
Incorrectas: ${Memoria.estudiante.incorrectas}
Palabras aprendidas: ${Memoria.estudiante.palabrasAprendidas.length}
Errores registrados: ${Memoria.estudiante.errores.length}`;
}

function mostrarProgresoPorNivel() {
  const progreso = Memoria.estudiante.progresoPorNivel;

  return `Progreso por nivel:

Nivel 1:
Correctas: ${progreso.nivel1.correctas}
Incorrectas: ${progreso.nivel1.incorrectas}

Nivel 2:
Correctas: ${progreso.nivel2.correctas}
Incorrectas: ${progreso.nivel2.incorrectas}

Nivel 3:
Correctas: ${progreso.nivel3.correctas}
Incorrectas: ${progreso.nivel3.incorrectas}

Nivel 5:
Correctas: ${progreso.nivel5.correctas}
Incorrectas: ${progreso.nivel5.incorrectas}`;
}

function mostrarErrores() {
  if (Memoria.estudiante.errores.length === 0) {
    return "No hay errores registrados todavía.";
  }

  let texto = "Errores para repasar:\n\n";

  Memoria.estudiante.errores
    .slice(-10)
    .reverse()
    .forEach((error, index) => {
      texto += `${index + 1}. ${error.espanol} = ${error.ingles}
Nivel: ${error.nivel}
Tu respuesta: ${error.respuestaUsuario || "Sin respuesta"}\n\n`;
    });

  return texto.trim();
}

function mostrarPalabrasAprendidas() {
  if (Memoria.estudiante.palabrasAprendidas.length === 0) {
    return "Todavía no hay palabras aprendidas.";
  }

  let texto = "Palabras aprendidas:\n\n";

  Memoria.estudiante.palabrasAprendidas.forEach((palabra, index) => {
    texto += `${index + 1}. ${palabra.espanol} = ${palabra.ingles}\n`;
  });

  return texto.trim();
}

function mostrarCategoriasPracticadas() {
  const categorias = Memoria.estudiante.categoriasPracticadas;

  if (!categorias || Object.keys(categorias).length === 0) {
    return "Todavía no hay categorías practicadas.";
  }

  let texto = "Categorías practicadas:\n\n";

  Object.keys(categorias).forEach((categoria, index) => {
    texto += `${index + 1}. ${categoria}
Veces practicada: ${categorias[categoria].veces}\n\n`;
  });

  return texto.trim();
}