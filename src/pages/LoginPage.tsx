import { Navigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storeSettings } from "@/config/storeSettings"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { useAuthStore } from "@/features/auth/store/authStore"

export function LoginPage() {
  const session = useAuthStore((state) => state.session)

  if (session) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-brand-blue/15 via-background to-brand-pink/15 p-4">
      <Card className="w-full max-w-sm rounded-xl border-none shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-14 items-center justify-center rounded-2xl bg-primary p-2">
            <img
              src={storeSettings.logoUrl}
              alt={storeSettings.nomeCurto}
              className="size-full object-contain"
            />
          </div>
          <CardTitle className="text-2xl">Amarelinha Gestor</CardTitle>
          <CardDescription>Entre para gerenciar seu estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
