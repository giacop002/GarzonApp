import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import type { Categoria, Item } from '@/constants/carta'

const TTL_CACHE = 24 * 60 * 60 * 1000 // 24 horas en ms

interface CartaState {
  categorias: Categoria[]
  items: Item[]
  cargando: boolean
  error: string | null
  ultimaActualizacion: number | null
}

interface CartaActions {
  cargarCarta: (forzar?: boolean) => Promise<void>
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

export const useCartaStore = create<CartaState & CartaActions>()(
  persist(
    (set, get) => ({
  categorias: [],
  items: [],
  cargando: false,
  error: null,
  ultimaActualizacion: null,

  cargarCarta: async (forzar = false) => {
    const { categorias, ultimaActualizacion } = get()
    // Si hay caché fresca (<24h) y no se fuerza, no recargamos.
    if (
      !forzar &&
      categorias.length > 0 &&
      ultimaActualizacion &&
      Date.now() - ultimaActualizacion < TTL_CACHE
    ) {
      return
    }
    set({ cargando: true, error: null })
    try {
      const [{ data: cats, error: e1 }, { data: its, error: e2 }] = await Promise.all([
        supabase
          .from('categorias_carta')
          .select('id, nombre, parent_id, orden, activa')
          .eq('activa', true),
        supabase
          .from('items_carta')
          .select('id, nombre, descripcion, categoria_id, precio, foto_url, disponible, orden'),
      ])
      if (e1) throw e1
      if (e2) throw e2

      const categorias: Categoria[] = (cats ?? []).map((c) => ({
        id: c.id,
        nombre: c.nombre,
        parentId: c.parent_id,
        orden: c.orden,
        activa: c.activa,
      }))
      const items: Item[] = (its ?? []).map((i) => ({
        id: i.id,
        nombre: i.nombre,
        descripcion: i.descripcion,
        categoriaId: i.categoria_id,
        precio: Number(i.precio),
        fotoUrl: i.foto_url,
        disponible: i.disponible,
        orden: i.orden,
      }))

      set({ categorias, items, cargando: false, ultimaActualizacion: Date.now() })
    } catch (err) {
      // Ante error de red, conservamos la caché previa si existe.
      set({
        cargando: false,
        error: err instanceof Error ? err.message : 'Error cargando la carta',
      })
    }
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
    }),
    {
      name: 'carta_cache',
      storage: createJSONStorage(() => AsyncStorage),
      // v2: migración a Supabase (los datos viejos usaban ids estáticos tipo slug).
      version: 2,
      // Descarta cualquier cache anterior a v2; cargarCarta() re-hidrata de Supabase.
      migrate: () => ({ categorias: [], items: [], ultimaActualizacion: null }),
      partialize: (state) => ({
        categorias: state.categorias,
        items: state.items,
        ultimaActualizacion: state.ultimaActualizacion,
      }),
    }
  )
)
