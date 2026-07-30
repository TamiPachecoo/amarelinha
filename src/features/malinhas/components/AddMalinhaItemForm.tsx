import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"

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
import { useProductsStore } from "@/features/products/store/productsStore"
import { totalQuantidade } from "@/features/products/utils"
import {
  makeAddMalinhaItemSchema,
  type AddMalinhaItemFormInput,
  type AddMalinhaItemFormValues,
} from "@/features/malinhas/schemas/malinhaSchema"

interface AddMalinhaItemFormProps {
  onAdd: (values: AddMalinhaItemFormValues) => void
}

export function AddMalinhaItemForm({ onAdd }: AddMalinhaItemFormProps) {
  const products = useProductsStore((state) => state.products)

  const form = useForm<AddMalinhaItemFormInput, unknown, AddMalinhaItemFormValues>({
    resolver: zodResolver(makeAddMalinhaItemSchema(9999)),
    defaultValues: { productId: "", variantId: "", quantidade: 1 },
  })

  const selectedProductId = form.watch("productId")
  const selectedVariantId = form.watch("variantId")
  const selectedProduct = products.find((p) => p.id === selectedProductId)
  const availableVariants = selectedProduct?.variants.filter((v) => v.quantidade > 0) ?? []
  const selectedVariant = availableVariants.find((v) => v.id === selectedVariantId)

  const schema = useMemo(
    () => makeAddMalinhaItemSchema(Math.max(1, selectedVariant?.quantidade ?? 1)),
    [selectedVariant]
  )

  function handleSubmit(values: AddMalinhaItemFormValues) {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      form.setError("quantidade", { message: parsed.error.issues[0]?.message })
      return
    }
    onAdd(parsed.data)
    form.reset({ productId: "", variantId: "", quantidade: 1 })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-3">
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
                  max={selectedVariant?.quantidade}
                  {...field}
                  value={field.value as string | number}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={!selectedVariant}>
          <Plus className="size-4" />
          Adicionar à Malinha
        </Button>
      </form>
    </Form>
  )
}
