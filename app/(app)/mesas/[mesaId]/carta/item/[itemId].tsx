import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import { useCartaStore } from '@/stores/useCartaStore'
import { usePedidosStore } from '@/stores/usePedidosStore'
import { formatearPrecio } from '@/lib/format'

export default function ModalItemScreen() {
  const { mesaId, itemId } = useLocalSearchParams<{ mesaId: string; itemId: string }>()
  const router = useRouter()
  const { getItemById, isItemDisponible } = useCartaStore()
  const agregarItem = usePedidosStore((s) => s.agregarItem)

  const [cantidad, setCantidad] = useState(1)
  const [notas, setNotas] = useState('')

  const item = getItemById(itemId)

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Ítem no encontrado.</Text>
      </View>
    )
  }

  const disponible = isItemDisponible(item.id)

  const handleAgregar = () => {
    agregarItem(mesaId, item, cantidad, notas.trim())
    router.back()
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contenido}>
      <Stack.Screen options={{ title: item.nombre }} />

      <Text style={styles.nombre}>{item.nombre}</Text>
      {item.descripcion && <Text style={styles.desc}>{item.descripcion}</Text>}
      <Text style={styles.precio}>{formatearPrecio(item.precio)}</Text>

      {!disponible ? (
        <View style={styles.noDispBox}>
          <Text style={styles.noDispTexto}>Este ítem no está disponible.</Text>
        </View>
      ) : (
        <>
          {/* Selector de cantidad */}
          <Text style={styles.label}>Cantidad</Text>
          <View style={styles.cantidadFila}>
            <TouchableOpacity
              style={styles.botonCant}
              onPress={() => setCantidad((c) => Math.max(1, c - 1))}
            >
              <Text style={styles.botonCantTexto}>−</Text>
            </TouchableOpacity>
            <Text style={styles.cantidad}>{cantidad}</Text>
            <TouchableOpacity
              style={styles.botonCant}
              onPress={() => setCantidad((c) => c + 1)}
            >
              <Text style={styles.botonCantTexto}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Notas */}
          <Text style={styles.label}>Notas (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="ej: sin hielo, término medio"
            placeholderTextColor="#999"
            value={notas}
            onChangeText={setNotas}
            multiline
          />

          <TouchableOpacity style={styles.botonAgregar} onPress={handleAgregar}>
            <Text style={styles.botonAgregarTexto}>
              Agregar al pedido · {formatearPrecio(item.precio * cantidad)}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contenido: { padding: 24 },
  nombre: { fontSize: 24, fontWeight: '700', color: '#1a1a1a' },
  desc: { fontSize: 15, color: '#888', marginTop: 6 },
  precio: { fontSize: 22, fontWeight: '700', color: '#2e7d32', marginTop: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 24, marginBottom: 8 },
  cantidadFila: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  botonCant: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonCantTexto: { fontSize: 24, fontWeight: '700', color: '#444' },
  cantidad: { fontSize: 20, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  botonAgregar: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  botonAgregarTexto: { color: '#fff', fontSize: 16, fontWeight: '600' },
  noDispBox: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginTop: 24,
  },
  noDispTexto: { color: '#c62828', fontSize: 15, textAlign: 'center' },
  error: { fontSize: 16, color: '#c62828', textAlign: 'center', marginTop: 40 },
})
