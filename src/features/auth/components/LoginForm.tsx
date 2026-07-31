import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/services/supabase"
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/loginSchema"

export function LoginForm() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(values: LoginFormValues) {
    setErrorMessage(null)
    setInfoMessage(null)
    const { error } = await supabase.auth.signInWithPassword(values)

    if (error) {
      setErrorMessage("E-mail ou senha inválidos. Tente novamente.")
    }
  }

  async function onForgotPassword() {
    setErrorMessage(null)
    setInfoMessage(null)

    const email = form.getValues("email").trim()
    const isEmailValid = await form.trigger("email")

    if (!email || !isEmailValid) {
      setErrorMessage("Informe um e-mail válido para recuperar sua senha.")
      return
    }

    setIsResettingPassword(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/set-password`,
    })
    setIsResettingPassword(false)

    if (error) {
      setErrorMessage(error.message || "Não foi possível enviar o e-mail de recuperação.")
      return
    }

    setInfoMessage("Se o e-mail existir, você receberá um link para redefinir a senha.")
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="voce@exemplo.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Senha</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {errorMessage && (
          <p className="text-sm font-medium text-destructive">{errorMessage}</p>
        )}

        {infoMessage && (
          <p className="text-sm font-medium text-emerald-700">{infoMessage}</p>
        )}

        <button
          type="button"
          className="text-left text-sm font-medium text-primary underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onForgotPassword}
          disabled={isSubmitting || isResettingPassword}
        >
          {isResettingPassword ? "Enviando e-mail..." : "Esqueci minha senha?"}
        </button>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </Form>
  )
}
