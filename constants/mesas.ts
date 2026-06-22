// Datos estáticos de zonas y mesas — Fase 2.
// ⚠️ Las posiciones (pos_x, pos_y) son una grilla placeholder.
// Deben validarse con el personal del restaurante antes de producción.
// En Fase 5 estos datos migran a la tabla `mesas` de Supabase sin cambiar
// el código que los consume (solo cambia cargarMesas()).

export interface Zona {
  id: string
  nombre: string
  descripcion: string | null
  orden: number
}

export interface Mesa {
  id: string
  numero: number
  zonaId: string
  esVirtual: boolean
  mesaRealId: string | null
  posX: number // 0–100, porcentaje del ancho del contenedor
  posY: number // 0–100, porcentaje del alto del contenedor
  activa: boolean
}

export const ZONA_EXTERIOR = 'zona-exterior'
export const ZONA_INTERIOR = 'zona-interior'

export const ZONAS: Zona[] = [
  { id: ZONA_EXTERIOR, nombre: 'Exterior', descripcion: 'Terraza y vereda', orden: 0 },
  { id: ZONA_INTERIOR, nombre: 'Interior', descripcion: 'Salón principal', orden: 1 },
]

// Genera posiciones en grilla dentro de los márgenes [8, 92] de cada eje.
function generarGrilla(
  numeros: number[],
  zonaId: string,
  columnas: number
): Mesa[] {
  const filas = Math.ceil(numeros.length / columnas)
  const margen = 8
  const ancho = 100 - margen * 2
  const alto = 100 - margen * 2

  return numeros.map((numero, i) => {
    const col = i % columnas
    const fila = Math.floor(i / columnas)
    // +0.5 centra la mesa dentro de su celda
    const posX = margen + (ancho * (col + 0.5)) / columnas
    const posY = margen + (alto * (fila + 0.5)) / Math.max(filas, 1)
    return {
      id: `mesa-${numero}`,
      numero,
      zonaId,
      esVirtual: false,
      mesaRealId: null,
      posX: Math.round(posX * 100) / 100,
      posY: Math.round(posY * 100) / 100,
      activa: true,
    }
  })
}

// Exterior: mesas 1–37
const numerosExterior = Array.from({ length: 37 }, (_, i) => i + 1)
// Interior: mesas 40–67
const numerosInterior = Array.from({ length: 28 }, (_, i) => i + 40)

const mesasExterior = generarGrilla(numerosExterior, ZONA_EXTERIOR, 6)
const mesasInterior = generarGrilla(numerosInterior, ZONA_INTERIOR, 6)

// Mesas virtuales (parche del sistema actual). No tienen posición en el mapa.
const mesasVirtuales: Mesa[] = [
  {
    id: 'mesa-68',
    numero: 68,
    zonaId: ZONA_INTERIOR,
    esVirtual: true,
    mesaRealId: 'mesa-5',
    posX: 0,
    posY: 0,
    activa: true,
  },
  {
    id: 'mesa-69',
    numero: 69,
    zonaId: ZONA_EXTERIOR,
    esVirtual: true,
    mesaRealId: null,
    posX: 0,
    posY: 0,
    activa: true,
  },
]

export const MESAS: Mesa[] = [
  ...mesasExterior,
  ...mesasInterior,
  ...mesasVirtuales,
]
