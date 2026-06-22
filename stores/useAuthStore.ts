import { create } from 'zustand'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Usuario {
  id: string
  nombre: string
  rol: 'dev' | 'admin' | 'garzon'
  codigoGarzon: string | null
}

interface AuthState {
  session: Session | null
  usuario: Usuario | null
  cargando: boolean
  inicializado: boolean
}

interface AuthActions {
  inicializar: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
  isGarzon: () => boolean
  isDev: () => boolean
}

async function fetchUsuario(userId: string, email: string): Promise<Usuario> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, rol, codigo_garzon')
      .eq('id', userId)
      .single()

    if (!error && data) {
      return {
        id: data.id,
        nombre: data.nombre,
        rol: data.rol as Usuario['rol'],
        codigoGarzon: data.codigo_garzon,
      }
    }
  } catch {}

  // Fallback: tabla usuarios no existe aún o el usuario no tiene fila.
  // En desarrollo se asigna rol 'dev' para poder explorar todas las rutas.
  return {
    id: userId,
    nombre: email,
    rol: 'dev',
    codigoGarzon: null,
  }
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  session: null,
  usuario: null,
  cargando: false,
  inicializado: false,

  inicializar: async () => {
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const usuario = await fetchUsuario(session.user.id, session.user.email ?? '')
      set({ session, usuario, inicializado: true })
    } else {
      set({ session: null, usuario: null, inicializado: true })
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const usuario = await fetchUsuario(session.user.id, session.user.email ?? '')
        set({ session, usuario })
      } else {
        set({ session: null, usuario: null })
      }
    })
  },

  login: async (email, password) => {
    set({ cargando: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const usuario = await fetchUsuario(data.session.user.id, email)
      set({ session: data.session, usuario, cargando: false })
    } catch (error) {
      set({ cargando: false })
      throw error
    }
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ session: null, usuario: null })
  },

  isAdmin: () => {
    const { usuario } = get()
    return usuario?.rol === 'admin' || usuario?.rol === 'dev'
  },
  isGarzon: () => get().usuario?.rol === 'garzon',
  isDev: () => get().usuario?.rol === 'dev',
}))
