import { create } from 'zustand'
import { Item } from '@/constants/carta'

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

export const usePedidosStore = create<PedidosState & PedidosActions>((set, get) => ({
  pedidosPorMesa: {},

  iniciarPedido: (mesaId, mesaNumero) =>
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
    }),

  cerrarPedido: (mesaId) =>
    set((state) => {
      const { [mesaId]: _, ...resto } = state.pedidosPorMesa
      return { pedidosPorMesa: resto }
    }),

  agregarItem: (mesaId, item, cantidad = 1, notas = '') =>
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
    ),

  quitarItem: (mesaId, itemId) =>
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items: p.items.filter((l) => l.itemId !== itemId),
      }))
    ),

  actualizarCantidad: (mesaId, itemId, cantidad) =>
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items:
          cantidad <= 0
            ? p.items.filter((l) => l.itemId !== itemId)
            : p.items.map((l) => (l.itemId === itemId ? { ...l, cantidad } : l)),
      }))
    ),

  actualizarNotasItem: (mesaId, itemId, notas) =>
    set((state) =>
      mutarPedido(state, mesaId, (p) => ({
        ...p,
        items: p.items.map((l) => (l.itemId === itemId ? { ...l, notas } : l)),
      }))
    ),

  actualizarNotasMesa: (mesaId, notas) =>
    set((state) => mutarPedido(state, mesaId, (p) => ({ ...p, notas }))),

  marcarComoEnviado: (mesaId) =>
    set((state) => mutarPedido(state, mesaId, (p) => ({ ...p, estado: 'enviado' }))),

  transferirMesa: (mesaOrigenId, mesaDestinoId, mesaDestinoNumero) =>
    set((state) => {
      const pedido = state.pedidosPorMesa[mesaOrigenId]
      if (!pedido) return state
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
    }),

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
}))
