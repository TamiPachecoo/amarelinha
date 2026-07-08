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

  const form = useForm<SaleFormInput, unknown, SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      clienteId: clienteId ?? "",
      productId: "",
      variantId: "",
      quantidade: 1,
      formaPagamento: "pix",
    },
  })

  const selectedProductId = form.watch("productId")
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableVariants = selectedProduct?.variants.filter((v) => v.quantidade > 0) ?? []

  function handleSubmit(values: SaleFormValues) {
    const product = products.find((p) => p.id === values.productId)
    if (!product) return

    registerSale({ ...values, precoUnitario: product.precoVenda })
    form.reset({
      clienteId: clienteId ?? "",
      productId: "",
      variantId: "",
      quantidade: 1,
      formaPagamento: "pix",
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
            Preço unitário: {selectedProduct.precoVenda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Registrar Venda</Button>
        </div>
      </form>
    </Form>
  )
}
