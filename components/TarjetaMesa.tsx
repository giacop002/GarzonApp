import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Mesa } from '@/constants/mesas'
import { EstadoMesaTipo } from '@/stores/useMesasStore'
import { ESTILOS_ESTADO } from '@/constants/estadosMesa'

const TAM = 48 // lado de la tarjeta en px

interface Props {
  mesa: Mesa
  estado: EstadoMesaTipo
  contenedorAncho: number
  contenedorAlto: number
  onPress: (mesaId: string) => void
}

export function TarjetaMesa({
  mesa,
  estado,
  contenedorAncho,
  contenedorAlto,
  onPress,
}: Props) {
  const estilo = ESTILOS_ESTADO[estado]
  // Convierte porcentaje → px y centra la tarjeta sobre el punto.
  const left = (mesa.posX / 100) * contenedorAncho - TAM / 2
  const top = (mesa.posY / 100) * contenedorAlto - TAM / 2

  return (
    <TouchableOpacity
      style={[
        styles.mesa,
        { left, top, backgroundColor: estilo.color, borderColor: estilo.texto },
      ]}
      onPress={() => onPress(mesa.id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.numero, { color: estilo.texto }]}>{mesa.numero}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  mesa: {
    position: 'absolute',
    width: TAM,
    height: TAM,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numero: {
    fontSize: 16,
    fontWeight: '700',
  },
})
