/*
  level5.js

  Nivel 5:
  El estudiante debe escribir una oración corta en inglés
  usando la palabra que se está trabajando.

  Reglas simples permitidas:

  1. noun + verb be + adjective
     horse is brave

  2. article + noun + verb be + adjective
     the horse is brave

  3. pronoun + action verb + article + noun
     i see a horse

  4. article + noun + modal + action verb
     the horse can run
*/

function mostrarPreguntaNivel5(palabra) {
  const word = escaparHTML(palabra.ingles);

  agregarMensajeConImagenHTML(
    `Escribe una oración corta en inglés usando la palabra <strong>"${word}"</strong>.<br><br>
Ejemplos válidos:<br><br>
1. The <strong>${word}</strong> is brave.<br>
2. A <strong>${word}</strong> is happy.<br>
3. I see a <strong>${word}</strong>.<br>
4. I like the <strong>${word}</strong>.<br>
5. This is a <strong>${word}</strong>.<br>
6. My <strong>${word}</strong> is happy.<br>
7. The <strong>${word}</strong> can run.`,
    palabra.imagen,
    "bot"
  );
}

function revisarNivel5(textoUsuario) {
  if (!BotState.dictionaryCargado) {
    respuestaIncorrecta(
      "El diccionario todavía no está cargado. Revisa el archivo data/dictionary.json.",
      textoUsuario
    );
    return;
  }

  const resultado = validarOracionSimple(textoUsuario, BotState.palabraActual);

  if (resultado.valida) {
    respuestaCorrecta();
    return;
  }

  let ayuda = resultado.mensaje;

ayuda += `

Ejemplos válidos:
- ${BotState.palabraActual.ingles} is big.
- The ${BotState.palabraActual.ingles} is brave.
- A ${BotState.palabraActual.ingles} is happy.
- I see a ${BotState.palabraActual.ingles}.
- I like the ${BotState.palabraActual.ingles}.
- This is a ${BotState.palabraActual.ingles}.
- My ${BotState.palabraActual.ingles} is happy.
- The ${BotState.palabraActual.ingles} can run.`;

  respuestaIncorrecta(ayuda, textoUsuario);
}

function validarOracionSimple(textoUsuario, palabraObjetivo) {
  const texto = limpiarTexto(textoUsuario);
  const palabras = texto.split(" ").filter(p => p.length > 0);
  const nounObjetivo = limpiarTexto(palabraObjetivo.ingles);

  if (palabras.length < 3) {
    return {
      valida: false,
      mensaje: "La oración está muy corta."
    };
  }

  if (tienePalabrasBloqueadas(palabras)) {
    return {
      valida: false,
      mensaje: "La oración debe estar en inglés. Evita palabras en español."
    };
  }

  if (!palabras.includes(nounObjetivo)) {
    return {
      valida: false,
      mensaje: `La oración debe usar la palabra "${nounObjetivo}".`
    };
  }

  if (reglaNounBeAdjective(palabras, nounObjetivo)) {
    return {
      valida: true,
      mensaje: "Oración correcta."
    };
  }

  if (reglaArticleNounBeAdjective(palabras, nounObjetivo)) {
    return {
      valida: true,
      mensaje: "Oración correcta."
    };
  }

  if (reglaPronounVerbArticleNoun(palabras, nounObjetivo)) {
    return {
      valida: true,
      mensaje: "Oración correcta."
    };
  }

  if (reglaArticleNounModalVerb(palabras, nounObjetivo)) {
    return {
      valida: true,
      mensaje: "Oración correcta."
    };
  }

  return {
    valida: false,
    mensaje: "La oración no sigue una estructura válida para este nivel."
  };
}

function reglaNounBeAdjective(palabras, nounObjetivo) {
  if (palabras.length !== 3) return false;

  const [p1, p2, p3] = palabras;

  return (
    p1 === nounObjetivo &&
    esVerbBe(p2) &&
    esAdjective(p3)
  );
}

function reglaArticleNounBeAdjective(palabras, nounObjetivo) {
  if (palabras.length !== 4) return false;

  const [p1, p2, p3, p4] = palabras;

  return (
    esArticle(p1) &&
    p2 === nounObjetivo &&
    esVerbBe(p3) &&
    esAdjective(p4)
  );
}

function reglaPronounVerbArticleNoun(palabras, nounObjetivo) {
  if (palabras.length !== 4) return false;

  const [p1, p2, p3, p4] = palabras;

  return (
    esPronoun(p1) &&
    esVerbAction(p2) &&
    esArticle(p3) &&
    p4 === nounObjetivo
  );
}

function reglaArticleNounModalVerb(palabras, nounObjetivo) {
  if (palabras.length !== 4) return false;

  const [p1, p2, p3, p4] = palabras;

  return (
    esArticle(p1) &&
    p2 === nounObjetivo &&
    esModal(p3) &&
    esVerbAction(p4)
  );
}

/*
  this/that + verb be + article + noun
  Ejemplo:
  this is a dog
  that is a cow
*/
function reglaThisThatBeArticleNoun(palabras, nounObjetivo) {
  if (palabras.length !== 4) return false;

  const [p1, p2, p3, p4] = palabras;

  return (
    (p1 === "this" || p1 === "that") &&
    esVerbBe(p2) &&
    esArticle(p3) &&
    p4 === nounObjetivo
  );
}

/*
  possessive + noun + verb be + adjective
  Ejemplo:
  my dog is happy
  our cat is small
*/
function reglaPossessiveNounBeAdjective(palabras, nounObjetivo) {
  if (palabras.length !== 4) return false;

  const [p1, p2, p3, p4] = palabras;

  return (
    (p1 === "my" || p1 === "our") &&
    p2 === nounObjetivo &&
    esVerbBe(p3) &&
    esAdjective(p4)
  );
}