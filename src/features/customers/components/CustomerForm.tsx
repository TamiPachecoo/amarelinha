import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2 } from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import type { Customer } from "@/features/customers/types"
import {
  customerSchema,
  type CustomerFormInput,
  type CustomerFormValues,
} from "@/features/customers/schemas/customerSchema"
import type { ChildFormValues } from "@/features/customers/schemas/childSchema"

interface CustomerFormProps {
  initialValues?: Customer
  onSubmit: (values: CustomerFormValues, filhos: ChildFormValues[]) => void
  onCancel: () => void
}

const emptyChild: ChildFormValues = {
  nome: "",
  sexo: "feminino",
  dataNascimento: "",
  tamanhoRoupa: "",
  observacoes: "",
}

export function CustomerForm({ initialValues, onSubmit, onCancel }: CustomerFormProps) {
  const form = useForm<CustomerFormInput, unknown, CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialValues ?? {
      nomeCompleto: "",
      whatsapp: "",
      email: "",
      instagram: "",
      facebook: "",
      cpf: "",
      endereco: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
      },
      observacoes: "",
      ativo: true,
      limiteCredito: 0,
      dataVencimento: "",
    },
  })

  const [filhos, setFilhos] = useState<ChildFormValues[]>([])
  const [novoFilho, setNovoFilho] = useState<ChildFormValues>(emptyChild)

  function handleAddFilho() {
    if (!novoFilho.nome || !novoFilho.dataNascimento) return
    setFilhos((prev) => [...prev, novoFilho])
    setNovoFilho(emptyChild)
  }

  function handleRemoveFilho(index: number) {
    setFilhos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(values: CustomerFormValues) {
    onSubmit(values, filhos)
    form.reset()
    setFilhos([])
    setNovoFilho(emptyChild)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <FormField
          control={form.control}
          name="nomeCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="Ana Paula Souza" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(31) 99876-5432" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="ana@exemplo.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="123.456.789-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="@anapaula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="ana.paula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-sm font-semibold text-foreground">Endereço</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="endereco.cep"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="30140-071" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número</FormLabel>
                <FormControl>
                  <Input placeholder="1200" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.logradouro"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Logradouro</FormLabel>
                <FormControl>
                  <Input placeholder="Rua da Bahia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.complemento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Complemento (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Apto 302" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.bairro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Funcionários" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.cidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Belo Horizonte" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endereco.estado"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado (UF)</FormLabel>
                <FormControl>
                  <Input placeholder="MG" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <p className="text-sm font-semibold text-foreground">Conta do Cliente</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="limiteCredito"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de Crédito</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
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
            name="dataVencimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Vencimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Preferências, particularidades..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <FormLabel className="mb-0">Cliente ativo</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {!initialValues && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Filhos (opcional)</p>

            {filhos.length > 0 && (
              <ul className="space-y-1">
                {filhos.map((filho, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {filho.nome} · {filho.sexo === "feminino" ? "Feminino" : "Masculino"} ·{" "}
                      {filho.dataNascimento}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFilho(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-dashed border-input p-3">
              <Input
                placeholder="Nome"
                value={novoFilho.nome}
                onChange={(e) => setNovoFilho((prev) => ({ ...prev, nome: e.target.value }))}
              />
              <Select
                value={novoFilho.sexo}
                onValueChange={(v) => setNovoFilho((prev) => ({ ...prev, sexo: v as "feminino" | "masculino" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={novoFilho.dataNascimento}
                onChange={(e) => setNovoFilho((prev) => ({ ...prev, dataNascimento: e.target.value }))}
              />
              <Input
                placeholder="Tamanho de roupa"
                value={novoFilho.tamanhoRoupa}
                onChange={(e) => setNovoFilho((prev) => ({ ...prev, tamanhoRoupa: e.target.value }))}
              />
              <Button type="button" variant="outline" onClick={handleAddFilho}>
                <Plus className="size-4" />
                Adicionar Filho(a)
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Cliente</Button>
        </div>
      </form>
    </Form>
  )
}
