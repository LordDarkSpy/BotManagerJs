import { GuildMember } from 'discord.js';

/**
 * Atualiza o nickname do membro seguindo o padrao [prefixo] nome | ID
 */
export async function atualizarNickname(
  member: GuildMember,
  prefixo: string | null | undefined,
  nome: string,
  id: string
): Promise<boolean> {
  try {
    const partes: string[] = [];
    
    if (prefixo) {
      partes.push(prefixo);
    }
    
    partes.push(nome);
    partes.push('|');
    partes.push(id);
    
    const novoNickname = partes.join(' ').substring(0, 32);
    
    await member.setNickname(novoNickname);
    console.log(`[Nickname] Atualizado para: ${novoNickname}`);
    return true;
  } catch (error) {
    console.error('[Nickname] Erro ao atualizar:', error);
    return false;
  }
}