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
import { Textarea } from "@/components/ui/textarea"
import {
  paymentSchema,
  type PaymentFormInput,
  type PaymentFormValues,
} from "@/features/customers/schemas/paymentSchema"

interface RegisterPaymentFormProps {
  onSubmit: (values: PaymentFormValues) => void
  onCancel: () => void
}

export function RegisterPaymentForm({ onSubmit, onCancel }: RegisterPaymentFormProps) {
  const form = useForm<PaymentFormInput, unknown, PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      valor: undefined,
      data: new Date().toISOString().slice(0, 10),
      observacao: "",
    },
  })

  function handleSubmit(values: PaymentFormValues) {
    onSubmit(values)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="space-y-4">
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Pago</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="80.00"
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
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Pagamento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observação (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="PIX, dinheiro na loja..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Registrar Pagamento</Button>
        </div>
      </form>
    </Form>
  )
}
