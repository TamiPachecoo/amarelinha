import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <span className="text-6xl">🧸</span>
      <h1 className="text-2xl font-extrabold text-foreground">Página não encontrada</h1>
      <p className="text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button asChild>
        <Link to="/">Voltar ao painel</Link>
      </Button>
    </div>
  )
}
