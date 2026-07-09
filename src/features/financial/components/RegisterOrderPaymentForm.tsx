import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatBRL } from "@/features/products/utils"
import { generatePaymentPlan, type PaymentPlanInput } from "@/features/financial/paymentPlan"
import {
  formaPagamentoFornecedorLabel,
  PRAZOS_DIAS,
  type FormaPagamentoFornecedor,
} from "@/features/financial/types"

interface RegisterOrderPaymentFormProps {
  valorTotal: number
  dataPedido: string
  onSubmit: (plan: ReturnType<typeof generatePaymentPlan>) => void
}

export function RegisterOrderPaymentForm({
  valorTotal,
  dataPedido,
  onSubmit,
}: RegisterOrderPaymentFormProps) {
  const [forma, setForma] = useState<FormaPagamentoFornecedor>("avista")
  const [entradaPercentual, setEntradaPercentual] = useState(0)
  const [prazosSelecionados, setPrazosSelecionados] = useState<number[]>([30])
  const [parcelasCartao, setParcelasCartao] = useState(2)

  function togglePrazo(dias: number) {
    setPrazosSelecionados((prev) =>
      prev.includes(dias) ? prev.filter((d) => d !== dias) : [...prev, dias].sort((a, b) => a - b)
    )
  }

  function handleGenerate() {
    let input: PaymentPlanInput
    if (forma === "avista") {
      input = { forma: "avista", valorTotal, dataPedido }
    } else if (forma === "prazo") {
      input = { forma: "prazo", valorTotal, dataPedido, entradaPercentual, prazosDias: prazosSelecionados }
    } else if (forma === "cartao_parcelado") {
      input = { forma: "cartao_parcelado", valorTotal, dataPedido, parcelas: parcelasCartao }
    } else {
      input = { forma: "boleto", valorTotal, dataPedido, prazosDias: prazosSelecionados }
    }
    onSubmit(generatePaymentPlan(input))
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-4">
      <div className="space-y-2">
        <Label>Forma de Pagamento</Label>
        <Select value={forma} onValueChange={(v) => setForma(v as FormaPagamentoFornecedor)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(formaPagamentoFornecedorLabel).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {forma === "prazo" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Entrada (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={entradaPercentual}
              onChange={(e) => setEntradaPercentual(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Parcelas restantes (dias)</Label>
            <div className="flex flex-wrap gap-2">
              {PRAZOS_DIAS.map((dias) => (
                <Button
                  key={dias}
                  type="button"
                  size="sm"
                  variant={prazosSelecionados.includes(dias) ? "default" : "outline"}
                  onClick={() => togglePrazo(dias)}
                >
                  {dias}d
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {forma === "boleto" && (
        <div className="space-y-2">
          <Label>Vencimentos (dias)</Label>
          <div className="flex flex-wrap gap-2">
            {PRAZOS_DIAS.map((dias) => (
              <Button
                key={dias}
                type="button"
                size="sm"
                variant={prazosSelecionados.includes(dias) ? "default" : "outline"}
                onClick={() => togglePrazo(dias)}
              >
                {dias}d
              </Button>
            ))}
          </div>
        </div>
      )}

      {forma === "cartao_parcelado" && (
        <div className="space-y-2">
          <Label>Número de Parcelas</Label>
          <Input
            type="number"
            min={1}
            max={24}
            value={parcelasCartao}
            onChange={(e) => setParcelasCartao(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
      )}

      <p className="text-sm text-muted-foreground">Total do pedido: {formatBRL(valorTotal)}</p>

      <Button type="button" onClick={handleGenerate} className="w-full">
        Registrar Pagamento
      </Button>
    </div>
  )
}
