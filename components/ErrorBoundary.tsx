import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { reportarError } from '@/lib/sentry'

interface Props {
  children: React.ReactNode
}
interface State {
  error: Error | null
}

// Captura errores de render de cualquier pantalla y muestra un fallback
// en vez de una pantalla en blanco / crash. Reporta a Sentry si está activo.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error) {
    reportarError(error, { origen: 'ErrorBoundary' })
  }

  reintentar = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        <View style={styles.container}>
          <Text style={styles.titulo}>Algo salió mal</Text>
          <Text style={styles.detalle}>{this.state.error.message}</Text>
          <TouchableOpacity style={styles.boton} onPress={this.reintentar}>
            <Text style={styles.botonTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )
    }
    return this.props.children
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  titulo: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  detalle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  boton: { backgroundColor: '#1a1a1a', borderRadius: 8, paddingVertical: 14, paddingHorizontal: 32 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
})
