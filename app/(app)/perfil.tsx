import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'
import { usePedidosStore } from '@/stores/usePedidosStore'
import { useMesasStore } from '@/stores/useMesasStore'

export default function PerfilScreen() {
  const { usuario, logout } = useAuthStore()
  const pedidosPorMesa = usePedidosStore((s) => s.pedidosPorMesa)
  const limpiarTodo = usePedidosStore((s) => s.limpiarTodo)
  const reiniciarEstados = useMesasStore((s) => s.reiniciarEstados)

  // Mesas con pedido en borrador (aún no enviado al PC).
  const borradores = Object.values(pedidosPorMesa).filter(
    (p) => p.estado === 'borrador' && p.items.length > 0
  )

  const cerrarSesion = async () => {
    await logout()
    limpiarTodo() // limpia pedidos activos del dispositivo (fin de turno)
    reiniciarEstados() // y los estados de mesa en memoria vuelven a 'libre'
  }

  const confirmarCierre = () => {
    if (borradores.length > 0) {
      const lista = borradores.map((p) => `Mesa ${p.mesaNumero}`).join(', ')
      Alert.alert(
        'Pedidos en borrador',
        `Tenés pedidos sin enviar al PC en: ${lista}.\n\n¿Cerrar sesión igualmente? Se perderán.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Cerrar sesión', style: 'destructive', onPress: cerrarSesion },
        ]
      )
    } else {
      cerrarSesion()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{usuario?.nombre ?? '—'}</Text>
        <Text style={styles.rol}>Rol: {usuario?.rol ?? '—'}</Text>

        {borradores.length > 0 && (
          <View style={styles.aviso}>
            <Text style={styles.avisoTexto}>
              {borradores.length} pedido(s) en borrador sin enviar
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={confirmarCierre}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between', padding: 24 },
  info: { marginTop: 24 },
  nombre: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  rol: { fontSize: 15, color: '#666', marginTop: 4 },
  aviso: {
    marginTop: 20,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    padding: 12,
  },
  avisoTexto: { color: '#ef6c00', fontSize: 14, fontWeight: '500' },
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
