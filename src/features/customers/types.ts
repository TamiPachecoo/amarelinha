export type Sexo = "feminino" | "masculino"

export interface Child {
  id: string
  nome: string
  sexo: Sexo
  dataNascimento: string
  tamanhoRoupa: string
  numeracaoCalcado: string
  observacoes?: string
}

export interface Address {
  cep: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
}

export interface PaymentRecord {
  id: string
  data: string
  valor: number
  observacao?: string
}

export interface Customer {
  id: string
  nomeCompleto: string
  whatsapp: string
  email: string
  instagram?: string
  facebook?: string
  cpf?: string
  endereco: Address
  observacoes?: string
  clienteDesde: string
  ativo: boolean
  filhos: Child[]
  limiteCredito: number
  dataVencimento: string
  historicoPagamentos: PaymentRecord[]
}
