import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Mesa, Zona } from '@/constants/mesas'

export type EstadoMesaTipo =
  | 'libre'
  | 'ocupada'
  | 'esperando_cierre'
  | 'reservada'

export interface EstadoMesa {
  mesaId: string
  estado: EstadoMesaTipo
  garzonId: string | null
}

interface MesasState {
  mesas: Mesa[]
  zonas: Zona[]
  estadosMesa: Record<string, EstadoMesa>
  mesaSeleccionada: string | null
  cargando: boolean
  error: string | null
}

interface MesasActions {
  cargarMesas: () => Promise<void>
  seleccionarMesa: (mesaId: string | null) => void
  actualizarEstadoMesa: (mesaId: string, estado: EstadoMesaTipo) => void
  getMesaById: (id: string) => Mesa | undefined
  getMesaByNumero: (numero: number) => Mesa | undefined
  getMesasPorZona: (zonaId: string) => Mesa[]
  getMesasVirtuales: () => Mesa[]
  getEstadoMesa: (mesaId: string) => EstadoMesa | undefined
  getZonaById: (id: string) => Zona | undefined
  // Reinicia todos los estados a 'libre' (fin de turno / logout).
  reiniciarEstados: () => void
  // Placeholder para Fase 7 (Realtime). Hoy es un no-op.
  suscribirRealtime: () => () => void
}

// Inicializa todas las mesas en estado 'libre'.
function estadosIniciales(mesas: Mesa[]): Record<string, EstadoMesa> {
  const estados: Record<string, EstadoMesa> = {}
  for (const mesa of mesas) {
    estados[mesa.id] = { mesaId: mesa.id, estado: 'libre', garzonId: null }
  }
  return estados
}

export const useMesasStore = create<MesasState & MesasActions>((set, get) => ({
  mesas: [],
  zonas: [],
  estadosMesa: {},
  mesaSeleccionada: null,
  cargando: false,
  error: null,

  cargarMesas: async () => {
    set({ cargando: true, error: null })
    try {
      const [{ data: zonas, error: ez }, { data: mesas, error: em }, { data: estados, error: ee }] =
        await Promise.all([
          supabase.from('zonas').select('id, nombre, descripcion, orden').order('orden'),
          supabase
            .from('mesas')
            .select('id, numero, zona_id, es_virtual, mesa_real_id, pos_x, pos_y, activa')
            .eq('activa', true),
          supabase.from('estados_mesa').select('mesa_id, estado, garzon_id'),
        ])
      if (ez) throw ez
      if (em) throw em
      if (ee) throw ee

      const zonasMap: Zona[] = (zonas ?? []).map((z) => ({
        id: z.id,
        nombre: z.nombre,
        descripcion: z.descripcion,
        orden: z.orden,
      }))
      const mesasMap: Mesa[] = (mesas ?? []).map((m) => ({
        id: m.id,
        numero: m.numero,
        zonaId: m.zona_id,
        esVirtual: m.es_virtual,
        mesaRealId: m.mesa_real_id,
        posX: Number(m.pos_x),
        posY: Number(m.pos_y),
        activa: m.activa,
      }))
      const estadosMesa: Record<string, EstadoMesa> = {}
      for (const m of mesasMap) {
        estadosMesa[m.id] = { mesaId: m.id, estado: 'libre', garzonId: null }
      }
      for (const e of estados ?? []) {
        estadosMesa[e.mesa_id] = {
          mesaId: e.mesa_id,
          estado: e.estado as EstadoMesaTipo,
          garzonId: e.garzon_id,
        }
      }

      set({ mesas: mesasMap, zonas: zonasMap, estadosMesa, cargando: false })
    } catch (err) {
      set({
        cargando: false,
        error: err instanceof Error ? err.message : 'Error cargando las mesas',
      })
    }
  },

  seleccionarMesa: (mesaId) => set({ mesaSeleccionada: mesaId }),

  actualizarEstadoMesa: (mesaId, estado) => {
    const garzonId =
      estado === 'libre' ? null : useAuthStore.getState().usuario?.id ?? null
    // Optimista: actualizamos local primero.
    set((state) => ({
      estadosMesa: {
        ...state.estadosMesa,
        [mesaId]: { mesaId, estado, garzonId },
      },
    }))
    // Persistimos en Supabase en background (sin bloquear la UI).
    supabase
      .from('estados_mesa')
      .update({ estado, garzon_id: garzonId, updated_at: new Date().toISOString() })
      .eq('mesa_id', mesaId)
      .then(({ error }) => {
        if (error) console.warn('No se pudo actualizar estado_mesa', mesaId, error.message)
      })
  },

  getMesaById: (id) => get().mesas.find((m) => m.id === id),
  getMesaByNumero: (numero) => get().mesas.find((m) => m.numero === numero),
  getMesasPorZona: (zonaId) =>
    get().mesas.filter((m) => m.zonaId === zonaId && !m.esVirtual && m.activa),
  getMesasVirtuales: () => get().mesas.filter((m) => m.esVirtual && m.activa),
  getEstadoMesa: (mesaId) => get().estadosMesa[mesaId],
  getZonaById: (id) => get().zonas.find((z) => z.id === id),

  reiniciarEstados: () => set({ estadosMesa: estadosIniciales(get().mesas) }),

  suscribirRealtime: () => () => {},
}))
