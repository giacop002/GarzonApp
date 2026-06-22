import { useEffect, useState } from 'react'
import { usePedidosStore } from '@/stores/usePedidosStore'
import { useCartaStore } from '@/stores/useCartaStore'

// Espera a que los stores con persist terminen de leer AsyncStorage.
// Evita el flash de estado vacío antes de hidratar (pedidos/carta cacheados).
export function useHydration(): boolean {
  const [hidratado, setHidratado] = useState(false)

  useEffect(() => {
    const stores = [usePedidosStore, useCartaStore]

    const chequear = () => {
      if (stores.every((s) => s.persist.hasHydrated())) {
        setHidratado(true)
      }
    }

    // Algunos stores pueden haber hidratado antes de montar este hook.
    chequear()

    const subs = stores.map((s) => s.persist.onFinishHydration(chequear))
    return () => subs.forEach((unsub) => unsub())
  }, [])

  return hidratado
}
