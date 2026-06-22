import { supabase } from './supabase'
import { useAuthStore } from '@/stores/useAuthStore'

// Carga diferida del store de pedidos para evitar el ciclo de require
// (usePedidosStore importa este módulo y este módulo usa el store).
function pedidosStore() {
  return require('../stores/usePedidosStore').usePedidosStore as typeof import('../stores/usePedidosStore').usePedidosStore
}

// Sincronización de pedidos con Supabase.
// Modelo: el store local es la fuente de verdad para la UI (optimista) y acá
// empujamos el estado a Supabase en background, con:
//  - debounce por mesa (agrupa ráfagas de cambios en un solo write)
//  - cola serializada por mesa (evita writes concurrentes pisándose)
//  - marca de error + reintento manual
//
// Estrategia de ítems: full-replace (borrar pedido_items del pedido y reinsertar
// desde el estado local). Simple y robusto para Fase 5. Cuando llegue el panel de
// cocina/barra en Realtime (Fase 7) se revisará hacia un modelo append-only.

const DEBOUNCE_MS = 600
const timers = new Map<string, ReturnType<typeof setTimeout>>()
const colas = new Map<string, Promise<unknown>>()

function encolar(mesaId: string, fn: () => Promise<void>) {
  const prev = colas.get(mesaId) ?? Promise.resolve()
  const next = prev.then(fn).catch((e) => {
    console.warn('[syncPedidos] falló sync de mesa', mesaId, e?.message ?? e)
    pedidosStore().getState().marcarSyncError(mesaId, true)
  })
  colas.set(mesaId, next)
  return next
}

async function sincronizar(mesaId: string) {
  const store = pedidosStore().getState()
  const pedido = store.pedidosPorMesa[mesaId]
  if (!pedido) return // pudo cerrarse antes de sincronizar

  const garzonId = useAuthStore.getState().usuario?.id
  if (!garzonId) throw new Error('Sin usuario autenticado para sincronizar')

  let pid = pedido.pedidoSupabaseId

  // 1. Asegurar la fila en `pedidos`.
  if (!pid) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        mesa_id: mesaId,
        garzon_id: garzonId,
        estado: pedido.estado,
        notas_generales: pedido.notas || null,
      })
      .select('id')
      .single()
    if (error) throw error
    pid = data.id
    store.setPedidoSupabaseId(mesaId, pid)
  } else {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: pedido.estado, notas_generales: pedido.notas || null })
      .eq('id', pid)
    if (error) throw error
  }

  // 2. Reemplazar las líneas del pedido.
  const { error: delErr } = await supabase.from('pedido_items').delete().eq('pedido_id', pid)
  if (delErr) throw delErr

  if (pedido.items.length > 0) {
    const filas = pedido.items.map((l) => ({
      pedido_id: pid,
      item_id: l.itemId,
      cantidad: l.cantidad,
      precio_unitario: l.precio,
      notas: l.notas || null,
    }))
    const { error: insErr } = await supabase.from('pedido_items').insert(filas)
    if (insErr) throw insErr
  }

  store.marcarSyncError(mesaId, false)
}

// Agenda un sync con debounce. Cada cambio reinicia el temporizador de la mesa.
export function programarSyncPedido(mesaId: string) {
  const existente = timers.get(mesaId)
  if (existente) clearTimeout(existente)
  timers.set(
    mesaId,
    setTimeout(() => {
      timers.delete(mesaId)
      encolar(mesaId, () => sincronizar(mesaId))
    }, DEBOUNCE_MS)
  )
}

// Reintento inmediato (botón "reintentar" en la UI).
export function reintentarSyncPedido(mesaId: string) {
  const existente = timers.get(mesaId)
  if (existente) clearTimeout(existente)
  return encolar(mesaId, () => sincronizar(mesaId))
}

// Cierre de pedido: marca 'cerrado' en Supabase (no se borra; queda como historial).
export function cerrarPedidoRemoto(mesaId: string, pedidoId: string | undefined) {
  if (!pedidoId) return
  encolar(mesaId, async () => {
    const { error } = await supabase
      .from('pedidos')
      .update({ estado: 'cerrado', cerrado_at: new Date().toISOString() })
      .eq('id', pedidoId)
    if (error) throw error
  })
}

// Transferencia: actualiza la mesa del pedido en Supabase.
export function transferirPedidoRemoto(mesaDestinoId: string, pedidoId: string | undefined) {
  if (!pedidoId) return
  encolar(mesaDestinoId, async () => {
    const { error } = await supabase
      .from('pedidos')
      .update({ mesa_id: mesaDestinoId })
      .eq('id', pedidoId)
    if (error) throw error
  })
}
