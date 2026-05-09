function obtenerRegistroPalabra(palabra) {
  if (!Memoria.estudiante.palabras) {
    Memoria.estudiante.palabras = {};
  }

  const id = String(palabra.id);

  if (!Memoria.estudiante.palabras[id]) {
    Memoria.estudiante.palabras[id] = {
      id: palabra.id,
      espanol: palabra.espanol,
      ingles: palabra.ingles,
      categoria: BotState.categoriaActual,
      correctas: 0,
      incorrectas: 0,
      intentos: 0,
      dominio: "nuevo",
      ultimaPractica: null
    };
  }

  return Memoria.estudiante.palabras[id];
}

function registrarAprendizajeCorrecto(palabra) {
  const registro = obtenerRegistroPalabra(palabra);

  registro.correctas++;
  registro.intentos++;
  registro.ultimaPractica = new Date().toISOString();
  registro.dominio = calcularDominioPalabra(
    registro.correctas,
    registro.incorrectas
  );

  guardarMemoria();
}

function registrarAprendizajeIncorrecto(palabra) {
  const registro = obtenerRegistroPalabra(palabra);

  registro.incorrectas++;
  registro.intentos++;
  registro.ultimaPractica = new Date().toISOString();
  registro.dominio = calcularDominioPalabra(
    registro.correctas,
    registro.incorrectas
  );

  guardarMemoria();
}

function calcularDominioPalabra(correctas, incorrectas) {
  const intentos = correctas + incorrectas;

  if (intentos === 0) {
    return "nuevo";
  }

  if (incorrectas > correctas) {
    return "bajo";
  }

  if (correctas >= 5 && incorrectas <= 1) {
    return "dominado";
  }

  if (correctas >= 3 && correctas > incorrectas) {
    return "alto";
  }

  return "medio";
}

function obtenerResumenAprendizaje() {
  if (!Memoria.estudiante.palabras) {
    return "Todavía no hay datos de aprendizaje.";
  }

  const palabras = Object.values(Memoria.estudiante.palabras);

  if (palabras.length === 0) {
    return "Todavía no hay palabras practicadas.";
  }

  const nuevas = palabras.filter(p => p.dominio === "nuevo").length;
  const bajas = palabras.filter(p => p.dominio === "bajo").length;
  const medias = palabras.filter(p => p.dominio === "medio").length;
  const altas = palabras.filter(p => p.dominio === "alto").length;
  const dominadas = palabras.filter(p => p.dominio === "dominado").length;

  return `Aprendizaje del estudiante:

Palabras practicadas: ${palabras.length}

Nuevas: ${nuevas}
Dominio bajo: ${bajas}
Dominio medio: ${medias}
Dominio alto: ${altas}
Dominadas: ${dominadas}

Puntos acumulados: ${Memoria.estudiante.puntos}`;
}

function obtenerPalabrasDificiles() {
  if (!Memoria.estudiante.palabras) {
    return [];
  }

  return Object.values(Memoria.estudiante.palabras)
    .filter(p => p.dominio === "bajo" || p.incorrectas > p.correctas)
    .sort((a, b) => b.incorrectas - a.incorrectas);
}

function obtenerTextoPalabrasDificiles() {
  const dificiles = obtenerPalabrasDificiles();

  if (dificiles.length === 0) {
    return "Muy bien. No tienes palabras difíciles por ahora.";
  }

  let texto = "Palabras difíciles para repasar:\n\n";

  dificiles.forEach((p, index) => {
    texto += `${index + 1}. ${p.espanol} = ${p.ingles} | Errores: ${p.incorrectas} | Dominio: ${p.dominio}\n`;
  });

  return texto.trim();
}

function obtenerPalabrasDominadas() {
  if (!Memoria.estudiante.palabras) {
    return [];
  }

  return Object.values(Memoria.estudiante.palabras)
    .filter(p => p.dominio === "dominado")
    .sort((a, b) => b.correctas - a.correctas);
}

function obtenerTextoPalabrasDominadas() {
  const dominadas = obtenerPalabrasDominadas();

  if (dominadas.length === 0) {
    return "Todavía no hay palabras dominadas.";
  }

  let texto = "Palabras dominadas:\n\n";

  dominadas.forEach((p, index) => {
    texto += `${index + 1}. ${p.espanol} = ${p.ingles} | Correctas: ${p.correctas}\n`;
  });

  return texto.trim();
}

function obtenerRecomendacionAprendizaje() {
  const dificiles = obtenerPalabrasDificiles();

  if (dificiles.length > 0) {
    const primera = dificiles[0];

    return `Te recomiendo repasar primero:

${primera.espanol} = ${primera.ingles}

Tiene ${primera.incorrectas} error(es).`;
  }

  const palabras = Memoria.estudiante.palabras
    ? Object.values(Memoria.estudiante.palabras)
    : [];

  if (palabras.length === 0) {
    return "Empieza practicando una categoría para generar recomendaciones.";
  }

  return "Vas muy bien. Puedes practicar una categoría nueva o subir de nivel.";
}