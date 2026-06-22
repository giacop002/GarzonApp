import { create } from 'zustand'
import { CATEGORIAS, ITEMS, Categoria, Item } from '@/constants/carta'

interface CartaState {
  categorias: Categoria[]
  items: Item[]
  cargando: boolean
  error: string | null
  ultimaActualizacion: number | null
}

interface CartaActions {
  cargarCarta: () => Promise<void>
  getCategoriaById: (id: string) => Categoria | undefined
  getSubcategorias: (parentId: string | null) => Categoria[]
  getItemsByCategoria: (categoriaId: string) => Item[]
  getItemById: (id: string) => Item | undefined
  // Devuelve true si la categoría tiene subcategorías hijas (nodo intermedio).
  tieneSubcategorias: (categoriaId: string) => boolean
  // Ancestros desde la raíz hasta la categoría dada (para breadcrumb).
  getAncestros: (categoriaId: string) => Categoria[]
  // Fase 3: evalúa el campo estático `disponible`. Fase 5: reglas de Supabase.
  isItemDisponible: (itemId: string) => boolean
}

export const useCartaStore = create<CartaState & CartaActions>((set, get) => ({
  categorias: [],
  items: [],
  cargando: false,
  error: null,
  ultimaActualizacion: null,

  cargarCarta: async () => {
    set({ cargando: true, error: null })
    // Fase 3: datos estáticos. Fase 5: fetch a Supabase.
    set({
      categorias: CATEGORIAS.filter((c) => c.activa),
      items: ITEMS,
      cargando: false,
      ultimaActualizacion: Date.now(),
    })
  },

  getCategoriaById: (id) => get().categorias.find((c) => c.id === id),

  getSubcategorias: (parentId) =>
    get()
      .categorias.filter((c) => c.parentId === parentId)
      .sort((a, b) => a.orden - b.orden),

  getItemsByCategoria: (categoriaId) =>
    get()
      .items.filter((i) => i.categoriaId === categoriaId)
      .sort((a, b) => a.orden - b.orden),

  getItemById: (id) => get().items.find((i) => i.id === id),

  tieneSubcategorias: (categoriaId) =>
    get().categorias.some((c) => c.parentId === categoriaId),

  getAncestros: (categoriaId) => {
    const { categorias } = get()
    const ancestros: Categoria[] = []
    let actual = categorias.find((c) => c.id === categoriaId)
    while (actual) {
      ancestros.unshift(actual)
      actual = actual.parentId
        ? categorias.find((c) => c.id === actual!.parentId)
        : undefined
    }
    return ancestros
  },

  isItemDisponible: (itemId) => {
    const item = get().items.find((i) => i.id === itemId)
    return item?.disponible ?? false
  },
}))
