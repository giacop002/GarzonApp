import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useAuthStore } from '@/stores/useAuthStore'

export default function PerfilScreen() {
  const { usuario, logout } = useAuthStore()

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.nombre}>{usuario?.nombre ?? '—'}</Text>
        <Text style={styles.rol}>Rol: {usuario?.rol ?? '—'}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => logout()}>
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
  button: {
    backgroundColor: '#d32f2f',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
