import { EstadoMesaTipo } from '@/stores/useMesasStore'

interface EstiloEstado {
  label: string
  color: string // color de fondo de la mesa
  texto: string // color del texto/numero sobre la mesa
}

export const ESTILOS_ESTADO: Record<EstadoMesaTipo, EstiloEstado> = {
  libre: { label: 'Libre', color: '#e8f5e9', texto: '#2e7d32' },
  ocupada: { label: 'Ocupada', color: '#ffebee', texto: '#c62828' },
  esperando_cierre: { label: 'Esperando cierre', color: '#fff8e1', texto: '#ef6c00' },
  reservada: { label: 'Reservada', color: '#e3f2fd', texto: '#1565c0' },
}

// Ciclo de estados para el botón de cambio rápido en el detalle.
export const SIGUIENTE_ESTADO: Record<EstadoMesaTipo, EstadoMesaTipo> = {
  libre: 'ocupada',
  ocupada: 'esperando_cierre',
  esperando_cierre: 'libre',
  reservada: 'libre',
}
