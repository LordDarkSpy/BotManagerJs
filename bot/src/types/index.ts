// =============================================================================
// BotManagerJs - Tipos e Interfaces TypeScript
// =============================================================================
// Este arquivo contém todas as definições de tipos utilizadas pelo bot.
// Centralizar os tipos aqui facilita a manutenção e garante consistência.
// =============================================================================

import {
  ChatInputCommandInteraction,
  ButtonInteraction,
  ModalSubmitInteraction,
  StringSelectMenuInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  Client,
  Collection,
} from 'discord.js';

// =============================================================================
// Tipos de Comandos
// =============================================================================

/**
 * Interface para definição de um comando slash
 * Cada comando deve implementar esta interface
 */
export interface SlashCommand {
  /** Dados do comando (nome, descrição, opções) */
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  
  /** Função executada quando o comando é chamado */
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  
  /** Cooldown do comando em segundos (opcional) */
  cooldown?: number;
  
  /** Se o comando requer permissões de administrador (opcional) */
  adminOnly?: boolean;
}

// =============================================================================
// Tipos de Interações
// =============================================================================

/**
 * Tipos de interações que o bot pode receber
 */
export type BotInteraction =
  | ChatInputCommandInteraction
  | ButtonInteraction
  | ModalSubmitInteraction
  | StringSelectMenuInteraction;

/**
 * Handler para interações de botão
 */
export interface ButtonHandler {
  /** ID customizado do botão (pode ser padrão regex) */
  customId: string | RegExp;
  
  /** Função executada quando o botão é clicado */
  execute: (interaction: ButtonInteraction) => Promise<void>;
}

/**
 * Handler para submissão de modais
 */
export interface ModalHandler {
  /** ID customizado do modal (pode ser padrão regex) */
  customId: string | RegExp;
  
  /** Função executada quando o modal é submetido */
  execute: (interaction: ModalSubmitInteraction) => Promise<void>;
}

/**
 * Handler para menus de seleção
 */
export interface SelectMenuHandler {
  /** ID customizado do menu (pode ser padrão regex) */
  customId: string | RegExp;
  
  /** Função executada quando uma opção é selecionada */
  execute: (interaction: StringSelectMenuInteraction) => Promise<void>;
}

// =============================================================================
// Tipos de Eventos
// =============================================================================

/**
 * Interface para definição de eventos do bot
 */
export interface BotEvent {
  /** Nome do evento do Discord.js */
  name: string;
  
  /** Se o evento deve ser executado apenas uma vez */
  once?: boolean;
  
  /** Função executada quando o evento ocorre */
  execute: (...args: unknown[]) => Promise<void> | void;
}

// =============================================================================
// Tipos de Dados
// =============================================================================

/**
 * Dados do formulário de solicitação de Set
 */
export interface SetFormData {
  nome: string;
  telefone: string;
  idJogo: string;
  recrutador: string;
  tipo: 'ADULTO' | 'BABY';
}

/**
 * Dados do formulário de ausência
 */
export interface AusenciaFormData {
  dataInicio: string;
  dataFim: string;
  motivo?: string;
}

/**
 * Dados do formulário de FGTS
 */
export interface FgtsFormData {
  valor: string;
  observacao?: string;
}



/**
 * Dados para criação/atualização de cargo
 */
export interface CargoData {
  nome: string;
  hierarquia: number;
  discordRoleId?: string;
  cor?: string;
}

// =============================================================================
// Tipos de Configuração
// =============================================================================

/**
 * Configuracoes do bot carregadas do banco de dados
 */
export interface BotConfig {
  guildId: string;
  botName?: string;
  botDescription?: string;
  botImage?: string;
  canalAprovacaoSet?: string;
  canalFgts?: string;
  canalAusencia?: string;
  canalLogs?: string;
  cargoAprovadorSet?: string;
  cargoGestorCargos?: string;
  cargoAdministrador?: string;
}

// =============================================================================
// Tipos de Resposta
// =============================================================================

/**
 * Resultado padrão de operações
 */
export interface OperationResult<T = void> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Resultado de paginação
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// Extensão do Client do Discord.js
// =============================================================================

/**
 * Interface estendida do Client do Discord.js
 * Adiciona propriedades personalizadas ao client
 */
export interface ExtendedClient extends Client {
  /** Coleção de comandos slash registrados */
  commands: Collection<string, SlashCommand>;
  
  /** Coleção de cooldowns ativos */
  cooldowns: Collection<string, Collection<string, number>>;
}

// =============================================================================
// Tipos de Log
// =============================================================================

/**
 * Tipos de ações que podem ser logadas
 */
export type LogAction =
  | 'SET_SOLICITADO'
  | 'SET_APROVADO'
  | 'SET_REPROVADO'
  | 'CARGO_ALTERADO'
  | 'CARGO_CRIADO'
  | 'CARGO_REMOVIDO'
  | 'AUSENCIA_REGISTRADA'
  | 'AUSENCIA_FINALIZADA'
  | 'FGTS_PAGO'
  | 'BLACKLIST_ADICIONADO'
  | 'BLACKLIST_REMOVIDO'
  | 'MEMBRO_BANIDO'
  | 'MEMBRO_DESBANIDO'
  | 'CONFIG_ALTERADA'
  | 'PUNICAO_APLICADA'
  | 'PUNICAO_REMOVIDA';

/**
 * Dados para criação de log
 */
export interface LogData {
  guildId: string;
  acao: LogAction;
  detalhes?: string;
  executorId: string;
  executorNome?: string;
  alvoId?: string;
  alvoNome?: string;
}

// =============================================================================
// Tipos de Embed
// =============================================================================

/**
 * Cores padrão para embeds
 */
export const EmbedColors = {
  SUCCESS: 0x00ff00,   // Verde - Sucesso
  ERROR: 0xff0000,     // Vermelho - Erro
  WARNING: 0xffff00,   // Amarelo - Aviso
  INFO: 0x0099ff,      // Azul - Informação
  PENDING: 0xff9900,   // Laranja - Pendente
  NEUTRAL: 0x808080,   // Cinza - Neutro
  PRIMARY: 0x5865f2,   // Azul Discord - Primário
} as const;

export type EmbedColor = typeof EmbedColors[keyof typeof EmbedColors];

// =============================================================================
// Tipos Utilitários
// =============================================================================

/**
 * Tipo para extrair o ID de uma interação de botão
 * Formato esperado: "acao_tipo_id"
 */
export interface ParsedButtonId {
  action: string;
  type?: string;
  id?: string;
}

/**
 * Tipo para datas no formato brasileiro
 */
export type BrazilianDate = `${number}/${number}/${number}`;

/**
 * Função auxiliar para parsear IDs de botões
 * @param customId - ID customizado do botão
 * @returns Objeto com as partes do ID parseadas
 */
export function parseButtonId(customId: string): ParsedButtonId {
  const parts = customId.split('_');
  return {
    action: parts[0] || '',
    type: parts[1],
    id: parts.slice(2).join('_'),
  };
}
