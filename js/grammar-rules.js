function normalizarNoun(palabra) {
  palabra = limpiarTexto(palabra);

  // plural simple: sharks -> shark
  if (palabra.endsWith("s") && palabra.length > 3) {
    return palabra.slice(0, -1);
  }

  return palabra;
}

function coincideConNounObjetivo(palabra, nounObjetivo) {
  const limpia = limpiarTexto(palabra);
  const normalizada = normalizarNoun(limpia);

  return limpia === nounObjetivo || normalizada === nounObjetivo;
}

function contieneNounObjetivo(palabras, nounObjetivo) {
  return palabras.some(palabra => {
    return coincideConNounObjetivo(palabra, nounObjetivo);
  });
}

function esCantidad(palabra) {
  const cantidades = [
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "many",
    "some"
  ];

  return cantidades.includes(limpiarTexto(palabra));
}




function validarOracionGramatical(textoUsuario, palabraObjetivo) {
  const texto = limpiarTexto(textoUsuario);
  const palabras = texto.split(" ").filter(p => p.length > 0);

  const nounObjetivo = limpiarTexto(palabraObjetivo.ingles);

  if (palabras.length === 0) {
    return {
      valida: false,
      mensaje: "Escribe una oración corta en inglés."
    };
  }

  if (tienePalabrasBloqueadas(palabras)) {
    return {
      valida: false,
      mensaje: "La oración debe estar en inglés. Evita mezclar palabras en español."
    };
  }

  if (!palabras.includes(nounObjetivo)) {
    return {
      valida: false,
      mensaje: `La oración debe usar la palabra "${nounObjetivo}".`
    };
  }

  const reglas = [
    reglaNounBeAdjective,
    reglaArticleNounBeAdjective,
    reglaPronounVerbArticleNoun,
    reglaArticleNounModalActionVerb,
    reglaThisThatBeArticleNoun
  ];

  for (const regla of reglas) {
    const resultado = regla(palabras, nounObjetivo);

    if (resultado.valida) {
      return resultado;
    }
  }

  return {
    valida: false,
    mensaje: "La oración no sigue una estructura válida para este nivel."
  };
}

/*
  Regla:
  noun + verb be + adjective

  Ejemplos:
  shark is brave
  cow is big
*/
function reglaNounBeAdjective(palabras, nounObjetivo) {
  if (palabras.length !== 3) {
    return {
      valida: false
    };
  }

  const [p1, p2, p3] = palabras;

  if (
    p1 === nounObjetivo &&
    esVerbBe(p2) &&
    esAdjective(p3)
  ) {
    return {
      valida: true,
      regla: "noun + verb be + adjective",
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false
  };
}

/*
  Regla:
  article + noun + verb be + adjective

  Ejemplos:
  the shark is brave
  a cow is big
*/
function reglaArticleNounBeAdjective(palabras, nounObjetivo) {
  if (palabras.length !== 4) {
    return {
      valida: false
    };
  }

  const [p1, p2, p3, p4] = palabras;

  if (
    esArticle(p1) &&
    p2 === nounObjetivo &&
    esVerbBe(p3) &&
    esAdjective(p4)
  ) {
    return {
      valida: true,
      regla: "article + noun + verb be + adjective",
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false
  };
}

/*
  Regla:
  pronoun + action verb + article + noun

  Ejemplos:
  i see a shark
  i like the dog
*/
function reglaPronounVerbArticleNoun(palabras, nounObjetivo) {
  if (palabras.length !== 4) {
    return {
      valida: false
    };
  }

  const [p1, p2, p3, p4] = palabras;

  if (
    esPronoun(p1) &&
    esVerbAction(p2) &&
    esArticle(p3) &&
    p4 === nounObjetivo
  ) {
    return {
      valida: true,
      regla: "pronoun + action verb + article + noun",
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false
  };
}

/*
  Regla:
  article + noun + modal + action verb

  Ejemplos:
  the shark can swim
  the dog can run
*/
function reglaArticleNounModalActionVerb(palabras, nounObjetivo) {
  if (palabras.length !== 4) {
    return {
      valida: false
    };
  }

  const [p1, p2, p3, p4] = palabras;

  if (
    esArticle(p1) &&
    p2 === nounObjetivo &&
    esModal(p3) &&
    esVerbAction(p4)
  ) {
    return {
      valida: true,
      regla: "article + noun + modal + action verb",
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false
  };
}

/*
  Regla:
  this/that + verb be + article + noun

  Ejemplos:
  this is a shark
  that is a dog
*/
function reglaThisThatBeArticleNoun(palabras, nounObjetivo) {
  if (palabras.length !== 4) {
    return {
      valida: false
    };
  }

  const [p1, p2, p3, p4] = palabras;

  if (
    (p1 === "this" || p1 === "that") &&
    esVerbBe(p2) &&
    esArticle(p3) &&
    p4 === nounObjetivo
  ) {
    return {
      valida: true,
      regla: "this/that + verb be + article + noun",
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false
  };
}