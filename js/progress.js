function guardarPalabraAprendida(palabra) {
  const existe = Memoria.estudiante.palabrasAprendidas.some(item => {
    return item.id === palabra.id;
  });

  if (!existe) {
    Memoria.estudiante.palabrasAprendidas.push({
      id: palabra.id,
      espanol: palabra.espanol,
      ingles: palabra.ingles,
      categoria: BotState.categoriaActual
    });
  }
}

function guardarError(palabra, nivel, respuestaUsuario = "") {
  Memoria.estudiante.errores.push({
    id: palabra.id,
    espanol: palabra.espanol,
    ingles: palabra.ingles,
    categoria: BotState.categoriaActual,
    nivel: nivel,
    respuestaUsuario: respuestaUsuario
  });
}

function registrarCategoriaPracticada(categoria) {
  if (!Memoria.estudiante.categoriasPracticadas[categoria]) {
    Memoria.estudiante.categoriasPracticadas[categoria] = 0;
  }

  Memoria.estudiante.categoriasPracticadas[categoria]++;
}

function registrarCorrectaNivel(nivel) {
  const clave = `nivel${nivel}`;

  if (!Memoria.estudiante.progresoPorNivel[clave]) {
    Memoria.estudiante.progresoPorNivel[clave] = {
      correctas: 0,
      incorrectas: 0
    };
  }

  Memoria.estudiante.progresoPorNivel[clave].correctas++;
}

function registrarIncorrectaNivel(nivel) {
  const clave = `nivel${nivel}`;

  if (!Memoria.estudiante.progresoPorNivel[clave]) {
    Memoria.estudiante.progresoPorNivel[clave] = {
      correctas: 0,
      incorrectas: 0
    };
  }

  Memoria.estudiante.progresoPorNivel[clave].incorrectas++;
}

function mostrarProgreso() {
  return `Progreso del estudiante:

Puntos: ${Memoria.estudiante.puntos}
Correctas: ${Memoria.estudiante.correctas}
Incorrectas: ${Memoria.estudiante.incorrectas}
Palabras aprendidas: ${Memoria.estudiante.palabrasAprendidas.length}
Errores guardados: ${Memoria.estudiante.errores.length}`;
}

function mostrarProgresoPorNivel() {
  const niveles = Memoria.estudiante.progresoPorNivel;

  return `Progreso por nivel:

Nivel 1:
Correctas: ${niveles.nivel1.correctas}
Incorrectas: ${niveles.nivel1.incorrectas}

Nivel 2:
Correctas: ${niveles.nivel2.correctas}
Incorrectas: ${niveles.nivel2.incorrectas}

Nivel 3:
Correctas: ${niveles.nivel3.correctas}
Incorrectas: ${niveles.nivel3.incorrectas}

Nivel 5:
Correctas: ${niveles.nivel5.correctas}
Incorrectas: ${niveles.nivel5.incorrectas}`;
}

function mostrarErrores() {
  if (Memoria.estudiante.errores.length === 0) {
    return "Muy bien. No tienes errores guardados.";
  }

  let respuesta = "Palabras para repasar:\n";

  Memoria.estudiante.errores.forEach((error, index) => {
    respuesta += `${index + 1}. ${error.espanol} = ${error.ingles} | Nivel ${error.nivel}\n`;
  });

  return respuesta;
}

function mostrarPalabrasAprendidas() {
  if (Memoria.estudiante.palabrasAprendidas.length === 0) {
    return "Todavía no tienes palabras aprendidas.";
  }

  let respuesta = "Palabras aprendidas:\n";

  Memoria.estudiante.palabrasAprendidas.forEach((palabra, index) => {
    respuesta += `${index + 1}. ${palabra.espanol} = ${palabra.ingles}\n`;
  });

  return respuesta;
}