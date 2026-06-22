import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Item } from '@/constants/carta'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  programarSyncPedido,
  cerrarPedidoRemoto,
  transferirPedidoRemoto,
  reintentarSyncPedido,
} from '@/lib/syncPedidos'

export interface LineaPedido {
  itemId: string
  nombre: string // desnormalizado para display offline
  precio: number // precio al momento de agregar (inmutable)
  cantidad: number
  notas: string
  agregadoAt: number
}

export interface PedidoLocal {
  mesaId: string
  mesaNumero: number
  items: LineaPedido[]
  notas: string
  estado: 'borrador' | 'enviado'
  creadoAt: number
  modificadoAt: number
  pedidoSupabaseId?: string
}

interface PedidosState {
  pedidosPorMesa: Record<string, PedidoLocal>
  // Mesas cuyo último sync con Supabase falló (para mostrar y reintentar).
  syncErrores: Record<string, boolean>
}

interface PedidosActions {
  iniciarPedido: (mesaId: string, mesaNumero: number) => void
  cerrarPedido: (mesaId: string) => void
  agregarItem: (mesaId: string, item: Item, cantidad?: number, notas?: string) => void
  quitarItem: (mesaId: string, itemId: string) => void
  actualizarCantidad: (mesaId: string, itemId: string, cantidad: number) => void
  actualizarNotasItem: (mesaId: string, itemId: string, notas: string) => void
  actualizarNotasMesa: (mesaId: string, notas: string) => void
  marcarComoEnviado: (mesaId: string) => void
  transferirMesa: (
    mesaOrigenId: string,
    mesaDestinoId: string,
    mesaDestinoNumero: number
  ) => void
  getPedidoByMesa: (mesaId: string) => PedidoLocal | undefined
  getTotalPedido: (mesaId: string) => number
  getCantidadItems: (mesaId: string) => number
  getMesasConPedidoActivo: () => string[]
  // Limpia todos los pedidos locales (fin de turno / logout).
  limpiarTodo: () => void
  // Sincronización con Supabase.
  setPedidoSupabaseId: (mesaId: string, pedidoId: string) => void
  marcarSyncError: (mesaId: string, error: boolean) => void
  reintentarSync: (mesaId: string) => void
  // Recupera del servidor los pedidos activos del garzón (ej. tras reinstalar).
  cargarPedidosActivos: () => Promise<void>
}

// Helper: aplica un cambio inmutable al pedido de una mesa y refresca modificadoAt.
function mutarPedido(
  state: PedidosState,
  mesaId: string,
  fn: (p: PedidoLocal) => PedidoLocal
): PedidosState {
  const pedido = state.pedidosPorMesa[mesaId]
  if (!pedido) return state
  return {
    pedidosPorMesa: {
      ...state.pedidosPorMesa,
      [mesaId]: { ...fn(pedido), modificadoAt: Date.now() },
    },
  }
}

