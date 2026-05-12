/*
  math-geometry.js

  Módulo de Matemática - Geometría

  Este archivo contiene todo lo relacionado con geometría:
  - Figuras geométricas
  - Identificación por número de lados
  - Cantidad de lados de cada figura
  - Cálculo de perímetros
  - Generación automática de ejercicios
  - Generación automática de opciones

  No usa ejercicios predefinidos.
  Cada ejercicio se crea con funciones.
*/

const GEOMETRIA_FIGURAS = [
  {
    nombre: "triángulo",
    lados: 3,
    tipo: "polígono",
    descripcion: "El triángulo tiene 3 lados."
  },
  {
    nombre: "cuadrilátero",
    lados: 4,
    tipo: "polígono",
    descripcion: "El cuadrilátero tiene 4 lados."
  },
  {
    nombre: "cuadrado",
    lados: 4,
    tipo: "cuadrilátero",
    descripcion: "El cuadrado tiene 4 lados iguales."
  },
  {
    nombre: "rectángulo",
    lados: 4,
    tipo: "cuadrilátero",
    descripcion: "El rectángulo tiene 4 lados. Sus lados opuestos son iguales."
  },
  {
    nombre: "trapecio",
    lados: 4,
    tipo: "cuadrilátero",
    descripcion: "El trapecio tiene 4 lados."
  },
  {
    nombre: "rombo",
    lados: 4,
    tipo: "cuadrilátero",
    descripcion: "El rombo tiene 4 lados iguales."
  },
  {
    nombre: "paralelogramo",
    lados: 4,
    tipo: "cuadrilátero",
    descripcion: "El paralelogramo tiene 4 lados. Sus lados opuestos son paralelos."
  },
  {
    nombre: "pentágono",
    lados: 5,
    tipo: "polígono",
    descripcion: "El pentágono tiene 5 lados."
  },
  {
    nombre: "hexágono",
    lados: 6,
    tipo: "polígono",
    descripcion: "El hexágono tiene 6 lados."
  },
  {
    nombre: "heptágono",
    lados: 7,
    tipo: "polígono",
    descripcion: "El heptágono tiene 7 lados."
  },
  {
    nombre: "octágono",
    lados: 8,
    tipo: "polígono",
    descripcion: "El octágono tiene 8 lados."
  },
  {
    nombre: "eneágono",
    lados: 9,
    tipo: "polígono",
    descripcion: "El eneágono tiene 9 lados."
  },
  {
    nombre: "decágono",
    lados: 10,
    tipo: "polígono",
    descripcion: "El decágono tiene 10 lados."
  }
];

const MathGeometryState = {
  ejercicioActual: null,
  modoActual: "",

  ejerciciosResueltos: 0,
  correctas: 0,
  incorrectas: 0,

  ejercicioActualNumero: 0,
  totalEjerciciosNivel: 10
};

/*
  Inicia el módulo de geometría.
  Esta función se puede llamar desde app.js cuando el estudiante selecciona Matemáticas.
*/
function iniciarGeometria() {
  MathGeometryState.ejercicioActual = null;
  MathGeometryState.modoActual = "";
  MathGeometryState.ejerciciosResueltos = 0;
  MathGeometryState.correctas = 0;
  MathGeometryState.incorrectas = 0;
  MathGeometryState.ejercicioActualNumero = 0;

  BotState.estado = CONFIG.ESTADOS.PRACTICANDO;
  BotState.materiaActual = CONFIG.MATERIAS.MATEMATICAS;
  BotState.categoriaActual = "geometría";
  BotState.nivelActual = null;
  BotState.palabraActual = null;

  actualizarHeader();

  agregarMensaje(
    "Muy bien. Vamos a practicar Matemáticas.\n\nTema: Geometría.",
    "bot"
  );

  setTimeout(() => {
    mostrarMenuGeometria();
  }, 500);
}

