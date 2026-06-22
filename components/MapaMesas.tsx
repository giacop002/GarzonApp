import { useState } from 'react'
import { View, StyleSheet, LayoutChangeEvent } from 'react-native'
import { Mesa } from '@/constants/mesas'
import { useMesasStore } from '@/stores/useMesasStore'
import { TarjetaMesa } from './TarjetaMesa'

interface Props {
  mesas: Mesa[]
  onSeleccionarMesa: (mesaId: string) => void
}

export function MapaMesas({ mesas, onSeleccionarMesa }: Props) {
  const [dim, setDim] = useState({ ancho: 0, alto: 0 })
  const getEstadoMesa = useMesasStore((s) => s.getEstadoMesa)

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setDim({ ancho: width, alto: height })
  }

  return (
    <View style={styles.contenedor} onLayout={onLayout}>
      {dim.ancho > 0 &&
        mesas.map((mesa) => (
          <TarjetaMesa
            key={mesa.id}
            mesa={mesa}
            estado={getEstadoMesa(mesa.id)?.estado ?? 'libre'}
            contenedorAncho={dim.ancho}
            contenedorAlto={dim.alto}
            onPress={onSeleccionarMesa}
          />
        ))}
    </View>
  )
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    margin: 12,
    overflow: 'hidden',
  },
})
