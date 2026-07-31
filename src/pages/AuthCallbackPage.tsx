import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { supabase } from "@/services/supabase"

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
      const code = params.get("code") ?? hashParams.get("code")
      const type = params.get("type") ?? hashParams.get("type")
      const accessToken = hashParams.get("access_token")
      const hasTokenHash = params.has("token_hash")
      const isRecoveryLike =
        type === "invite" || type === "recovery" || Boolean(accessToken) || hasTokenHash

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
          navigate("/login", { replace: true })
          return
        }

        // ensure session is available after exchange
        await supabase.auth.getSession()
      } else if (isRecoveryLike) {
        await supabase.auth.getSession()
      }

      // If this callback corresponds to an invite/recovery flow or contains an access token,
      // ensure the user is taken to the set-password page.
      if (isRecoveryLike || (code && !type)) {
        navigate("/auth/set-password", { replace: true })
        return
      }

      navigate("/", { replace: true })
    }

    void handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">
      Finalizando acesso...
    </div>
  )
}
