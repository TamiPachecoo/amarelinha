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
import { Textarea } from "@/components/ui/textarea"
import { useCustomersStore } from "@/features/customers/store/customersStore"
import {
  createMalinhaSchema,
  type CreateMalinhaFormValues,
} from "@/features/malinhas/schemas/malinhaSchema"

interface CreateMalinhaFormProps {
  onSubmit: (values: CreateMalinhaFormValues) => void
  onCancel: () => void
}

export function CreateMalinhaForm({ onSubmit, onCancel }: CreateMalinhaFormProps) {
  const customers = useCustomersStore((state) => state.customers)

  const form = useForm<CreateMalinhaFormValues>({
    resolver: zodResolver(createMalinhaSchema),
    defaultValues: { clienteId: "", previsaoDevolucao: "", observacoes: "" },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-4">
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

        <FormField
          control={form.control}
          name="previsaoDevolucao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Previsão de Devolução (opcional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Combinado com a cliente..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Criar Malinha</Button>
        </div>
      </form>
    </Form>
  )
}