/*
  Muestra menú de geometría.
*/
function mostrarMenuGeometria() {
  agregarMensajeConOpciones(
    "Escoge qué quieres practicar en Geometría:",
    [
      {
        texto: "Nombre de polígonos",
        accion: function() {
          MathGeometryState.modoActual = "nombre_poligonos";
          BotState.nivelActual = 1;

          iniciarRondaGeometria();
          actualizarHeader();
          mostrarEjercicioGeometria();
        }
      },
      {
        texto: "Cantidad de lados",
        accion: function() {
          MathGeometryState.modoActual = "cantidad_lados";
          BotState.nivelActual = 2;

          iniciarRondaGeometria();
          actualizarHeader();
          mostrarEjercicioGeometria();
        }
      },
      {
        texto: "Perímetros",
        accion: function() {
          MathGeometryState.modoActual = "perimetros";
          BotState.nivelActual = 3;

          iniciarRondaGeometria();
          actualizarHeader();
          mostrarEjercicioGeometria();
        }
      }
    ],
    "bot",
    true
  );
}

/*
  Reinicia datos de la ronda del nivel actual.
*/
function iniciarRondaGeometria() {
  MathGeometryState.ejercicioActual = null;
  MathGeometryState.ejercicioActualNumero = 0;
  MathGeometryState.ejerciciosResueltos = 0;
  MathGeometryState.correctas = 0;
  MathGeometryState.incorrectas = 0;
}

/*
  Muestra ejercicio según el modo seleccionado.
*/
function mostrarEjercicioGeometria() {
  if (MathGeometryState.ejercicioActualNumero >= MathGeometryState.totalEjerciciosNivel) {
    terminarNivelGeometria();
    return;
  }

  let ejercicio;

  if (MathGeometryState.modoActual === "nombre_poligonos") {
    ejercicio = generarEjercicioNombrePoligono();

  } else if (MathGeometryState.modoActual === "cantidad_lados") {
    ejercicio = generarEjercicioCantidadLados();

  } else if (MathGeometryState.modoActual === "perimetros") {
    ejercicio = generarEjercicioPerimetro();

  } else {
    mostrarMenuGeometria();
    return;
  }

  MathGeometryState.ejercicioActualNumero++;
  MathGeometryState.ejercicioActual = ejercicio;

  const opciones = ejercicio.opciones.map(opcion => {
    return {
      texto: opcion.texto,
      accion: function() {
        revisarRespuestaGeometria(opcion.valor);
      }
    };
  });

  agregarMensajeConOpciones(
    `Ejercicio ${MathGeometryState.ejercicioActualNumero} de ${MathGeometryState.totalEjerciciosNivel}\n\n` +
    ejercicio.pregunta,
    opciones,
    "bot",
    true
  );
}

/*
  Genera ejercicio:
  ¿Qué nombre recibe un polígono que tiene X lados?
*/
function generarEjercicioNombrePoligono() {
  const figuras = obtenerPoligonosPrincipales();

  const correcta = figuras[Math.floor(Math.random() * figuras.length)];

  const incorrectas = figuras
    .filter(figura => figura.nombre !== correcta.nombre)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);

  const opciones = mezclarArray([correcta, ...incorrectas]).map(figura => {
    return {
      texto: capitalizar(figura.nombre),
      valor: figura.nombre,
      correcta: figura.nombre === correcta.nombre
    };
  });

  return {
    tipo: "nombre_poligono",
    pregunta: `¿Qué nombre recibe un polígono que tiene ${correcta.lados} lados?`,
    respuesta: correcta.nombre,
    respuestaTexto: capitalizar(correcta.nombre),
    explicacion: correcta.descripcion,
    solucion: `Un polígono de ${correcta.lados} lados se llama ${correcta.nombre}.`,
    opciones
  };
}

/*
  Genera ejercicio:
  ¿Cuántos lados tiene un hexágono?
*/
function generarEjercicioCantidadLados() {
  const figuras = obtenerFigurasParaCantidadLados();

  const correcta = figuras[Math.floor(Math.random() * figuras.length)];

  const opciones = generarOpcionesNumericas(correcta.lados, "");

  return {
    tipo: "cantidad_lados",
    pregunta: `¿Cuántos lados tiene un ${correcta.nombre}?`,
    respuesta: correcta.lados,
    respuestaTexto: String(correcta.lados),
    explicacion: correcta.descripcion,
    solucion: `${capitalizar(correcta.nombre)} tiene ${correcta.lados} lados.`,
    opciones
  };
}

