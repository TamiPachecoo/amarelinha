import { Navigate, Outlet } from "react-router-dom"
import { useAuthStore } from "@/features/auth/store/authStore"

export function ProtectedRoute() {
  const session = useAuthStore((state) => state.session)
  const isInitializing = useAuthStore((state) => state.isInitializing)

  if (isInitializing) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
