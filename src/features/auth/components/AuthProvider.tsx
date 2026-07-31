import { useEffect, type ReactNode } from "react"
import { supabase } from "@/services/supabase"
import { useAuthStore } from "@/features/auth/store/authStore"

const SET_PASSWORD_PATH = "/auth/set-password"

export function AuthProvider({ children }: { children: ReactNode }) {
  const setSession = useAuthStore((state) => state.setSession)
  const setInitializing = useAuthStore((state) => state.setInitializing)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setInitializing(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)

        if (event === "PASSWORD_RECOVERY" && window.location.pathname !== SET_PASSWORD_PATH) {
          window.location.replace(`${window.location.origin}${SET_PASSWORD_PATH}`)
        }
      }
    )

    return () => subscription.subscription.unsubscribe()
  }, [setSession, setInitializing])

  return children
}