/*
  Genera ejercicio aleatorio de perímetro.
*/
function generarEjercicioPerimetro() {
  const tipos = [
    generarPerimetroTriangulo,
    generarPerimetroCuadrado,
    generarPerimetroRectangulo,
    generarPerimetroTrapecio,
    generarPerimetroRombo,
    generarPerimetroParalelogramo,
    generarPerimetroPentagono,
    generarPerimetroHexagono
  ];

  const funcion = tipos[Math.floor(Math.random() * tipos.length)];

  return funcion();
}

/*
  Perímetro de triángulo.
  P = lado1 + lado2 + lado3
*/
function generarPerimetroTriangulo() {
  const lado1 = numeroAleatorio(3, 15);
  const lado2 = numeroAleatorio(3, 15);
  const lado3 = numeroAleatorio(3, 15);

  const respuesta = lado1 + lado2 + lado3;

  return crearEjercicioPerimetro({
    figura: "triángulo",
    pregunta: `Calcula el perímetro de un triángulo con lados de ${lado1} cm, ${lado2} cm y ${lado3} cm.`,
    formula: "P = lado 1 + lado 2 + lado 3",
    solucion: `P = ${lado1} + ${lado2} + ${lado3} = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de cuadrado.
  P = lado × 4
*/
function generarPerimetroCuadrado() {
  const lado = numeroAleatorio(3, 20);
  const respuesta = lado * 4;

  return crearEjercicioPerimetro({
    figura: "cuadrado",
    pregunta: `Calcula el perímetro de un cuadrado que tiene cada lado de ${lado} cm.`,
    formula: "P = lado × 4",
    solucion: `P = ${lado} × 4 = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de rectángulo.
  P = 2 × (base + altura)
*/
function generarPerimetroRectangulo() {
  const base = numeroAleatorio(5, 25);
  const altura = numeroAleatorio(3, 18);

  const respuesta = 2 * (base + altura);

  return crearEjercicioPerimetro({
    figura: "rectángulo",
    pregunta: `Calcula el perímetro de un rectángulo con base de ${base} cm y altura de ${altura} cm.`,
    formula: "P = 2 × (base + altura)",
    solucion: `P = 2 × (${base} + ${altura}) = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de trapecio.
  P = lado1 + lado2 + lado3 + lado4
*/
function generarPerimetroTrapecio() {
  const baseMayor = numeroAleatorio(12, 30);
  const baseMenor = numeroAleatorio(6, 18);
  const lado1 = numeroAleatorio(5, 20);
  const lado2 = numeroAleatorio(5, 20);

  const respuesta = baseMayor + baseMenor + lado1 + lado2;

  return crearEjercicioPerimetro({
    figura: "trapecio",
    pregunta: `Calcula el perímetro de un trapecio con lados de ${baseMayor} cm, ${baseMenor} cm, ${lado1} cm y ${lado2} cm.`,
    formula: "P = lado 1 + lado 2 + lado 3 + lado 4",
    solucion: `P = ${baseMayor} + ${baseMenor} + ${lado1} + ${lado2} = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de rombo.
  P = lado × 4
*/
function generarPerimetroRombo() {
  const lado = numeroAleatorio(4, 18);
  const respuesta = lado * 4;

  return crearEjercicioPerimetro({
    figura: "rombo",
    pregunta: `Calcula el perímetro de un rombo que tiene cada lado de ${lado} cm.`,
    formula: "P = lado × 4",
    solucion: `P = ${lado} × 4 = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de paralelogramo.
  P = 2 × (base + lado)
*/
function generarPerimetroParalelogramo() {
  const base = numeroAleatorio(6, 25);
  const lado = numeroAleatorio(4, 18);

  const respuesta = 2 * (base + lado);

  return crearEjercicioPerimetro({
    figura: "paralelogramo",
    pregunta: `Calcula el perímetro de un paralelogramo con base de ${base} cm y lado de ${lado} cm.`,
    formula: "P = 2 × (base + lado)",
    solucion: `P = 2 × (${base} + ${lado}) = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de pentágono regular.
  P = lado × 5
*/
function generarPerimetroPentagono() {
  const lado = numeroAleatorio(3, 15);
  const respuesta = lado * 5;

  return crearEjercicioPerimetro({
    figura: "pentágono",
    pregunta: `Calcula el perímetro de un pentágono regular que tiene cada lado de ${lado} cm.`,
    formula: "P = lado × 5",
    solucion: `P = ${lado} × 5 = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Perímetro de hexágono regular.
  P = lado × 6
*/
function generarPerimetroHexagono() {
  const lado = numeroAleatorio(3, 15);
  const respuesta = lado * 6;

  return crearEjercicioPerimetro({
    figura: "hexágono",
    pregunta: `Calcula el perímetro de un hexágono regular que tiene cada lado de ${lado} cm.`,
    formula: "P = lado × 6",
    solucion: `P = ${lado} × 6 = ${respuesta} cm`,
    respuesta,
    unidad: "cm"
  });
}

/*
  Crea ejercicio de perímetro con opciones.
*/
function crearEjercicioPerimetro(datos) {
  const opciones = generarOpcionesNumericas(datos.respuesta, datos.unidad);

  return {
    tipo: "perimetro",
    pregunta:
      `Figura: ${capitalizar(datos.figura)}\n\n` +
      `${datos.pregunta}\n\n` +
      `Fórmula: ${datos.formula}\n\n` +
      `Escoge la respuesta correcta:`,
    respuesta: datos.respuesta,
    respuestaTexto: `${datos.respuesta} ${datos.unidad}`,
    explicacion: "Para calcular el perímetro se suman todos los lados de la figura.",
    solucion: datos.solucion,
    unidad: datos.unidad,
    opciones
  };
}

/*
  Revisa respuesta seleccionada.
*/
/*
  Revisa respuesta seleccionada.
*/
function revisarRespuestaGeometria(respuestaUsuario) {
  const ejercicio = MathGeometryState.ejercicioActual;

  if (!ejercicio) {
    agregarMensaje(
      "No hay ejercicio activo. Vamos a crear uno nuevo.",
      "bot"
    );

    mostrarEjercicioGeometria();
    return;
  }

  MathGeometryState.ejerciciosResueltos++;

  const correcta = String(respuestaUsuario) === String(ejercicio.respuesta);

  if (correcta) {
    MathGeometryState.correctas++;

    agregarMensajeResultadoGeometria(
      `Correcto. Muy bien.

${ejercicio.explicacion}

Solución:
${ejercicio.solucion}`,
      true
    );

  } else {
    MathGeometryState.incorrectas++;

    agregarMensajeResultadoGeometria(
      `Casi. La respuesta correcta era: ${ejercicio.respuestaTexto}.

${ejercicio.explicacion}

Solución:
${ejercicio.solucion}`,
      false
    );
  }

  setTimeout(() => {
    mostrarEjercicioGeometria();
  }, 900);
}

/*
  Termina el nivel actual de geometría.
*/
function terminarNivelGeometria() {
  const total = MathGeometryState.totalEjerciciosNivel;
  const correctas = MathGeometryState.correctas;
  const incorrectas = MathGeometryState.incorrectas;

  let mensajeEvaluacion = "";

  if (correctas === total) {
    mensajeEvaluacion = "Excelente. Respondiste todo correctamente.";
  } else if (correctas >= 7) {
    mensajeEvaluacion = "Muy bien. Vas avanzando bastante bien.";
  } else if (correctas >= 5) {
    mensajeEvaluacion = "Buen intento. Te recomiendo practicar un poco más.";
  } else {
    mensajeEvaluacion = "Necesitas reforzar este tema. Podemos intentarlo otra vez.";
  }

  agregarMensaje(
    `Terminaste el nivel de Geometría.

Resultado:
Ejercicios: ${total}
Correctas: ${correctas}
Incorrectas: ${incorrectas}

${mensajeEvaluacion}`,
    "bot"
  );

  setTimeout(() => {
    mostrarOpcionesFinalNivelGeometria();
  }, 700);
}

/*
  Opciones que aparecen solo al final del nivel.
*/
function mostrarOpcionesFinalNivelGeometria() {
  agregarMensajeConOpciones(
    "¿Qué quieres hacer ahora?",
    [
      {
        texto: "Repetir nivel",
        accion: function() {
          iniciarRondaGeometria();
          mostrarEjercicioGeometria();
        }
      },
      {
        texto: "Cambiar tema",
        accion: function() {
          MathGeometryState.modoActual = "";
          BotState.nivelActual = null;
          actualizarHeader();
          mostrarMenuGeometria();
        }
      },
      {
        texto: "Salir",
        accion: function() {
          terminarPracticaGeometria();
        }
      }
    ],
    "bot",
    true
  );
}

/*
  Termina práctica de geometría.
*/
function terminarPracticaGeometria() {
  agregarMensaje(
    `Terminaste la práctica de Geometría.

Ejercicios resueltos: ${MathGeometryState.ejerciciosResueltos}
Correctas: ${MathGeometryState.correctas}
Incorrectas: ${MathGeometryState.incorrectas}

Puedes escoger otra materia cuando quieras.`,
    "bot"
  );

  MathGeometryState.ejercicioActual = null;
  MathGeometryState.modoActual = "";
  MathGeometryState.ejercicioActualNumero = 0;

  BotState.estado = CONFIG.ESTADOS.ESPERANDO_MATERIA;
  BotState.materiaActual = "";
  BotState.categoriaActual = "";
  BotState.nivelActual = null;
  BotState.palabraActual = null;

  actualizarHeader();

  setTimeout(() => {
    if (typeof mostrarMenuMaterias === "function") {
      mostrarMenuMaterias();
    }
  }, 800);
}

/*
  Devuelve polígonos principales de 3 a 10 lados.
*/
function obtenerPoligonosPrincipales() {
  return GEOMETRIA_FIGURAS.filter(figura => {
    return figura.tipo === "polígono" && figura.lados >= 3 && figura.lados <= 10;
  });
}

/*
  Devuelve figuras para preguntar cantidad de lados.
*/
function obtenerFigurasParaCantidadLados() {
  return GEOMETRIA_FIGURAS.filter(figura => {
    return figura.lados >= 3 && figura.lados <= 10;
  });
}


/*
  Muestra una card de resultado para geometría.
  Si la respuesta es correcta, usa verde suave.
  Si la respuesta es incorrecta, usa rojo suave.
*/
function agregarMensajeResultadoGeometria(texto, correcta) {
  const mensaje = document.createElement("div");

  mensaje.classList.add("message", "bot", "math-result-card");

  if (correcta) {
    mensaje.classList.add("math-result-correct");

    // Refuerzo visual directo por si el CSS queda cacheado.
    mensaje.style.backgroundColor = "#dcfce7";
    mensaje.style.color = "#14532d";
    mensaje.style.borderColor = "#86efac";

  } else {
    mensaje.classList.add("math-result-wrong");

    // Refuerzo visual directo por si el CSS queda cacheado.
    mensaje.style.backgroundColor = "#fee2e2";
    mensaje.style.color = "#7f1d1d";
    mensaje.style.borderColor = "#fca5a5";
  }

  mensaje.style.borderWidth = "1px";
  mensaje.style.borderStyle = "solid";

  mensaje.textContent = texto;

  chatBox.appendChild(mensaje);

  if (typeof guardarMensajeEnHistorial === "function") {
    guardarMensajeEnHistorial(texto, "bot", {
      clase: correcta ? "math_result_correct" : "math_result_wrong"
    });
  }

  hacerScrollAbajo();
}

/*
  Genera opciones numéricas:
  - 1 correcta
  - 2 incorrectas cercanas
  
*/
function generarOpcionesNumericas(respuestaCorrecta, unidad = "") {
  const opciones = new Set();

  opciones.add(Number(respuestaCorrecta));

  while (opciones.size < 3) {
    const variacion = numeroAleatorio(1, 8);
    const signo = Math.random() < 0.5 ? -1 : 1;

    let falsa = Number(respuestaCorrecta) + variacion * signo;

    if (falsa <= 0) {
      falsa = Number(respuestaCorrecta) + variacion;
    }

    opciones.add(falsa);
  }

  return mezclarArray(
    Array.from(opciones).map(valor => {
      return {
        valor,
        texto: unidad ? `${valor} ${unidad}` : String(valor),
        correcta: valor === Number(respuestaCorrecta)
      };
    })
  );
}



