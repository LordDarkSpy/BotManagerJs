import { GuildMember } from 'discord.js';
/**
 * Verifica se um membro tem o cargo de aprovador de Set
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro pode aprovar Sets
 */
export declare function canApproveSet(member: GuildMember, guildId: string): Promise<boolean>;
/**
 * Verifica se um membro tem o cargo de gestor de cargos
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro pode gerenciar cargos
 */
export declare function canManageCargos(member: GuildMember, guildId: string): Promise<boolean>;
/**
 * Verifica se um membro é administrador do bot
 * @param member - Membro do Discord a ser verificado
 * @param guildId - ID do servidor
 * @returns true se o membro é administrador do bot
 */
export declare function isBotAdmin(member: GuildMember, guildId: string): Promise<boolean>;
/**
 * Verifica se um membro pode alterar o cargo de outro membro
 * Baseado na hierarquia de cargos cadastrada no banco de dados
 * @param executor - Membro que está executando a ação
 * @param alvo - Membro que terá o cargo alterado
 * @param guildId - ID do servidor
 * @returns true se o executor pode alterar o cargo do alvo
 */
export declare function canChangeMemberCargo(executor: GuildMember, alvo: GuildMember, guildId: string): Promise<boolean>;
/**
 * Verifica se um membro pode definir um determinado cargo para outro membro
 * @param executor - Membro que está executando a ação
 * @param cargoId - ID do cargo a ser definido
 * @param guildId - ID do servidor
 * @returns true se o executor pode definir este cargo
 */
export declare function canSetCargo(executor: GuildMember, cargoId: string, guildId: string): Promise<boolean>;
/**
 * Verifica se um usuário está na blacklist
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns Objeto da blacklist se banido, null se não
 */
export declare function checkBlacklist(discordId: string, guildId: string): Promise<{
    motivo: string;
    dataAdicao: Date;
} | null>;
/**
 * Verifica se um usuário está cadastrado como membro
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns Dados do membro se cadastrado, null se não
 */
export declare function getMembro(discordId: string, guildId: string): Promise<({
    cargo: {
        id: string;
        createdAt: Date;
        guildId: string;
        updatedAt: Date;
        nome: string;
        hierarquia: number;
        prefixo: string | null;
        discordRoleId: string | null;
    } | null;
} & {
    id: string;
    createdAt: Date;
    guildId: string;
    updatedAt: Date;
    discordId: string;
    nome: string;
    telefone: string | null;
    idJogo: string | null;
    recrutadorId: string | null;
    recrutadorNome: string | null;
    tipo: import(".prisma/client").$Enums.TipoMembro;
    cargoId: string | null;
    status: import(".prisma/client").$Enums.StatusMembro;
    dataEntrada: Date;
    dataSaida: Date | null;
}) | null>;
/**
 * Verifica se um usuário já tem uma solicitação de Set pendente
 * @param discordId - ID Discord do usuário
 * @param guildId - ID do servidor
 * @returns true se há solicitação pendente
 */
export declare function hasPendingSetRequest(discordId: string, guildId: string): Promise<boolean>;
/**
 * Mensagens de erro para falta de permissão
 */
export declare const PermissionErrors: {
    readonly NOT_ADMIN: "Você não tem permissão de administrador para executar este comando.";
    readonly CANNOT_APPROVE_SET: "Você não tem permissão para aprovar ou reprovar solicitações de Set.";
    readonly CANNOT_MANAGE_CARGOS: "Você não tem permissão para gerenciar cargos de membros.";
    readonly CANNOT_CHANGE_CARGO: "Você não pode alterar o cargo deste membro devido à hierarquia.";
    readonly CANNOT_SET_CARGO: "Você não pode definir este cargo devido à hierarquia.";
    readonly IN_BLACKLIST: "Você está na blacklist e não pode realizar esta ação.";
    readonly NOT_MEMBER: "Você não está cadastrado como membro da organização.";
    readonly ALREADY_MEMBER: "Você já está cadastrado como membro da organização.";
    readonly PENDING_REQUEST: "Você já possui uma solicitação de Set pendente.";
};
//# sourceMappingURL=permissions.d.ts.map