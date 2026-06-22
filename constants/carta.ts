// Datos estáticos de la carta — Fase 3.
// Categorías autorreferenciales (árbol) + ítems.
// En Fase 5 migran a Supabase (categorias_carta + items_carta) sin cambiar
// el código que los consume (solo cambia cargarCarta()).

export interface Categoria {
  id: string
  nombre: string
  parentId: string | null
  orden: number
  activa: boolean
}

export interface Item {
  id: string
  nombre: string
  descripcion: string | null
  categoriaId: string
  precio: number
  fotoUrl: string | null
  disponible: boolean
  orden: number
}

export const CATEGORIAS: Categoria[] = [
  // Raíces
  { id: 'cat-bebidas', nombre: 'Bebidas', parentId: null, orden: 0, activa: true },
  { id: 'cat-entradas', nombre: 'Entradas', parentId: null, orden: 1, activa: true },
  { id: 'cat-fondo', nombre: 'Platos de Fondo', parentId: null, orden: 2, activa: true },

  // Bebidas › nivel 2
  { id: 'cat-calientes', nombre: 'Calientes', parentId: 'cat-bebidas', orden: 0, activa: true },
  { id: 'cat-frias', nombre: 'Frías', parentId: 'cat-bebidas', orden: 1, activa: true },

  // Bebidas › Calientes › nivel 3
  { id: 'cat-infusiones', nombre: 'Infusiones', parentId: 'cat-calientes', orden: 0, activa: true },
  { id: 'cat-cafes', nombre: 'Cafés', parentId: 'cat-calientes', orden: 1, activa: true },

  // Bebidas › Frías › nivel 3
  { id: 'cat-jugos', nombre: 'Jugos', parentId: 'cat-frias', orden: 0, activa: true },
  { id: 'cat-aguas', nombre: 'Aguas', parentId: 'cat-frias', orden: 1, activa: true },

  // Entradas › nivel 2
  { id: 'cat-sopas', nombre: 'Sopas', parentId: 'cat-entradas', orden: 0, activa: true },
  { id: 'cat-ensaladas', nombre: 'Ensaladas', parentId: 'cat-entradas', orden: 1, activa: true },
  // 'cat-fondo' es una categoría hoja directa: tiene ítems sin subcategorías.
]

export const ITEMS: Item[] = [
  // Infusiones
  { id: 'item-te-menta', nombre: 'Té de Menta', descripcion: null, categoriaId: 'cat-infusiones', precio: 1800, fotoUrl: null, disponible: true, orden: 0 },
  { id: 'item-manzanilla', nombre: 'Manzanilla', descripcion: null, categoriaId: 'cat-infusiones', precio: 1800, fotoUrl: null, disponible: true, orden: 1 },
  // Cafés
  { id: 'item-cafe-americano', nombre: 'Café Americano', descripcion: null, categoriaId: 'cat-cafes', precio: 2200, fotoUrl: null, disponible: true, orden: 0 },
  // Jugos
  { id: 'item-jugo-naranja', nombre: 'Jugo de Naranja', descripcion: 'Exprimido al momento', categoriaId: 'cat-jugos', precio: 2500, fotoUrl: null, disponible: true, orden: 0 },
  { id: 'item-jugo-frutilla', nombre: 'Jugo de Frutilla', descripcion: 'No disponible en invierno', categoriaId: 'cat-jugos', precio: 2500, fotoUrl: null, disponible: false, orden: 1 },
  // Aguas
  { id: 'item-agua-mineral', nombre: 'Agua Mineral', descripcion: null, categoriaId: 'cat-aguas', precio: 1500, fotoUrl: null, disponible: true, orden: 0 },
  // Sopas
  { id: 'item-sopa-dia', nombre: 'Sopa del día', descripcion: null, categoriaId: 'cat-sopas', precio: 3200, fotoUrl: null, disponible: true, orden: 0 },
  // Ensaladas
  { id: 'item-ensalada-cesar', nombre: 'Ensalada César', descripcion: 'Pollo, croutones, parmesano', categoriaId: 'cat-ensaladas', precio: 4500, fotoUrl: null, disponible: true, orden: 0 },
  // Platos de Fondo (ítems directos en categoría raíz)
  { id: 'item-milanesa', nombre: 'Milanesa con papas', descripcion: null, categoriaId: 'cat-fondo', precio: 6800, fotoUrl: null, disponible: true, orden: 0 },
  { id: 'item-bife', nombre: 'Bife de Chorizo', descripcion: 'Con guarnición a elección', categoriaId: 'cat-fondo', precio: 8500, fotoUrl: null, disponible: true, orden: 1 },
]
