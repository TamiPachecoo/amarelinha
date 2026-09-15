import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import { useProductsStore } from "@/features/products/store/productsStore"
import { formatBRL, totalQuantidade } from "@/features/products/utils"
import { useSalesStore } from "@/features/sales/store/salesStore"
import {
  saleSchema,
  type SaleFormInput,
  type SaleFormValues,
} from "@/features/sales/schemas/saleSchema"
import { formaPagamentoLabel } from "@/features/sales/types"

interface SaleFormProps {
  clienteId?: string
  onSuccess: () => void
  onCancel: () => void
}

export function SaleForm({ clienteId, onSuccess, onCancel }: SaleFormProps) {
  const customers = useCustomersStore((state) => state.customers)
  const products = useProductsStore((state) => state.products)
  const registerSales = useSalesStore((state) => state.registerSales)
  const [items, setItems] = useState<Array<SaleFormValues & { precoUnitario: number; nome: string }>>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<SaleFormInput, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clienteId: clienteId ?? "",
      productId: "",
      variantId: "",
      quantidade: 1,
      formaPagamento: "pix",
      emPromocao: false,
      precoPromocional: undefined,
    },
  })

  const selectedProductId = form.watch("productId")
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableVariants = selectedProduct?.variants.filter((v) => v.quantidade > 0) ?? []
  const emPromocao = form.watch("emPromocao")
  const selectedQuantity = Number(form.watch("quantidade")) || 0
  const previewPrice = emPromocao && Number(form.watch("precoPromocional")) > 0
    ? Number(form.watch("precoPromocional")) : selectedProduct?.precoVenda ?? 0
  const total = items.reduce((sum, item) => sum + item.precoUnitario * item.quantidade, 0)

  useEffect(() => {
    if (selectedProduct?.emPromocao && selectedProduct.precoPromocional) {
      form.setValue("emPromocao", true)
      form.setValue("precoPromocional", selectedProduct.precoPromocional)
    } else {
      form.setValue("emPromocao", false)
      form.setValue("precoPromocional", undefined)
    }
  }, [selectedProduct, form])

  function addItem(values: SaleFormValues) {
    const product = products.find((p) => p.id === values.productId)
    if (!product) {
      setSubmitError("Produto selecionado não encontrado.")
      return
    }

    const variant = product.variants.find((v) => v.id === values.variantId)
    const alreadyAdded = items.filter((item) => item.variantId === values.variantId)
      .reduce((sum, item) => sum + item.quantidade, 0)
    if (!variant || values.quantidade + alreadyAdded > variant.quantidade) {
      setSubmitError("Quantidade maior que o estoque disponível para esta variante.")
      return
    }
    const precoUnitario = values.emPromocao && values.precoPromocional
      ? values.precoPromocional : product.precoVenda
    if (!Number.isFinite(precoUnitario) || precoUnitario <= 0) {
      setSubmitError("Informe um valor de venda válido para este produto.")
      return
    }
    setSubmitError(null)
    setItems((current) => [...current, { ...values, precoUnitario, nome: product.nome }])
    form.reset({
      ...values,
      productId: "",
      variantId: "",
      quantidade: 1,
      emPromocao: false,
      precoPromocional: undefined,
    })
  }

  async function saveSale() {
    if (!items.length) return
    const available = useProductsStore.getState().products
    for (const item of items) {
      const variant = available.flatMap((product) => product.variants).find((v) => v.id === item.variantId)
      const count = items.filter((other) => other.variantId === item.variantId)
        .reduce((sum, other) => sum + other.quantidade, 0)
      if (!variant || count > variant.quantidade) {
        setSubmitError("O estoque mudou. Remova ou ajuste os produtos e tente novamente.")
        return
      }
    }
    setSubmitError(null)
    setIsSubmitting(true)
    const result = await registerSales(items.map(({ nome: _nome, ...item }) => item))
    setIsSubmitting(false)
    if (!result.success) {
      setSubmitError(result.error ?? "Não foi possível registrar a venda.")
      return
    }
    setItems([])
    form.reset()
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(addItem)} noValidate className="space-y-4">
        {!clienteId && (
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={items.length > 0}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.nomeCompleto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="productId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Produto</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value)
                  form.setValue("variantId", "")
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {products
                    .filter((p) => totalQuantidade(p) > 0)
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="variantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Variante</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedProduct}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a variante" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableVariants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.cor} · {variant.tamanho} ({variant.quantidade} disponíveis)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    value={field.value as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="formaPagamento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Forma de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={items.length > 0}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(formaPagamentoLabel).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {selectedProduct && (
          <p className="text-sm text-muted-foreground">
            Valor de venda: {formatBRL(selectedProduct.precoVenda)} · Subtotal: {formatBRL(previewPrice * selectedQuantity)}
            {selectedProduct.emPromocao && " · 🏷️ este produto está em promoção"}
          </p>
        )}

        <FormField
          control={form.control}
          name="emPromocao"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <FormLabel className="mb-0">🏷️ Vendido em promoção</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {emPromocao && (
          <FormField
            control={form.control}
            name="precoPromocional"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Promocional</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Preço com desconto"
                    {...field}
                    value={field.value as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {submitError && (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {submitError}
          </p>
        )}

        {items.length > 0 && (
          <div className="space-y-2 rounded-lg border border-border p-3 text-sm">
            <p className="font-semibold">Produtos desta venda ({items.length})</p>
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2">
                <span>{item.quantidade} × {item.nome} · {formatBRL(item.precoUnitario)} cada</span>
                <button type="button" className="text-destructive underline" onClick={() => setItems((current) => current.filter((_, i) => i !== index))}>Remover</button>
              </div>
            ))}
            <p className="font-bold">Total: {formatBRL(total)}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="outline" disabled={isSubmitting}>Adicionar Produto</Button>
          <Button type="button" onClick={saveSale} disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? "Registrando..." : `Registrar Venda (${formatBRL(total)})`}
          </Button>
        </div>
      </form>
    </Form>
  )
}
