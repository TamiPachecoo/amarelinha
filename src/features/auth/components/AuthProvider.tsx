import { useEffect, type ReactNode } from "react"
import { supabase } from "@/services/supabase"
import { useAuthStore } from "@/features/auth/store/authStore"

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession)
  const setInitializing = useAuthStore((state) => state.setInitializing)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setInitializing])

  return children
}
