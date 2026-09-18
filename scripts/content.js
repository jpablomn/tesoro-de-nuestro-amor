/**
 * content.js
 * Configuración narrativa central de "El Tesoro de Nuestro Amor".
 * Cambia aquí nombres, textos, pistas, ayudas y el destino final
 * sin tocar el resto del código. Script clásico (sin type="module"):
 * expone todo bajo `window.TesoroConfig`.
 */
window.TesoroConfig = {
  meta: {
    title: "El Tesoro de Nuestro Amor",
    subtitle: "Una aventura para encontrar algo que vale más que todo el oro del mundo.",
    inviteeName: "Capitana",
  },

  /** Frases del narrador invisible ("El Capitán"), agrupadas por momento. Se eligen al azar dentro de cada grupo para no repetirse siempre igual. */
  narrator: {
    onMapEnter: [
      "El mapa ha revelado un nuevo camino.",
      "El capitán observa tu avance desde la distancia.",
      "Has llegado más lejos de lo que imaginas.",
    ],
    onUnlock: [
      "Una nueva ruta se dibuja ante ti.",
      "El capitán recomienda seguir la ruta.",
      "El viento ha cambiado a tu favor.",
    ],
    onComplete: [
      "Bien hecho, capitana.",
      "El tesoro está más cerca.",
      "El capitán sonríe, aunque tú no puedas verlo.",
    ],
  },

  /** Las cinco paradas, en orden. Cada una se desbloquea al completar la anterior. */
  stops: [
    {
      id: "tercer-piso",
      order: 1,
      place: "Tercer piso",
      title: "PARADA 1",
      mapCoords: { x: 20, y: 72 },
      romanceStage: 0.2,
      deliveredByPerson: false,
      unlockMessage:
        "El capitán ha marcado un lugar en las alturas de tu propio castillo. Sube. Busca con paciencia — lo que encuentres te dirá hacia dónde ir después.",
      completionMessage: "La primera pista es tuya. El mapa ya conoce tu siguiente paso.",
      secretCode: "BRUJULA",
      hints: [
        "El capitán recomienda comenzar buscando en un territorio conocido.",
        "Tu búsqueda debe continuar dentro de casa.",
        "Sube al tercer piso.",
        "Busca cuidadosamente por todo el tercer piso.",
        "Hay una pequeña tarjeta escondida.",
      ],
    },
    {
      id: "armario",
      order: 2,
      place: "Armario",
      title: "PARADA 2",
      mapCoords: { x: 32, y: 56 },
      romanceStage: 0.25,
      deliveredByPerson: false,
      unlockMessage:
        "Un buen marinero guarda sus tesoros donde nadie más mira. Abre el armario. Revisa entre lo que ya conoces — ahí duerme el siguiente rumbo.",
      completionMessage: "Segunda pista encontrada. El rumbo empieza a tomar forma.",
      secretCode: "TESORO",
      hints: [
        "El capitán confía en que ya conoces bien tu propio territorio.",
        "Lo que buscas no está a la vista, pero tampoco muy lejos.",
        "Piensa en un lugar donde guardas lo que usas cada día.",
        "Revisa el armario.",
        "Hay una pequeña tarjeta escondida entre lo que ya conoces.",
      ],
    },
    {
      id: "moto",
      order: 3,
      place: "Moto",
      title: "PARADA 3",
      mapCoords: { x: 47, y: 40 },
      romanceStage: 0.35,
      deliveredByPerson: false,
      unlockMessage:
        "Esta vez el mapa no se recorre a pie. Prepara los motores, capitana — tu próxima parada te espera donde guardas tus ruedas.",
      completionMessage:
        "Tercera pista en tus manos. Y esta vez, el capitán promete algo distinto: lo que sigue no estará escondido. Alguien más lo guarda para ti.",
      secretCode: "TIMON",
      hints: [
        "El capitán dice que esta vez no se navega a pie.",
        "Piensa en algo con motor que uses seguido.",
        "No está dentro de la casa.",
        "Ve hacia donde guardas tus ruedas.",
        "Revisa cerca de tu moto.",
      ],
    },
    {
      id: "floristeria",
      order: 4,
      place: "Floristería",
      title: "PARADA 4",
      mapCoords: { x: 62, y: 30 },
      romanceStage: 0.55,
      deliveredByPerson: true,
      unlockMessage:
        "Tu próxima pista no está escondida. Alguien la está esperando para entregártela. Preséntate en la floristería y pide lo que el capitán dejó a tu nombre.",
      completionMessage: "Cuarta pista en tus manos. El mapa ya casi no habla de tesoros de oro.",
      secretCode: "ROSA",
      hints: [
        "Esta vez el capitán no escondió nada.",
        "Alguien más guarda esta pista por ti.",
        "Ese alguien trabaja rodeado de flores.",
        "Preséntate en la floristería y menciona tu nombre.",
        "Pide la pista que el capitán dejó a tu nombre.",
      ],
    },
    {
      id: "alfajores",
      order: 5,
      place: "Alfajores",
      title: "PARADA 5",
      mapCoords: { x: 76, y: 44 },
      romanceStage: 0.65,
      deliveredByPerson: true,
      unlockMessage:
        "Un último mensajero espera con algo dulce para el camino. Ve por tus alfajores — y con ellos, la ruta hacia el verdadero tesoro.",
      completionMessage: "La última pista está en tus manos. El almacén de la familia te espera.",
      secretCode: "DULCE",
      hints: [
        "Un último mensajero espera en el camino.",
        "Esta vez tampoco hay que buscar, solo llegar.",
        "Piensa en algo dulce para el viaje.",
        "Ve al lugar donde compras tus alfajores.",
        "Pide tu pedido — ahí está la última pista.",
      ],
    },
  ],

  /** El cofre, en el almacén familiar. Se desbloquea al completar la parada 5. */
  treasure: {
    id: "tesoro",
    place: "Almacén familiar",
    title: "EL TESORO",
    mapCoords: { x: 80, y: 66 },
    romanceStage: 0.8,
    unlockMessage:
      "El camino termina en el almacén de la familia. Ahí, entre lo de siempre, te espera algo que no es de siempre.",
    revealMessage: "HAS ENCONTRADO EL TESORO",
    twistMessage: "¿Creías que este era el final? Busca dentro del tesoro.",
    nextMissionLabel: "LA ÚLTIMA MISIÓN",
  },

  /** El mapa final, dentro del cofre. Identidad visual propia, más íntima. */
  finalMap: {
    mapCoords: { x: 50, y: 14 },
    romanceStage: 0.95,
    messages: [
      "Has seguido todos los caminos que te marqué.",
      "Has encontrado cada pista.",
      "Has llegado hasta el tesoro.",
      "Pero ahora entiendes algo...",
      "El tesoro nunca estuvo realmente dentro del cofre.",
      "Porque hay tesoros que no necesitan estar escondidos.",
      "Mi verdadero tesoro siempre has sido tú.",
    ],
    closingMessages: ["Sigue la ruta.", "Tu próximo destino te espera en el almacén.", "Hay alguien esperándote."],
    /** Configuración editable del destino final. */
    destination: {
      label: "",
      notes: "",
    },
  },

  app: {
    storageKey: "tesoroDeNuestroAmor:v1",
  },
};
