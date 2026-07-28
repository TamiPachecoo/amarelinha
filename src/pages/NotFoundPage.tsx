import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { storeSettings } from "@/config/storeSettings"

export function NotFoundPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-4 text-center">
      <img
        src={storeSettings.logoUrl}
        alt={storeSettings.nomeCurto}
        className="size-24 object-contain"
      />
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
