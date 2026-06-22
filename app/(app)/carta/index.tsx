import { View, Text, StyleSheet } from 'react-native'

export default function CartaScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carta</Text>
      <Text style={styles.hint}>Pantalla placeholder · se construye en Fase 3</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  hint: { fontSize: 13, color: '#888', marginTop: 8 },
})
