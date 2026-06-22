// Formato de moneda local (sin decimales, separador de miles).
export function formatearPrecio(valor: number): string {
  return '$' + valor.toLocaleString('es-AR', { maximumFractionDigits: 0 })
}