export const usePedidosStore = create<PedidosState & PedidosActions>()(
  persist(
    (set, get) => ({
  pedidosPorMesa: {},
  syncErrores: {},

  iniciarPedido: (mesaId, mesaNumero) => {
    set((state) => {
      if (state.pedidosPorMesa[mesaId]) return state // ya existe
      const ahora = Date.now()
      return {
        pedidosPorMesa: {
          ...state.pedidosPorMesa,
          [mesaId]: {
            mesaId,
            mesaNumero,
            items: [],
            notas: '',
            estado: 'borrador',
            creadoAt: ahora,
            modificadoAt: ahora,
          },
        },
      }
    })
    programarSyncPedido(mesaId)
  },

  cerrarPedido: (mesaId) => {
    const pid = get().pedidosPorMesa[mesaId]?.pedidoSupabaseId
    cerrarPedidoRemoto(mesaId, pid) // marca 'cerrado' en Supabase (no borra)
    set((state) => {
      const { [mesaId]: _, ...resto } = state.pedidosPorMesa
      const { [mesaId]: __, ...restoErr } = state.syncErrores
      return { pedidosPorMesa: resto, syncErrores: restoErr }
    })
  },

  agregarItem: (mesaId, item, cantidad = 1, notas = '') => {
    set((state) =>
      mutarPedido(state, mesaId, (p) => {
        const existente = p.items.find((l) => l.itemId === item.id && l.notas === notas)
        if (existente) {
          return {
            ...p,
            items: p.items.map((l) =>
              l === existente ? { ...l, cantidad: l.cantidad + cantidad } : l
            ),
          }
        }
        return {
          ...p,
          items: [
            ...p.items,
            {
              itemId: item.id,
              nombre: item.nombre,
              precio: item.precio,
              cantidad,
              notas,
              agregadoAt: Date.now(),
            },
          ],
        }
      })
    )
    programarSyncPedido(mesaId)
  },

  quitarItem: (mesaId, itemId) => {
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items: p.items.filter((l) => l.itemId !== itemId),
      }))
    )
    programarSyncPedido(mesaId)
  },

  actualizarCantidad: (mesaId, itemId, cantidad) => {
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items:
          cantidad <= 0
            ? p.items.filter((l) => l.itemId !== itemId)
            : p.items.map((l) => (l.itemId === itemId ? { ...l, cantidad } : l)),
      }))
    )
    programarSyncPedido(mesaId)
  },

  actualizarNotasItem: (mesaId, itemId, notas) => {
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items: p.items.map((l) => (l.itemId === itemId ? { ...l, notas } : l)),
      }))
    )
    programarSyncPedido(mesaId)
  },

  actualizarNotasMesa: (mesaId, notas) => {
    set((state) => mutarPedido(state, mesaId, (p) => ({ ...p, notas })))
    programarSyncPedido(mesaId)
  },

  marcarComoEnviado: (mesaId) => {
    set((state) => mutarPedido(state, mesaId, (p) => ({ ...p, estado: 'enviado' })))
    programarSyncPedido(mesaId)
  },

  transferirMesa: (mesaOrigenId, mesaDestinoId, mesaDestinoNumero) => {
    let pid: string | undefined
    set((state) => {
      const pedido = state.pedidosPorMesa[mesaOrigenId]
      if (!pedido) return state
      pid = pedido.pedidoSupabaseId
      const { [mesaOrigenId]: _, ...resto } = state.pedidosPorMesa
      return {
        pedidosPorMesa: {
          ...resto,
          [mesaDestinoId]: {
            ...pedido,
            mesaId: mesaDestinoId,
            mesaNumero: mesaDestinoNumero,
            modificadoAt: Date.now(),
          },
        },
      }
    })
    transferirPedidoRemoto(mesaDestinoId, pid)
  },

  getPedidoByMesa: (mesaId) => get().pedidosPorMesa[mesaId],

  getTotalPedido: (mesaId) => {
    const pedido = get().pedidosPorMesa[mesaId]
    if (!pedido) return 0
    return pedido.items.reduce((acc, l) => acc + l.precio * l.cantidad, 0)
  },

  getCantidadItems: (mesaId) => {
    const pedido = get().pedidosPorMesa[mesaId]
    if (!pedido) return 0
    return pedido.items.reduce((acc, l) => acc + l.cantidad, 0)
  },

  getMesasConPedidoActivo: () => Object.keys(get().pedidosPorMesa),

  limpiarTodo: () => set({ pedidosPorMesa: {}, syncErrores: {} }),

  setPedidoSupabaseId: (mesaId, pedidoId) =>
    set((state) => {
      const pedido = state.pedidosPorMesa[mesaId]
      if (!pedido) return state
      return {
        pedidosPorMesa: {
          ...state.pedidosPorMesa,
          [mesaId]: { ...pedido, pedidoSupabaseId: pedidoId },
        },
      }
    }),

  marcarSyncError: (mesaId, error) =>
    set((state) => ({
      syncErrores: { ...state.syncErrores, [mesaId]: error },
    })),

  reintentarSync: (mesaId) => {
    set((state) => ({ syncErrores: { ...state.syncErrores, [mesaId]: false } }))
    reintentarSyncPedido(mesaId)
  },

  cargarPedidosActivos: async () => {
    const garzonId = useAuthStore.getState().usuario?.id
    if (!garzonId) return
    const { data, error } = await supabase
      .from('pedidos')
      .select(
        'id, mesa_id, estado, notas_generales, mesas(numero), ' +
          'pedido_items(item_id, cantidad, precio_unitario, notas, items_carta(nombre))'
      )
      .eq('garzon_id', garzonId)
      .in('estado', ['borrador', 'enviado'])
    if (error || !data) return

    set((state) => {
      const nuevo = { ...state.pedidosPorMesa }
      for (const p of data as any[]) {
        // El pedido local (no sincronizado o más reciente) tiene prioridad.
        if (nuevo[p.mesa_id]) continue
        nuevo[p.mesa_id] = {
          mesaId: p.mesa_id,
          mesaNumero: p.mesas?.numero ?? 0,
          items: (p.pedido_items ?? []).map((li: any) => ({
            itemId: li.item_id,
            nombre: li.items_carta?.nombre ?? '',
            precio: Number(li.precio_unitario),
            cantidad: li.cantidad,
            notas: li.notas ?? '',
            agregadoAt: Date.now(),
          })),
          notas: p.notas_generales ?? '',
          estado: p.estado,
          creadoAt: Date.now(),
          modificadoAt: Date.now(),
          pedidoSupabaseId: p.id,
        }
      }
      return { pedidosPorMesa: nuevo }
    })
  },
    }),
    {
      name: 'pedidos_activos',
      storage: createJSONStorage(() => AsyncStorage),
      // v2: migración a Supabase (los pedidos viejos usaban ids estáticos).
      version: 2,
      // Descarta cualquier cache anterior a v2 (ids estáticos incompatibles).
      migrate: () => ({ pedidosPorMesa: {} }),
      // Solo persistimos los datos, no las acciones.
      partialize: (state) => ({ pedidosPorMesa: state.pedidosPorMesa }),
    }
  )
)
