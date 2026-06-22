import { create } from 'zustand'
import { MESAS, ZONAS, Mesa, Zona } from '@/constants/mesas'

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
    // Fase 2: datos estáticos. Fase 5: fetch a Supabase.
    set({
      mesas: MESAS,
      zonas: ZONAS,
      estadosMesa: estadosIniciales(MESAS),
      cargando: false,
    })
  },

  seleccionarMesa: (mesaId) => set({ mesaSeleccionada: mesaId }),

  actualizarEstadoMesa: (mesaId, estado) =>
    set((state) => ({
      estadosMesa: {
        ...state.estadosMesa,
        [mesaId]: {
          ...(state.estadosMesa[mesaId] ?? { mesaId, garzonId: null }),
          estado,
        },
      },
    })),

  getMesaById: (id) => get().mesas.find((m) => m.id === id),
  getMesaByNumero: (numero) => get().mesas.find((m) => m.numero === numero),
  getMesasPorZona: (zonaId) =>
    get().mesas.filter((m) => m.zonaId === zonaId && !m.esVirtual && m.activa),
  getMesasVirtuales: () => get().mesas.filter((m) => m.esVirtual && m.activa),
  getEstadoMesa: (mesaId) => get().estadosMesa[mesaId],
  getZonaById: (id) => get().zonas.find((z) => z.id === id),

  suscribirRealtime: () => () => {},
}))
