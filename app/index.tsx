import { View, ActivityIndicator, StyleSheet } from 'react-native'

// Pantalla de arranque mínima. El redirect real lo maneja app/_layout.tsx
// según el estado de sesión (login si no hay sesión, mesas si la hay).
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#1a1a1a" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})
