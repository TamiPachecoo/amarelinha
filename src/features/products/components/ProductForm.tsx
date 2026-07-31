import { useState } from "react"
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
import { useLocationsStore } from "@/features/locations/store/locationsStore"
import {
  productSchema,
  type ProductFormInput,
  type ProductFormValues,
} from "@/features/products/schemas/productSchema"

interface ProductFormProps {
  onSubmit: (values: ProductFormValues) => void
  onCancel: () => void
}

export function ProductForm({ onSubmit, onCancel }: ProductFormProps) {
  const locations = useLocationsStore((state) => state.locations)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const form = useForm<ProductFormInput, unknown, ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nome: "",
      sku: "",
      categoria: "",
      marca: "",
      precoVenda: undefined,
      cor: "",
      tamanho: "",
      localizacaoId: "",
      quantidade: undefined,
      estoqueMinimo: undefined,
      foto: undefined,
    },
  })

  async function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhotoPreview(null)
      form.setValue("foto", undefined, { shouldDirty: true })
      return
    }

    if (!file.type.startsWith("image/")) {
      form.setError("foto", { message: "Selecione uma imagem válida." })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      form.setError("foto", { message: "A imagem deve ter no máximo 5 MB." })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      setPhotoPreview(result)
      form.clearErrors("foto")
      form.setValue("foto", result ?? undefined, { shouldDirty: true })
    }
    reader.readAsDataURL(file)
  }

  function handleCancel() {
    form.reset()
    setPhotoPreview(null)
    onCancel()
  }

  function handleSubmit(values: ProductFormValues) {
    onSubmit(values)
    form.reset()
    setPhotoPreview(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Vestido Floral Manga Curta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="VST-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Amarelinha Kids" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <FormControl>
                <Input placeholder="Vestidos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <Input placeholder="Rosa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tamanho"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho</FormLabel>
                <FormControl>
                  <Input placeholder="4" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="foto"
          render={() => (
            <FormItem>
              <FormLabel>Foto do produto</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handlePhotoChange(event.target.files?.[0] ?? null)}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Envie uma imagem JPG, PNG ou WEBP de até 5 MB.
              </p>
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Pré-visualização da foto do produto"
                  className="mt-2 max-h-40 rounded-md border border-border object-cover"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="localizacaoId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Localização</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione uma localização" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="precoVenda"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço de Venda</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="129.90"
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
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="10"
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
            name="estoqueMinimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estoque Mínimo</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="3"
                    {...field}
                    value={field.value as string | number}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Produto</Button>
        </div>
      </form>
    </Form>
  )
}
