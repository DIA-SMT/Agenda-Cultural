import type { Category } from "@/types/domain";

// Un emoji por categoría para los "stickers" de la portada. Las claves son los slugs que hay en la base
// (casi todos vienen del WordPress viejo); las categorías nuevas del panel caen en las palabras clave de abajo.
const bySlug: Record<string, string> = {
  "acrobacia-en-tela": "🎪",
  ambiente: "🌿",
  anime: "📺",
  arte: "🖼️",
  bienestar: "🌸",
  bijouterie: "💍",
  "bordado-y-pedreria": "🧵",
  canto: "🎤",
  ceramica: "🏺",
  charla: "💬",
  cine: "🎬",
  cocina: "🍳",
  comedia: "😂",
  "corte-y-confeccion": "✂️",
  costura: "🪡",
  danza: "💃",
  "deco-hogar": "🪴",
  deportes: "⚽",
  desfile: "👗",
  dibujo: "✏️",
  "encuentro-comunitario": "🤝",
  "encuentro-religioso": "🕊️",
  familia: "🎈",
  "ferias-artesanos": "🧺",
  "ferias-gastronomicas": "🥟",
  "ferias-navidenas": "🎄",
  filatelia: "📮",
  folklore: "🥁",
  fotografia: "📷",
  gimnasia: "🤸",
  grafologia: "🖋️",
  historia: "🏛️",
  juegos: "🎲",
  "juventud-y-ninez": "🧒",
  literatura: "📚",
  manualidades: "🖍️",
  musica: "🎵",
  navideno: "🎄",
  origami: "🦢",
  pintura: "🎨",
  radio: "📻",
  reciclado: "♻️",
  representacion: "🎭",
  salud: "🩺",
  sublimacion: "👕",
  taekwondo: "🥋",
  teatro: "🎭",
  tejido: "🧶",
  turismo: "🗺️",
  yoga: "🧘",
};

// Para slugs que no están arriba: la primera palabra clave que aparezca en el slug decide.
const byKeyword: [string, string][] = [
  ["feria", "🛍️"],
  ["taller", "🛠️"],
  ["music", "🎵"],
  ["danza", "💃"],
  ["baile", "💃"],
  ["teatro", "🎭"],
  ["cine", "🎬"],
  ["libro", "📚"],
  ["literatur", "📚"],
  ["deporte", "⚽"],
  ["navid", "🎄"],
  ["cocina", "🍳"],
  ["gastronom", "🍳"],
];

const fallback = "✨";

export function categoryEmoji(category: Pick<Category, "slug">): string {
  return bySlug[category.slug] ?? byKeyword.find(([keyword]) => category.slug.includes(keyword))?.[1] ?? fallback;
}
