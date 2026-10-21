/* ------------------------------------------------------------------
   Catálogo de la tienda.
   Para agregar un producto, copia uno de los bloques y cambia sus datos.
   - category: "WEAPON", "ARMOUR" o "SHIELD" (debe estar en MAYÚSCULAS)
   - price: en colones (₡), sin puntos ni comas
   - image: ruta dentro de la carpeta Images/
   Nombres y precios son de ejemplo: edítalos cuando quieras.
------------------------------------------------------------------- */
const PRODUCTS = [
  {
    id: 1,
    name: "Classic Shield: Oak and Iron",
    category: "SHIELD",
    price: 45000,
    image: "Images/shield-oak-iron.jpg",
    description: "Sr Duncan's shield. Seasoned oak face, iron-banded edge and a hand-painted tree of life."
  },
  {
    id: 2,
    name: "Longsword of the Seven Provinces",
    category: "WEAPON",
    price: 89000,
    image: "Images/longsword.jpg",
    description: "Balanced double-edged blade with a ringed steel guard and leather-wrapped grip."
  },
  {
    id: 3,
    name: "Plate Cuirass: Osa Gold",
    category: "ARMOUR",
    price: 185000,
    image: "Images/plate-cuirass.jpg",
    description: "Polished steel breastplate with riveted straps, built for the long road between provinces."
  },
  {
    id: 4,
    name: "Leather Brigandine & Belt",
    category: "ARMOUR",
    price: 72000,
    image: "Images/leather-brigandine.jpg",
    description: "Lightweight leather armour with a reinforced sword belt for scouts and squires."
  },
  {
    id: 5,
    name: "Articulated Vambrace (pair)",
    category: "ARMOUR",
    price: 38000,
    image: "Images/vambrace.jpg",
    description: "Fluted steel arm guards with flexible plates that move the way you do."
  },
  {
    id: 6,
    name: "Full Plate Harness: Noble Edition",
    category: "ARMOUR",
    price: 420000,
    image: "Images/full-harness.jpg",
    description: "Complete suit of plate armour, fitted to your measurements. The pride of the forge."
  },
  {
    id: 7,
    name: "Hedge Knight Kit: Helm & Round Shield",
    category: "SHIELD",
    price: 64000,
    image: "Images/helm-and-round-shield.jpg",
    description: "Battered-steel helm and a painted round shield: everything a wandering knight needs."
  }
];
