/**
 * Store Settings — o app é escrito para suportar múltiplas lojas (tenants)
 * no futuro. Hoje existe apenas uma configuração ativa (Amarelinha Kids),
 * mas nome, logo e cores já vêm daqui em vez de hardcoded nos componentes.
 * Uma segunda loja, no futuro, significa um novo registro aqui (ou uma
 * linha na tabela `stores`), não uma alteração de código.
 */
export interface StoreSettings {
  id: string
  nomeExibicao: string
  nomeCurto: string
  logoUrl: string
  versao: string
}

export const storeSettings: StoreSettings = {
  id: "amarelinha-kids",
  nomeExibicao: "Amarelinha Gestor",
  nomeCurto: "Amarelinha",
  logoUrl: "/logo-icon.png",
  versao: "v1.0",
}
