import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FileText, Upload } from "lucide-react"

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
import type { Collection } from "@/features/collections/types"
import {
  collectionSchema,
  type CollectionFormInput,
  type CollectionFormValues,
} from "@/features/collections/schemas/collectionSchema"
import { useSuppliersStore } from "@/features/suppliers/store/suppliersStore"

interface CollectionFormProps {
  initialValues?: Collection
  onSubmit: (values: CollectionFormValues, catalogoPdf: File | null) => void
  onCancel: () => void
}

export function CollectionForm({ initialValues, onSubmit, onCancel }: CollectionFormProps) {
  const suppliers = useSuppliersStore((state) => state.suppliers)
  const [catalogoPdf, setCatalogoPdf] = useState<File | null>(null)

  const form = useForm<CollectionFormInput, unknown, CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: initialValues ?? {
      supplierId: "",
      nome: "",
      temporada: "",
      ano: new Date().getFullYear() + 1,
      status: "planejada",
      dataImportacao: "",
    },
  })

  function handleSubmit(values: CollectionFormValues) {
    onSubmit(values, catalogoPdf)
    form.reset()
    setCatalogoPdf(null)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fornecedor</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o fornecedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.nome}
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
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da Coleção</FormLabel>
              <FormControl>
                <Input placeholder="Verão 2027" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="temporada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temporada</FormLabel>
                <FormControl>
                  <Input placeholder="Verão, Inverno, Natal..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ano"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ano</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as string | number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataImportacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Importação do Catálogo (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium leading-none" htmlFor="catalogo-pdf-input">
            Catálogo (PDF ou imagem, opcional)
          </label>
          <label
            htmlFor="catalogo-pdf-input"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-input px-3 py-3 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/50"
          >
            {catalogoPdf ? (
              <>
                <FileText className="size-5 shrink-0 text-foreground" />
                <span className="truncate text-foreground">{catalogoPdf.name}</span>
              </>
            ) : initialValues?.catalogoPdfNome ? (
              <>
                <FileText className="size-5 shrink-0 text-foreground" />
                <span className="truncate text-foreground">
                  {initialValues.catalogoPdfNome} (clique para substituir)
                </span>
              </>
            ) : (
              <>
                <Upload className="size-5 shrink-0" />
                <span>Clique para escolher um PDF ou uma imagem do computador</span>
              </>
            )}
          </label>
          <input
            id="catalogo-pdf-input"
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => setCatalogoPdf(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Coleção</Button>
        </div>
      </form>
    </Form>
  )
}
