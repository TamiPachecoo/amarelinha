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
import { totalQuantidade } from "@/features/products/utils"
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
  const registerSale = useSalesStore((state) => state.registerSale)
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

  useEffect(() => {
    if (selectedProduct?.emPromocao && selectedProduct.precoPromocional) {
      form.setValue("emPromocao", true)
      form.setValue("precoPromocional", selectedProduct.precoPromocional)
    }
  }, [selectedProduct, form])

  async function handleSubmit(values: SaleFormValues) {
    const product = products.find((p) => p.id === values.productId)
    if (!product) {
      setSubmitError("Produto selecionado não encontrado.")
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    const precoUnitario =
      values.emPromocao && values.precoPromocional ? values.precoPromocional : product.precoVenda

    const result = await registerSale({ ...values, precoUnitario })
    setIsSubmitting(false)

    if (!result.success) {
      setSubmitError(result.error ?? "Não foi possível registrar a venda. Tente novamente.")
      return
    }

    form.reset({
      clienteId: clienteId ?? "",
      productId: "",
      variantId: "",
      quantidade: 1,
      formaPagamento: "pix",
      emPromocao: false,
      precoPromocional: undefined,
    })
    onSuccess()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
        {!clienteId && (
          <FormField
            control={form.control}
            name="clienteId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
                <Select onValueChange={field.onChange} value={field.value}>
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
            Preço de tabela: {selectedProduct.precoVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
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

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Registrando..." : "Registrar Venda"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
