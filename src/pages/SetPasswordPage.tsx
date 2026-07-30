import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SetPasswordForm } from "@/features/auth/components/SetPasswordForm"

export function SetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-brand-blue/15 via-background to-brand-pink/15 p-4">
      <Card className="w-full max-w-sm rounded-xl border-none shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Criar senha</CardTitle>
          <CardDescription>Defina uma senha para concluir o acesso.</CardDescription>
        </CardHeader>
        <CardContent>
          <SetPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
