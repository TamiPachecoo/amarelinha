import { useState, useEffect, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/services/supabase"

export function SetPasswordForm() {
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionExists, setSessionExists] = useState<boolean | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionExists(Boolean(data.session))
    })
  }, [])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    if (password.length < 8) {
      setErrorMessage("A senha deve ter pelo menos 8 caracteres.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.")
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.auth.updateUser({ password })
    setIsSubmitting(false)

    if (error) {
      // If there's no session, guide the user to reopen the recovery link.
      if (sessionExists === false) {
        setErrorMessage(
          "Sessão de recuperação expirada. Reabra o link de recuperação enviado por e-mail para criar sua senha."
        )
        return
      }

      setErrorMessage(error.message || "Não foi possível salvar a senha.")
      return
    }

    navigate("/", { replace: true })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="new-password" className="text-sm font-medium text-foreground">
          Nova senha
        </label>
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua nova senha"
          autoComplete="new-password"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
          Confirmar senha
        </label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Confirme sua nova senha"
          autoComplete="new-password"
        />
      </div>

      {errorMessage && <p className="text-sm font-medium text-destructive">{errorMessage}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        Criar senha
      </Button>
    </form>
  )
}
